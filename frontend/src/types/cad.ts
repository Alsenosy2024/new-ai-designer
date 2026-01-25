// =============================================================================
// CAD Element Type Definitions for Professional 2D/3D Viewers
// =============================================================================

// -----------------------------------------------------------------------------
// Basic Geometry Types
// -----------------------------------------------------------------------------

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface BoundingBox3D {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

// -----------------------------------------------------------------------------
// CAD Element Types
// -----------------------------------------------------------------------------

export type CADElementType =
  | "wall"
  | "door"
  | "window"
  | "column"
  | "beam"
  | "space"
  | "dimension"
  | "text"
  | "annotation"
  | "grid-line"
  | "duct"
  | "pipe"
  | "panel"
  | "diffuser"
  | "riser"
  | "core"
  | "stairs"
  | "elevator"
  | "furniture";

export type CADLayer =
  | "architectural"
  | "structural"
  | "mep-hvac"
  | "mep-electrical"
  | "mep-plumbing"
  | "annotations"
  | "grid"
  | "dimensions"
  | "furniture";

// -----------------------------------------------------------------------------
// Base CAD Element
// -----------------------------------------------------------------------------

export interface CADElement {
  id: string;
  type: CADElementType;
  layer: CADLayer;
  points: Point2D[];
  bounds?: BoundingBox2D;
  rotation?: number; // degrees
  properties: Record<string, unknown>;
  selected?: boolean;
  hovered?: boolean;
  locked?: boolean;
  visible?: boolean;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

// -----------------------------------------------------------------------------
// Specific Element Types
// -----------------------------------------------------------------------------

export interface WallElement extends CADElement {
  type: "wall";
  thickness: number;
  height: number;
  material?: string;
  isExterior?: boolean;
  openings?: string[]; // IDs of doors/windows in this wall
}

export interface DoorElement extends CADElement {
  type: "door";
  width: number;
  height: number;
  swingDirection: "left" | "right" | "double" | "sliding";
  swingAngle: number; // degrees, for display
  parentWallId?: string;
}

export interface WindowElement extends CADElement {
  type: "window";
  width: number;
  height: number;
  sillHeight: number;
  parentWallId?: string;
  glazingType?: "single" | "double" | "triple";
}

export interface ColumnElement extends CADElement {
  type: "column";
  width: number;
  depth: number;
  shape: "rectangular" | "circular" | "steel-h" | "steel-i";
}

export interface SpaceElement extends CADElement {
  type: "space";
  name: string;
  area: number;
  spaceType: string;
  requiresDaylight?: boolean;
  occupancy?: number;
}

export interface DimensionElement extends CADElement {
  type: "dimension";
  value: number;
  unit: "m" | "mm" | "ft" | "in";
  startPoint: Point2D;
  endPoint: Point2D;
  offsetDistance: number;
  textPosition?: Point2D;
  precision?: number;
}

export interface TextElement extends CADElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
}

export interface GridLineElement extends CADElement {
  type: "grid-line";
  axis: "x" | "y";
  label: string;
  position: number;
}

// -----------------------------------------------------------------------------
// Floor Plan Document
// -----------------------------------------------------------------------------

export interface FloorPlanDocument {
  id: string;
  projectId: string | number;
  runId: string | number;
  floorLevel: number;
  width: number;
  depth: number;
  elements: CADElement[];
  gridX: number[];
  gridY: number[];
  gridLabelsX?: string[];
  gridLabelsY?: string[];
  scale: number; // e.g., 100 for 1:100
  unit: "m" | "mm" | "ft";
  origin: Point2D;
}

// -----------------------------------------------------------------------------
// View State Types
// -----------------------------------------------------------------------------

export interface ViewTransform {
  panX: number;
  panY: number;
  zoom: number;
  rotation: number; // degrees
}

export interface ViewportState {
  width: number;
  height: number;
  transform: ViewTransform;
  backgroundColor: "dark" | "light";
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapTolerance: number;
}

// -----------------------------------------------------------------------------
// Selection and Interaction
// -----------------------------------------------------------------------------

export interface SelectionState {
  selectedIds: string[];
  hoveredId: string | null;
  selectionBox: BoundingBox2D | null;
  isMultiSelect: boolean;
}

export interface MeasurementState {
  active: boolean;
  points: Point2D[];
  currentDistance: number | null;
  unit: "m" | "mm" | "ft";
}

// -----------------------------------------------------------------------------
// 3D Model Types
// -----------------------------------------------------------------------------

export interface BuildingFloor {
  level: number;
  elevation: number; // Z height from ground
  height: number; // floor-to-floor
  visible: boolean;
  opacity: number;
  elements: Model3DElement[];
}

export interface Model3DElement {
  id: string;
  type: CADElementType;
  floorLevel: number;
  geometry: {
    type: "box" | "extrusion" | "cylinder" | "mesh";
    position: Point3D;
    dimensions?: Point3D;
    rotation?: Point3D;
    vertices?: number[];
    indices?: number[];
  };
  material: {
    color: string;
    opacity: number;
    metalness?: number;
    roughness?: number;
    transparent?: boolean;
  };
  properties: Record<string, unknown>;
  selected?: boolean;
  visible?: boolean;
}

export interface ClippingPlane {
  id: string;
  name: string;
  normal: Point3D;
  constant: number;
  enabled: boolean;
  color?: string;
}

export interface CameraState {
  position: Point3D;
  target: Point3D;
  up: Point3D;
  fov: number;
  near: number;
  far: number;
  mode: "orbit" | "firstPerson" | "plan" | "elevation";
}

export interface Building3DModel {
  id: string;
  projectId: string | number;
  floors: BuildingFloor[];
  clippingPlanes: ClippingPlane[];
  camera: CameraState;
  showGrid: boolean;
  showAxes: boolean;
  ambientOcclusion: boolean;
  shadows: boolean;
}

// -----------------------------------------------------------------------------
// CAD Color Constants (matching AutoCAD ACI colors)
// -----------------------------------------------------------------------------

export const CAD_COLORS = {
  // Layer colors
  wall: "#FFFFFF",
  wallExterior: "#00FFFF",
  door: "#FF8000",
  window: "#00BFFF",
  column: "#FF0000",
  beam: "#FF0000",
  space: "#E6E6E6",
  grid: "#808080",
  dimension: "#FFFF00",
  text: "#FFFFFF",
  annotation: "#00FF00",
  core: "#C0C0C0",
  mepHvac: "#00FFFF",
  mepElectrical: "#FF00FF",
  mepPlumbing: "#0000FF",

  // UI colors
  selection: "#00FF00",
  hover: "#FFFF00",
  snap: "#FF00FF",
  measurementLine: "#00FFFF",
} as const;

// -----------------------------------------------------------------------------
// CAD Line Weights (in pixels at 1:1 scale)
// -----------------------------------------------------------------------------

export const CAD_LINE_WEIGHTS = {
  wall: 2.0,
  wallExterior: 2.5,
  partition: 1.5,
  door: 1.0,
  window: 1.0,
  column: 1.5,
  beam: 1.5,
  grid: 0.5,
  dimension: 0.5,
  dimensionExtension: 0.25,
  text: 0.5,
  annotation: 0.5,
  space: 0.25,
  furniture: 0.5,
  mep: 1.0,
} as const;

// -----------------------------------------------------------------------------
// Layer Definitions
// -----------------------------------------------------------------------------

export interface LayerDefinition {
  id: CADLayer;
  name: string;
  color: string;
  lineWeight: number;
  visible: boolean;
  locked: boolean;
  printable: boolean;
}

export const DEFAULT_LAYERS: LayerDefinition[] = [
  {
    id: "architectural",
    name: "Architectural",
    color: CAD_COLORS.wall,
    lineWeight: CAD_LINE_WEIGHTS.wall,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "structural",
    name: "Structural",
    color: CAD_COLORS.column,
    lineWeight: CAD_LINE_WEIGHTS.column,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "mep-hvac",
    name: "MEP - HVAC",
    color: CAD_COLORS.mepHvac,
    lineWeight: CAD_LINE_WEIGHTS.mep,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "mep-electrical",
    name: "MEP - Electrical",
    color: CAD_COLORS.mepElectrical,
    lineWeight: CAD_LINE_WEIGHTS.mep,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "mep-plumbing",
    name: "MEP - Plumbing",
    color: CAD_COLORS.mepPlumbing,
    lineWeight: CAD_LINE_WEIGHTS.mep,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "annotations",
    name: "Annotations",
    color: CAD_COLORS.annotation,
    lineWeight: CAD_LINE_WEIGHTS.annotation,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "grid",
    name: "Grid",
    color: CAD_COLORS.grid,
    lineWeight: CAD_LINE_WEIGHTS.grid,
    visible: true,
    locked: true,
    printable: true,
  },
  {
    id: "dimensions",
    name: "Dimensions",
    color: CAD_COLORS.dimension,
    lineWeight: CAD_LINE_WEIGHTS.dimension,
    visible: true,
    locked: false,
    printable: true,
  },
  {
    id: "furniture",
    name: "Furniture",
    color: "#A0A0A0",
    lineWeight: CAD_LINE_WEIGHTS.furniture,
    visible: true,
    locked: false,
    printable: true,
  },
];
