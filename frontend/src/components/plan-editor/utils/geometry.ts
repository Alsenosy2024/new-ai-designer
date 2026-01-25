/**
 * Geometry Utility Functions for CAD Canvas
 */

import type { Point2D, BoundingBox2D } from "@/types/cad";

// =============================================================================
// Distance and Length Calculations
// =============================================================================

export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function polylineLength(points: Point2D[]): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += distance(points[i], points[i + 1]);
  }
  return total;
}

// =============================================================================
// Point Operations
// =============================================================================

export function midpoint(p1: Point2D, p2: Point2D): Point2D {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function centroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 };

  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

export function rotatePoint(point: Point2D, center: Point2D, angleDegrees: number): Point2D {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

// =============================================================================
// Line Operations
// =============================================================================

export function lineAngle(p1: Point2D, p2: Point2D): number {
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
}

export function perpendicularDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return distance(point, lineStart);

  return Math.abs(
    (dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / length
  );
}

export function pointOnLine(p1: Point2D, p2: Point2D, t: number): Point2D {
  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
  };
}

export function projectPointOnLine(point: Point2D, lineStart: Point2D, lineEnd: Point2D): Point2D {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return lineStart;

  const t = Math.max(0, Math.min(1,
    ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSq
  ));

  return pointOnLine(lineStart, lineEnd, t);
}

// =============================================================================
// Bounding Box Operations
// =============================================================================

export function pointsToBox(points: Point2D[]): BoundingBox2D | null {
  if (points.length === 0) return null;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

export function boxCenter(box: BoundingBox2D): Point2D {
  return {
    x: (box.minX + box.maxX) / 2,
    y: (box.minY + box.maxY) / 2,
  };
}

export function boxSize(box: BoundingBox2D): { width: number; height: number } {
  return {
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
  };
}

export function boxArea(box: BoundingBox2D): number {
  return (box.maxX - box.minX) * (box.maxY - box.minY);
}

export function boxesIntersect(a: BoundingBox2D, b: BoundingBox2D): boolean {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

export function boxContainsPoint(box: BoundingBox2D, point: Point2D): boolean {
  return point.x >= box.minX && point.x <= box.maxX &&
         point.y >= box.minY && point.y <= box.maxY;
}

export function expandBox(box: BoundingBox2D, amount: number): BoundingBox2D {
  return {
    minX: box.minX - amount,
    minY: box.minY - amount,
    maxX: box.maxX + amount,
    maxY: box.maxY + amount,
  };
}

export function mergeBoxes(boxes: BoundingBox2D[]): BoundingBox2D | null {
  if (boxes.length === 0) return null;

  return {
    minX: Math.min(...boxes.map(b => b.minX)),
    minY: Math.min(...boxes.map(b => b.minY)),
    maxX: Math.max(...boxes.map(b => b.maxX)),
    maxY: Math.max(...boxes.map(b => b.maxY)),
  };
}

// =============================================================================
// Snapping
// =============================================================================

export function snapToGrid(point: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function snapToNearestPoint(point: Point2D, snapPoints: Point2D[], tolerance: number): Point2D | null {
  let nearest: Point2D | null = null;
  let minDist = tolerance;

  for (const snapPoint of snapPoints) {
    const dist = distance(point, snapPoint);
    if (dist < minDist) {
      minDist = dist;
      nearest = snapPoint;
    }
  }

  return nearest;
}

export function snapToLine(point: Point2D, lines: Array<[Point2D, Point2D]>, tolerance: number): Point2D | null {
  let nearest: Point2D | null = null;
  let minDist = tolerance;

  for (const [start, end] of lines) {
    const projected = projectPointOnLine(point, start, end);
    const dist = distance(point, projected);

    if (dist < minDist) {
      minDist = dist;
      nearest = projected;
    }
  }

  return nearest;
}

// =============================================================================
// Polygon Operations
// =============================================================================

export function polygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2;
}

export function isPointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    if (((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

// =============================================================================
// Arc and Circle Operations
// =============================================================================

export function arcPoints(
  center: Point2D,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments: number = 32
): Point2D[] {
  const points: Point2D[] = [];
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const angleStep = (endRad - startRad) / segments;

  for (let i = 0; i <= segments; i++) {
    const angle = startRad + i * angleStep;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }

  return points;
}

export function circlePoints(center: Point2D, radius: number, segments: number = 32): Point2D[] {
  return arcPoints(center, radius, 0, 360, segments);
}

// =============================================================================
// Transformation Matrix
// =============================================================================

export interface TransformMatrix {
  a: number; b: number; c: number;
  d: number; e: number; f: number;
}

export function identityMatrix(): TransformMatrix {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

export function translateMatrix(tx: number, ty: number): TransformMatrix {
  return { a: 1, b: 0, c: 0, d: 1, e: tx, f: ty };
}

export function scaleMatrix(sx: number, sy: number): TransformMatrix {
  return { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 };
}

export function rotateMatrix(angleDegrees: number): TransformMatrix {
  const rad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
}

export function multiplyMatrices(m1: TransformMatrix, m2: TransformMatrix): TransformMatrix {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}

export function transformPoint(point: Point2D, matrix: TransformMatrix): Point2D {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  };
}
