/**
 * SVG Parser Utility
 *
 * Parses backend-generated SVG floor plans into structured CAD elements
 * for rendering with Konva.js
 */

import type {
  CADElement,
  CADElementType,
  CADLayer,
  Point2D,
  SpaceElement,
} from "@/types/cad";

// =============================================================================
// Parser Types
// =============================================================================

interface ParsedSVG {
  width: number;
  height: number;
  viewBox: { x: number; y: number; width: number; height: number } | null;
  elements: CADElement[];
  gridX: number[];
  gridY: number[];
  gridLabelsX: string[];
  gridLabelsY: string[];
}

// =============================================================================
// Layer Detection
// =============================================================================

type LayerHint = CADLayer | "mep";

function layerFromGroupClass(className: string): LayerHint | null {
  const lower = className.toLowerCase();
  if (lower.includes("layer-arch")) return "architectural";
  if (lower.includes("layer-struct")) return "structural";
  if (lower.includes("layer-mep")) return "mep";
  if (lower.includes("layer-axes")) return "grid";
  if (lower.includes("layer-dims")) return "dimensions";
  if (lower.includes("layer-legend")) return "annotations";
  return null;
}

function findAncestorLayer(element: Element): LayerHint | null {
  let current: Element | null = element;
  while (current) {
    const dataLayer = current.getAttribute("data-layer");
    if (dataLayer) {
      return dataLayer as CADLayer;
    }
    const className = current.getAttribute("class") || "";
    const hint = layerFromGroupClass(className);
    if (hint) return hint;
    current = current.parentElement;
  }
  return null;
}

function normalizeColor(value: string | null): string {
  return String(value || "").trim().toLowerCase();
}

function hasColor(haystack: string, colors: string[]): boolean {
  return colors.some((color) => haystack.includes(color));
}

function inferMepLayer(element: Element): CADLayer {
  const stroke = normalizeColor(element.getAttribute("stroke"));
  const fill = normalizeColor(element.getAttribute("fill"));
  const combined = `${stroke} ${fill}`;

  const electricalColors = ["#d97927", "#fde8d1"];
  const plumbingColors = ["#d95c5c", "#2b77c3", "#4d9c6f", "#8d8d8d", "#c0392b"];
  const hvacColors = ["#2d6f8e", "#dceef4"];

  if (hasColor(combined, electricalColors)) return "mep-electrical";
  if (hasColor(combined, plumbingColors)) return "mep-plumbing";
  if (hasColor(combined, hvacColors)) return "mep-hvac";

  return "mep-hvac";
}

function detectLayer(element: Element): CADLayer {
  const className = element.getAttribute("class") || "";
  const stroke = normalizeColor(element.getAttribute("stroke"));
  const fill = normalizeColor(element.getAttribute("fill"));
  const combined = `${stroke} ${fill}`;

  const ancestorLayer = findAncestorLayer(element);
  if (ancestorLayer) {
    return ancestorLayer === "mep" ? inferMepLayer(element) : ancestorLayer;
  }

  // Check class names
  const lowerClass = className.toLowerCase();
  if (lowerClass.includes("wall") || lowerClass.includes("outline")) {
    return "architectural";
  }
  if (lowerClass.includes("column") || lowerClass.includes("beam") || lowerClass.includes("structural")) {
    return "structural";
  }
  if (lowerClass.includes("hvac") || lowerClass.includes("duct")) {
    return "mep-hvac";
  }
  if (lowerClass.includes("electrical") || lowerClass.includes("panel")) {
    return "mep-electrical";
  }
  if (lowerClass.includes("plumbing") || lowerClass.includes("pipe") || lowerClass.includes("riser")) {
    return "mep-plumbing";
  }
  if (lowerClass.includes("grid") || lowerClass.includes("axis")) {
    return "grid";
  }
  if (lowerClass.includes("dimension") || lowerClass.includes("dim")) {
    return "dimensions";
  }
  if (lowerClass.includes("annotation") || lowerClass.includes("label") || lowerClass.includes("text")) {
    return "annotations";
  }
  if (lowerClass.includes("furniture") || lowerClass.includes("equipment")) {
    return "furniture";
  }

  // Check stroke colors
  if (stroke.includes("#ff0000") || stroke.includes("red")) {
    return "structural";
  }
  if (stroke.includes("#00ffff") || stroke.includes("cyan")) {
    return "mep-hvac";
  }
  if (stroke.includes("#ff00ff") || stroke.includes("magenta")) {
    return "mep-electrical";
  }
  if (stroke.includes("#0000ff") || stroke.includes("blue")) {
    return "mep-plumbing";
  }
  if (hasColor(combined, ["#8a5a3c", "#6d4a34", "#6f4f38"])) {
    return "structural";
  }
  if (hasColor(combined, ["#2d6f8e", "#dceef4", "#d97927", "#fde8d1", "#d95c5c", "#2b77c3", "#4d9c6f", "#8d8d8d", "#c0392b"])) {
    return inferMepLayer(element);
  }

  return "architectural";
}

// =============================================================================
// Element Type Detection
// =============================================================================

function detectElementType(element: Element): CADElementType {
  const className = element.getAttribute("class") || "";
  const id = element.getAttribute("id") || "";
  const dataType = element.getAttribute("data-type");

  if (dataType) {
    return dataType as CADElementType;
  }

  const lowerClass = className.toLowerCase();
  const lowerId = id.toLowerCase();

  if (lowerClass.includes("wall") || lowerId.includes("wall")) return "wall";
  if (lowerClass.includes("door") || lowerId.includes("door")) return "door";
  if (lowerClass.includes("window") || lowerId.includes("window")) return "window";
  if (lowerClass.includes("column") || lowerId.includes("column")) return "column";
  if (lowerClass.includes("beam") || lowerId.includes("beam")) return "beam";
  if (lowerClass.includes("space") || lowerId.includes("space")) return "space";
  if (lowerClass.includes("core") || lowerId.includes("core")) return "core";
  if (lowerClass.includes("stair") || lowerId.includes("stair")) return "stairs";
  if (lowerClass.includes("elevator") || lowerId.includes("elevator")) return "elevator";
  if (lowerClass.includes("duct") || lowerId.includes("duct")) return "duct";
  if (lowerClass.includes("pipe") || lowerId.includes("pipe")) return "pipe";
  if (lowerClass.includes("grid") || lowerId.includes("grid")) return "grid-line";
  if (lowerClass.includes("dimension") || lowerId.includes("dim")) return "dimension";
  if (lowerClass.includes("text") || lowerId.includes("text") || lowerId.includes("label")) return "text";

  // Default based on element type
  const tagName = element.tagName.toLowerCase();
  if (tagName === "text" || tagName === "tspan") return "text";
  if (tagName === "rect") return "space";
  if (tagName === "line" || tagName === "polyline" || tagName === "path") return "wall";

  return "wall";
}

// =============================================================================
// Coordinate Parsing
// =============================================================================

function parsePoints(pointsAttr: string): Point2D[] {
  const points: Point2D[] = [];
  const pairs = pointsAttr.trim().split(/\s+/);

  for (const pair of pairs) {
    const [x, y] = pair.split(",").map(Number);
    if (!isNaN(x) && !isNaN(y)) {
      points.push({ x, y });
    }
  }

  return points;
}

// =============================================================================
// Element Parsers
// =============================================================================

function parseLine(element: Element, index: number): CADElement | null {
  const x1 = parseFloat(element.getAttribute("x1") || "0");
  const y1 = parseFloat(element.getAttribute("y1") || "0");
  const x2 = parseFloat(element.getAttribute("x2") || "0");
  const y2 = parseFloat(element.getAttribute("y2") || "0");

  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  return {
    id: element.getAttribute("id") || `line-${index}`,
    type,
    layer,
    points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
    bounds: {
      minX: Math.min(x1, x2),
      minY: Math.min(y1, y2),
      maxX: Math.max(x1, x2),
      maxY: Math.max(y1, y2),
    },
    properties: {
      stroke: element.getAttribute("stroke") || "#FFFFFF",
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };
}

function parseRect(element: Element, index: number): CADElement | null {
  const x = parseFloat(element.getAttribute("x") || "0");
  const y = parseFloat(element.getAttribute("y") || "0");
  const width = parseFloat(element.getAttribute("width") || "0");
  const height = parseFloat(element.getAttribute("height") || "0");

  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return null;
  if (width === 0 || height === 0) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  const baseElement: CADElement = {
    id: element.getAttribute("id") || `rect-${index}`,
    type,
    layer,
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
    ],
    bounds: {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    },
    properties: {
      width,
      height,
      fill: element.getAttribute("fill"),
      stroke: element.getAttribute("stroke"),
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    fillColor: element.getAttribute("fill") || "transparent",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };

  // Handle space elements specially
  if (type === "space" || type === "core") {
    const spaceElement: SpaceElement = {
      ...baseElement,
      type: "space",
      name: element.getAttribute("data-name") || element.getAttribute("id") || `Space ${index}`,
      area: width * height,
      spaceType: element.getAttribute("data-space-type") || "general",
      requiresDaylight: element.getAttribute("data-daylight") === "true",
    };
    return spaceElement;
  }

  return baseElement;
}

function parsePolyline(element: Element, index: number): CADElement | null {
  const pointsAttr = element.getAttribute("points");
  if (!pointsAttr) return null;

  const points = parsePoints(pointsAttr);
  if (points.length < 2) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    id: element.getAttribute("id") || `polyline-${index}`,
    type,
    layer,
    points,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
    properties: {
      stroke: element.getAttribute("stroke"),
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
      fill: element.getAttribute("fill"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    fillColor: element.getAttribute("fill") || "none",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };
}

function parsePolygon(element: Element, index: number): CADElement | null {
  const pointsAttr = element.getAttribute("points");
  if (!pointsAttr) return null;

  const points = parsePoints(pointsAttr);
  if (points.length < 3) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    id: element.getAttribute("id") || `polygon-${index}`,
    type,
    layer,
    points,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
    properties: {
      stroke: element.getAttribute("stroke"),
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
      fill: element.getAttribute("fill"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    fillColor: element.getAttribute("fill") || "none",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };
}

function parseCircle(element: Element, index: number): CADElement | null {
  const cx = parseFloat(element.getAttribute("cx") || "0");
  const cy = parseFloat(element.getAttribute("cy") || "0");
  const r = parseFloat(element.getAttribute("r") || "0");

  if (isNaN(cx) || isNaN(cy) || isNaN(r) || r === 0) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  return {
    id: element.getAttribute("id") || `circle-${index}`,
    type,
    layer,
    points: [{ x: cx, y: cy }],
    bounds: {
      minX: cx - r,
      minY: cy - r,
      maxX: cx + r,
      maxY: cy + r,
    },
    properties: {
      cx,
      cy,
      radius: r,
      stroke: element.getAttribute("stroke"),
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
      fill: element.getAttribute("fill"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    fillColor: element.getAttribute("fill") || "none",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };
}

function parseText(element: Element, index: number): CADElement | null {
  const x = parseFloat(element.getAttribute("x") || "0");
  const y = parseFloat(element.getAttribute("y") || "0");
  const text = element.textContent || "";

  if (!text.trim()) return null;

  const layer = detectLayer(element);
  const fontSize = parseFloat(element.getAttribute("font-size") || "12");

  return {
    id: element.getAttribute("id") || `text-${index}`,
    type: "text",
    layer,
    points: [{ x, y }],
    properties: {
      text: text.trim(),
      fontSize,
      fontFamily: element.getAttribute("font-family") || "Arial",
      textAnchor: element.getAttribute("text-anchor") || "start",
      fill: element.getAttribute("fill") || "#FFFFFF",
    },
    strokeColor: "transparent",
    fillColor: element.getAttribute("fill") || "#FFFFFF",
  };
}

function parsePath(element: Element, index: number): CADElement | null {
  const d = element.getAttribute("d");
  if (!d) return null;

  // Simple path parsing - extract key points
  const points: Point2D[] = [];
  const regex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi;
  let match;
  let currentX = 0;
  let currentY = 0;

  while ((match = regex.exec(d)) !== null) {
    const cmd = match[1].toUpperCase();
    const args = match[2].trim().split(/[\s,]+/).map(Number);

    switch (cmd) {
      case "M":
      case "L":
        if (args.length >= 2) {
          currentX = args[0];
          currentY = args[1];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case "H":
        if (args.length >= 1) {
          currentX = args[0];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case "V":
        if (args.length >= 1) {
          currentY = args[0];
          points.push({ x: currentX, y: currentY });
        }
        break;
      case "Z":
        // Close path - no new point needed
        break;
    }
  }

  if (points.length < 2) return null;

  const type = detectElementType(element);
  const layer = detectLayer(element);

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    id: element.getAttribute("id") || `path-${index}`,
    type,
    layer,
    points,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
    properties: {
      d,
      stroke: element.getAttribute("stroke"),
      strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
      fill: element.getAttribute("fill"),
    },
    strokeColor: element.getAttribute("stroke") || "#FFFFFF",
    fillColor: element.getAttribute("fill") || "none",
    strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
  };
}

// =============================================================================
// Grid Data Extraction
// =============================================================================

function extractGridData(svgElement: Element): { gridX: number[]; gridY: number[]; labelsX: string[]; labelsY: string[] } {
  const result = { gridX: [] as number[], gridY: [] as number[], labelsX: [] as string[], labelsY: [] as string[] };

  // Try data attributes first
  const dataGridX = svgElement.getAttribute("data-grid-x");
  const dataGridY = svgElement.getAttribute("data-grid-y");

  if (dataGridX) {
    try {
      result.gridX = JSON.parse(dataGridX);
    } catch {
      // ignore
    }
  }

  if (dataGridY) {
    try {
      result.gridY = JSON.parse(dataGridY);
    } catch {
      // ignore
    }
  }

  // Extract from grid lines if not in attributes
  if (result.gridX.length === 0 || result.gridY.length === 0) {
    const lines = svgElement.querySelectorAll('line[class*="grid"], line[class*="axis"]');
    lines.forEach((line) => {
      const x1 = parseFloat(line.getAttribute("x1") || "0");
      const y1 = parseFloat(line.getAttribute("y1") || "0");
      const x2 = parseFloat(line.getAttribute("x2") || "0");
      const y2 = parseFloat(line.getAttribute("y2") || "0");

      // Vertical line = X grid
      if (Math.abs(x1 - x2) < 0.1) {
        if (!result.gridX.includes(x1)) {
          result.gridX.push(x1);
        }
      }
      // Horizontal line = Y grid
      if (Math.abs(y1 - y2) < 0.1) {
        if (!result.gridY.includes(y1)) {
          result.gridY.push(y1);
        }
      }
    });
  }

  // Sort grids
  result.gridX.sort((a, b) => a - b);
  result.gridY.sort((a, b) => a - b);

  // Generate labels (A, B, C... for X; 1, 2, 3... for Y)
  result.labelsX = result.gridX.map((_, i) => String.fromCharCode(65 + i));
  result.labelsY = result.gridY.map((_, i) => String(i + 1));

  return result;
}

// =============================================================================
// Main Parser Function
// =============================================================================

export function parseSVG(svgString: string): ParsedSVG {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = doc.querySelector("svg");

  if (!svgElement) {
    throw new Error("Invalid SVG: No SVG element found");
  }

  // Parse dimensions
  const width = parseFloat(svgElement.getAttribute("width") || "800");
  const height = parseFloat(svgElement.getAttribute("height") || "600");

  // Parse viewBox
  let viewBox: ParsedSVG["viewBox"] = null;
  const viewBoxAttr = svgElement.getAttribute("viewBox");
  if (viewBoxAttr) {
    const parts = viewBoxAttr.split(/\s+/).map(Number);
    if (parts.length === 4) {
      viewBox = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    }
  }

  // Extract grid data
  const gridData = extractGridData(svgElement);

  // Parse all elements
  const elements: CADElement[] = [];
  let elementIndex = 0;

  // Parse lines
  svgElement.querySelectorAll("line").forEach((el) => {
    const parsed = parseLine(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse rectangles
  svgElement.querySelectorAll("rect").forEach((el) => {
    const parsed = parseRect(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse polylines
  svgElement.querySelectorAll("polyline").forEach((el) => {
    const parsed = parsePolyline(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse polygons
  svgElement.querySelectorAll("polygon").forEach((el) => {
    const parsed = parsePolygon(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse circles
  svgElement.querySelectorAll("circle").forEach((el) => {
    const parsed = parseCircle(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse paths
  svgElement.querySelectorAll("path").forEach((el) => {
    const parsed = parsePath(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  // Parse text
  svgElement.querySelectorAll("text").forEach((el) => {
    const parsed = parseText(el, elementIndex++);
    if (parsed) elements.push(parsed);
  });

  const offsetX = viewBox ? -viewBox.x : 0;
  const offsetY = viewBox ? -viewBox.y : 0;
  const adjustedElements =
    offsetX || offsetY
      ? elements.map((element) => ({
          ...element,
          points: element.points.map((point) => ({
            x: point.x + offsetX,
            y: point.y + offsetY,
          })),
          bounds: element.bounds
            ? {
                minX: element.bounds.minX + offsetX,
                minY: element.bounds.minY + offsetY,
                maxX: element.bounds.maxX + offsetX,
                maxY: element.bounds.maxY + offsetY,
              }
            : undefined,
        }))
      : elements;

  return {
    width: viewBox?.width || width,
    height: viewBox?.height || height,
    viewBox,
    elements: adjustedElements,
    gridX: gridData.gridX.map((value) => value + offsetX),
    gridY: gridData.gridY.map((value) => value + offsetY),
    gridLabelsX: gridData.labelsX,
    gridLabelsY: gridData.labelsY,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getElementsByLayer(elements: CADElement[], layer: CADLayer): CADElement[] {
  return elements.filter((el) => el.layer === layer);
}

export function getElementsByType(elements: CADElement[], type: CADElementType): CADElement[] {
  return elements.filter((el) => el.type === type);
}

export function calculateBounds(elements: CADElement[]): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    if (el.bounds) {
      minX = Math.min(minX, el.bounds.minX);
      minY = Math.min(minY, el.bounds.minY);
      maxX = Math.max(maxX, el.bounds.maxX);
      maxY = Math.max(maxY, el.bounds.maxY);
    }
  });

  return { minX, minY, maxX, maxY };
}

export function findElementAtPoint(elements: CADElement[], point: Point2D, tolerance: number = 5): CADElement | null {
  // Search in reverse order (top elements first)
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    if (!el.bounds) continue;

    const { minX, minY, maxX, maxY } = el.bounds;
    if (
      point.x >= minX - tolerance &&
      point.x <= maxX + tolerance &&
      point.y >= minY - tolerance &&
      point.y <= maxY + tolerance
    ) {
      return el;
    }
  }
  return null;
}
