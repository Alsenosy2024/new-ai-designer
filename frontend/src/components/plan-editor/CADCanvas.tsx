"use client";

/**
 * CADCanvas - Professional 2D CAD Viewer Component
 *
 * A full-featured 2D floor plan viewer built with Konva.js,
 * providing AutoCAD/Revit-like functionality including:
 * - Pan, zoom, and rotate controls
 * - Layer visibility management
 * - Element selection
 * - Grid display
 * - Measurement tools
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Line, Rect, Circle, Text, Group } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";
import { useViewerStore } from "@/stores/viewer-store";
import { parseSVG } from "./utils/svg-parser";
import { apiClient } from "@/lib/api-client";
import type { CADElement } from "@/types/cad";
import { CAD_COLORS } from "@/types/cad";

// =============================================================================
// Types
// =============================================================================

interface CADCanvasProps {
  projectId: string | number;
  runId: string | number;
  fileName: string;
  className?: string;
}

interface CanvasSize {
  width: number;
  height: number;
}

// =============================================================================
// Constants
// =============================================================================

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 50;
const ZOOM_SENSITIVITY = 1.1;
const GRID_SIZE_BASE = 1.2; // 1.2m architectural module

// =============================================================================
// CADCanvas Component
// =============================================================================

export function CADCanvas({ projectId, runId, fileName, className }: CADCanvasProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // Local state
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
  const [elements, setElements] = useState<CADElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentSize, setDocumentSize] = useState({ width: 100, height: 100 });
  const [gridData, setGridData] = useState<{ gridX: number[]; gridY: number[] }>({ gridX: [], gridY: [] });

  // Store state
  const {
    viewTransform,
    setViewTransform,
    backgroundColor,
    showGrid,
    layers,
    selectedElementIds,
    selectElement,
    clearSelection,
    setHoveredElement,
    hoveredElementId,
    measurementActive,
    measurementPoints,
    addMeasurementPoint,
  } = useViewerStore();

  const getPlanPointFromPointer = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - viewTransform.panX) / viewTransform.zoom,
      y: (pointer.y - viewTransform.panY) / viewTransform.zoom,
    };
  }, [viewTransform]);

  // ==========================================================================
  // Responsive sizing
  // ==========================================================================

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: rect.width || 800,
          height: rect.height || 600,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ==========================================================================
  // Load SVG data
  // ==========================================================================

  useEffect(() => {
    const loadSVG = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = apiClient.getFileUrl(projectId, runId, fileName);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch plan: ${response.statusText}`);
        }

        const svgText = await response.text();

        if (!svgText.includes("<svg")) {
          throw new Error("Invalid SVG content");
        }

        const parsed = parseSVG(svgText);
        setElements(parsed.elements);
        setDocumentSize({ width: parsed.width, height: parsed.height });
        setGridData({ gridX: parsed.gridX, gridY: parsed.gridY });

        // Auto-fit view
        if (containerRef.current && parsed.width > 0 && parsed.height > 0) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          const scaleX = containerWidth / parsed.width;
          const scaleY = containerHeight / parsed.height;
          const fitScale = Math.min(scaleX, scaleY) * 0.9;

          setViewTransform({
            zoom: fitScale,
            panX: (containerWidth - parsed.width * fitScale) / 2,
            panY: (containerHeight - parsed.height * fitScale) / 2,
          });
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
        setError(err instanceof Error ? err.message : "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };

    if (projectId && runId && fileName) {
      loadSVG();
    }
  }, [projectId, runId, fileName, setViewTransform]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = viewTransform.zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - viewTransform.panX) / oldScale,
        y: (pointer.y - viewTransform.panY) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * ZOOM_SENSITIVITY : oldScale / ZOOM_SENSITIVITY;
      const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

      setViewTransform({
        zoom: clampedScale,
        panX: pointer.x - mousePointTo.x * clampedScale,
        panY: pointer.y - mousePointTo.y * clampedScale,
      });
    },
    [viewTransform, setViewTransform]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      if (e.target === stageRef.current) {
        setViewTransform({
          panX: e.target.x(),
          panY: e.target.y(),
        });
      }
    },
    [setViewTransform]
  );

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      // If clicking on stage background, clear selection
      if (e.target === stageRef.current) {
        if (measurementActive) {
          const point = getPlanPointFromPointer();
          if (point) {
            addMeasurementPoint(point);
          }
        } else {
          clearSelection();
        }
      }
    },
    [measurementActive, getPlanPointFromPointer, addMeasurementPoint, clearSelection]
  );

  const handleElementClick = useCallback(
    (elementId: string, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (measurementActive) {
        const point = getPlanPointFromPointer();
        if (point) {
          addMeasurementPoint(point);
        }
        return;
      }
      const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      selectElement(elementId, isMultiSelect);
    },
    [measurementActive, getPlanPointFromPointer, addMeasurementPoint, selectElement]
  );

  const handleElementMouseEnter = useCallback(
    (elementId: string) => {
      setHoveredElement(elementId);
    },
    [setHoveredElement]
  );

  const handleElementMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, [setHoveredElement]);

  // ==========================================================================
  // Filter elements by layer visibility
  // ==========================================================================

  const visibleElements = useMemo(() => {
    return elements.filter((el) => {
      const layerState = layers[el.layer];
      return layerState?.visible !== false;
    });
  }, [elements, layers]);

  // ==========================================================================
  // Render Grid
  // ==========================================================================

  const renderGrid = useCallback(() => {
    if (!showGrid) return null;

    const lines: React.ReactNode[] = [];
    const gridColor = backgroundColor === "dark" ? "#333333" : "#CCCCCC";
    const gridStep = GRID_SIZE_BASE * 10; // 12m major grid

    // Calculate grid bounds
    const startX = Math.floor(-100 / gridStep) * gridStep;
    const endX = Math.ceil((documentSize.width + 100) / gridStep) * gridStep;
    const startY = Math.floor(-100 / gridStep) * gridStep;
    const endY = Math.ceil((documentSize.height + 100) / gridStep) * gridStep;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridStep) {
      lines.push(
        <Line
          key={`grid-v-${x}`}
          points={[x, startY, x, endY]}
          stroke={gridColor}
          strokeWidth={0.5 / viewTransform.zoom}
          opacity={0.3}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridStep) {
      lines.push(
        <Line
          key={`grid-h-${y}`}
          points={[startX, y, endX, y]}
          stroke={gridColor}
          strokeWidth={0.5 / viewTransform.zoom}
          opacity={0.3}
        />
      );
    }

    // Structural grid from document
    gridData.gridX.forEach((x, i) => {
      lines.push(
        <Line
          key={`struct-grid-x-${i}`}
          points={[x, -50, x, documentSize.height + 50]}
          stroke={CAD_COLORS.grid}
          strokeWidth={0.3 / viewTransform.zoom}
          dash={[10 / viewTransform.zoom, 5 / viewTransform.zoom]}
          opacity={0.5}
        />
      );
    });

    gridData.gridY.forEach((y, i) => {
      lines.push(
        <Line
          key={`struct-grid-y-${i}`}
          points={[-50, y, documentSize.width + 50, y]}
          stroke={CAD_COLORS.grid}
          strokeWidth={0.3 / viewTransform.zoom}
          dash={[10 / viewTransform.zoom, 5 / viewTransform.zoom]}
          opacity={0.5}
        />
      );
    });

    return <Group>{lines}</Group>;
  }, [showGrid, backgroundColor, documentSize, gridData, viewTransform.zoom]);

  // ==========================================================================
  // Render Element
  // ==========================================================================

  const renderElement = useCallback(
    (element: CADElement) => {
      const isSelected = selectedElementIds.includes(element.id);
      const isHovered = hoveredElementId === element.id;

      const strokeColor = isSelected
        ? CAD_COLORS.selection
        : isHovered
          ? CAD_COLORS.hover
          : element.strokeColor || "#FFFFFF";

      const strokeWidth =
        ((element.strokeWidth || 1) / viewTransform.zoom) * (isSelected ? 1.5 : 1);

      const commonProps = {
        key: element.id,
        onClick: (e: KonvaEventObject<MouseEvent>) => handleElementClick(element.id, e),
        onMouseEnter: () => handleElementMouseEnter(element.id),
        onMouseLeave: handleElementMouseLeave,
      };

      // Render based on element type and geometry
      if (element.points.length === 1) {
        // Single point - render as circle (column, etc.)
        const radius = (element.properties as { radius?: number }).radius || 2;
        return (
          <Circle
            {...commonProps}
            x={element.points[0].x}
            y={element.points[0].y}
            radius={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill={element.fillColor || "transparent"}
          />
        );
      }

      if (element.points.length === 2) {
        // Two points - render as line
        return (
          <Line
            {...commonProps}
            points={[
              element.points[0].x,
              element.points[0].y,
              element.points[1].x,
              element.points[1].y,
            ]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            hitStrokeWidth={Math.max(strokeWidth * 3, 5 / viewTransform.zoom)}
          />
        );
      }

      if (element.points.length === 4 && element.type === "space") {
        // Rectangle (space)
        const minX = Math.min(...element.points.map((p) => p.x));
        const minY = Math.min(...element.points.map((p) => p.y));
        const maxX = Math.max(...element.points.map((p) => p.x));
        const maxY = Math.max(...element.points.map((p) => p.y));

        const spaceColor =
          backgroundColor === "dark"
            ? "rgba(100, 100, 150, 0.1)"
            : "rgba(200, 200, 220, 0.2)";

        return (
          <Group key={element.id}>
            <Rect
              {...commonProps}
              x={minX}
              y={minY}
              width={maxX - minX}
              height={maxY - minY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              fill={isSelected ? "rgba(0, 255, 0, 0.1)" : spaceColor}
            />
            {/* Space label */}
            <Text
              x={minX + 5}
              y={minY + 5}
              text={(element.properties as { name?: string }).name || element.id}
              fontSize={Math.max(8 / viewTransform.zoom, 10)}
              fill={backgroundColor === "dark" ? "#AAAAAA" : "#666666"}
            />
          </Group>
        );
      }

      // Polyline/polygon
      const flatPoints = element.points.flatMap((p) => [p.x, p.y]);
      const isClosed =
        element.type === "space" ||
        element.type === "core" ||
        element.fillColor !== "none";

      return (
        <Line
          {...commonProps}
          points={flatPoints}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={isClosed ? element.fillColor || "transparent" : undefined}
          closed={isClosed}
          hitStrokeWidth={Math.max(strokeWidth * 3, 5 / viewTransform.zoom)}
        />
      );
    },
    [
      selectedElementIds,
      hoveredElementId,
      viewTransform.zoom,
      backgroundColor,
      handleElementClick,
      handleElementMouseEnter,
      handleElementMouseLeave,
    ]
  );

  // ==========================================================================
  // Render Measurement
  // ==========================================================================

  const renderMeasurement = useCallback(() => {
    if (!measurementActive || measurementPoints.length === 0) return null;

    const lines: React.ReactNode[] = [];
    const points = measurementPoints;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      lines.push(
        <Group key={`measure-${i}`}>
          <Line
            points={[p1.x, p1.y, p2.x, p2.y]}
            stroke={CAD_COLORS.measurementLine}
            strokeWidth={2 / viewTransform.zoom}
          />
          <Circle
            x={p1.x}
            y={p1.y}
            radius={4 / viewTransform.zoom}
            fill={CAD_COLORS.measurementLine}
          />
          <Circle
            x={p2.x}
            y={p2.y}
            radius={4 / viewTransform.zoom}
            fill={CAD_COLORS.measurementLine}
          />
          <Text
            x={midX}
            y={midY - 15 / viewTransform.zoom}
            text={`${distance.toFixed(2)} m`}
            fontSize={14 / viewTransform.zoom}
            fill={CAD_COLORS.dimension}
            align="center"
          />
        </Group>
      );
    }

    // Show last point marker
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      lines.push(
        <Circle
          key="measure-last"
          x={lastPoint.x}
          y={lastPoint.y}
          radius={4 / viewTransform.zoom}
          fill={CAD_COLORS.measurementLine}
        />
      );
    }

    return <Group>{lines}</Group>;
  }, [measurementActive, measurementPoints, viewTransform.zoom]);

  // ==========================================================================
  // Loading and Error States
  // ==========================================================================

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading floor plan...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="text-red-500 text-5xl">!</div>
          <h3 className="text-xl font-semibold text-red-400">Failed to load plan</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  const bgColor = backgroundColor === "dark" ? "#1a1a2e" : "#f5f5f5";

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        x={viewTransform.panX}
        y={viewTransform.panY}
        scaleX={viewTransform.zoom}
        scaleY={viewTransform.zoom}
        rotation={viewTransform.rotation}
        draggable
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        style={{ cursor: measurementActive ? "crosshair" : "grab" }}
      >
        {/* Grid Layer */}
        <Layer>{renderGrid()}</Layer>

        {/* Elements Layer */}
        <Layer>{visibleElements.map(renderElement)}</Layer>

        {/* Measurement Layer */}
        <Layer>{renderMeasurement()}</Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        {(viewTransform.zoom * 100).toFixed(0)}%
      </div>

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs font-mono">
        {documentSize.width.toFixed(1)} × {documentSize.height.toFixed(1)} m
      </div>
    </div>
  );
}

export default CADCanvas;
