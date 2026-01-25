import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CADLayer,
  Point2D,
  Point3D,
  ViewTransform,
  ClippingPlane,
} from "@/types/cad";
import type { ToolType } from "@/types";

// =============================================================================
// Viewer Store Types
// =============================================================================

interface LayerState {
  visible: boolean;
  locked: boolean;
  opacity: number;
}

interface ViewerState {
  // -------------------------------------------------------------------------
  // 2D Viewer State
  // -------------------------------------------------------------------------

  // Active tool
  activeTool: ToolType;

  // Layer visibility and state
  layers: Record<CADLayer, LayerState>;

  // Selection
  selectedElementIds: string[];
  hoveredElementId: string | null;

  // View transform
  viewTransform: ViewTransform;

  // Canvas settings
  backgroundColor: "dark" | "light";
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  snapTolerance: number;

  // Measurement mode
  measurementActive: boolean;
  measurementPoints: Point2D[];
  measurementUnit: "m" | "mm" | "ft";

  // -------------------------------------------------------------------------
  // 3D Viewer State
  // -------------------------------------------------------------------------

  // Floor visibility
  totalFloors: number;
  visibleFloors: number[];
  floorOpacity: Record<number, number>;
  explodedView: boolean;
  explodeDistance: number;

  // Section planes
  clippingPlanes: ClippingPlane[];
  activeClippingPlaneId: string | null;

  // Camera
  cameraMode: "orbit" | "firstPerson" | "plan" | "elevation";
  cameraPosition: Point3D;
  cameraTarget: Point3D;

  // 3D Selection
  selectedObjectIds: string[];
  hoveredObjectId: string | null;

  // Render quality
  renderQuality: "low" | "medium" | "high";
  showShadows: boolean;
  showAmbientOcclusion: boolean;
  antialiasing: boolean;

  // 3D Measurement
  measurement3DActive: boolean;
  measurement3DPoints: Point3D[];

  // -------------------------------------------------------------------------
  // 2D Actions
  // -------------------------------------------------------------------------

  setActiveTool: (tool: ToolType) => void;

  setLayerVisibility: (layer: CADLayer, visible: boolean) => void;
  setLayerLocked: (layer: CADLayer, locked: boolean) => void;
  setLayerOpacity: (layer: CADLayer, opacity: number) => void;
  toggleLayerVisibility: (layer: CADLayer) => void;
  showAllLayers: () => void;
  hideAllLayers: () => void;

  selectElement: (id: string, addToSelection?: boolean) => void;
  selectElements: (ids: string[]) => void;
  deselectElement: (id: string) => void;
  clearSelection: () => void;
  setHoveredElement: (id: string | null) => void;

  setViewTransform: (transform: Partial<ViewTransform>) => void;
  resetViewTransform: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  rotateView: (degrees: number) => void;

  setBackgroundColor: (color: "dark" | "light") => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;

  startMeasurement: () => void;
  addMeasurementPoint: (point: Point2D) => void;
  clearMeasurement: () => void;
  setMeasurementUnit: (unit: "m" | "mm" | "ft") => void;

  // -------------------------------------------------------------------------
  // 3D Actions
  // -------------------------------------------------------------------------

  setTotalFloors: (count: number) => void;
  toggleFloorVisibility: (floor: number) => void;
  showFloor: (floor: number) => void;
  hideFloor: (floor: number) => void;
  showAllFloors: () => void;
  hideAllFloors: () => void;
  isolateFloor: (floor: number) => void;
  setFloorOpacity: (floor: number, opacity: number) => void;
  toggleExplodedView: () => void;
  setExplodeDistance: (distance: number) => void;

  addClippingPlane: (plane: ClippingPlane) => void;
  removeClippingPlane: (id: string) => void;
  updateClippingPlane: (id: string, updates: Partial<ClippingPlane>) => void;
  toggleClippingPlane: (id: string) => void;
  setActiveClippingPlane: (id: string | null) => void;
  clearAllClippingPlanes: () => void;

  setCameraMode: (mode: "orbit" | "firstPerson" | "plan" | "elevation") => void;
  setCameraPosition: (position: Point3D) => void;
  setCameraTarget: (target: Point3D) => void;
  resetCamera: () => void;

  selectObject: (id: string, addToSelection?: boolean) => void;
  selectObjects: (ids: string[]) => void;
  deselectObject: (id: string) => void;
  clearObjectSelection: () => void;
  setHoveredObject: (id: string | null) => void;

  setRenderQuality: (quality: "low" | "medium" | "high") => void;
  toggleShadows: () => void;
  toggleAmbientOcclusion: () => void;
  toggleAntialiasing: () => void;

  startMeasurement3D: () => void;
  addMeasurement3DPoint: (point: Point3D) => void;
  clearMeasurement3D: () => void;
}

// =============================================================================
// Default Values
// =============================================================================

const defaultLayers: Record<CADLayer, LayerState> = {
  architectural: { visible: true, locked: false, opacity: 1 },
  structural: { visible: true, locked: false, opacity: 1 },
  "mep-hvac": { visible: true, locked: false, opacity: 1 },
  "mep-electrical": { visible: true, locked: false, opacity: 1 },
  "mep-plumbing": { visible: true, locked: false, opacity: 1 },
  annotations: { visible: true, locked: false, opacity: 1 },
  grid: { visible: true, locked: true, opacity: 0.5 },
  dimensions: { visible: true, locked: false, opacity: 1 },
  furniture: { visible: true, locked: false, opacity: 1 },
};

const defaultViewTransform: ViewTransform = {
  panX: 0,
  panY: 0,
  zoom: 1,
  rotation: 0,
};

const defaultCameraPosition: Point3D = { x: 60, y: 40, z: 60 };
const defaultCameraTarget: Point3D = { x: 0, y: 0, z: 0 };

// =============================================================================
// Store Implementation
// =============================================================================

export const useViewerStore = create<ViewerState>()(
  persist(
    (set) => ({
      // -----------------------------------------------------------------------
      // 2D Initial State
      // -----------------------------------------------------------------------
      activeTool: "select",
      layers: { ...defaultLayers },
      selectedElementIds: [],
      hoveredElementId: null,
      viewTransform: { ...defaultViewTransform },
      backgroundColor: "dark",
      showGrid: true,
      gridSize: 1.2, // 1.2m architectural module
      snapToGrid: true,
      snapTolerance: 0.1,
      measurementActive: false,
      measurementPoints: [],
      measurementUnit: "m",

      // -----------------------------------------------------------------------
      // 3D Initial State
      // -----------------------------------------------------------------------
      totalFloors: 1,
      visibleFloors: [0],
      floorOpacity: { 0: 1 },
      explodedView: false,
      explodeDistance: 5,
      clippingPlanes: [],
      activeClippingPlaneId: null,
      cameraMode: "orbit",
      cameraPosition: { ...defaultCameraPosition },
      cameraTarget: { ...defaultCameraTarget },
      selectedObjectIds: [],
      hoveredObjectId: null,
      renderQuality: "medium",
      showShadows: true,
      showAmbientOcclusion: false,
      antialiasing: true,
      measurement3DActive: false,
      measurement3DPoints: [],

      // -----------------------------------------------------------------------
      // 2D Actions
      // -----------------------------------------------------------------------

      setActiveTool: (tool) => set({ activeTool: tool }),

      setLayerVisibility: (layer, visible) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [layer]: { ...state.layers[layer], visible },
          },
        })),

      setLayerLocked: (layer, locked) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [layer]: { ...state.layers[layer], locked },
          },
        })),

      setLayerOpacity: (layer, opacity) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [layer]: { ...state.layers[layer], opacity },
          },
        })),

      toggleLayerVisibility: (layer) =>
        set((state) => ({
          layers: {
            ...state.layers,
            [layer]: { ...state.layers[layer], visible: !state.layers[layer].visible },
          },
        })),

      showAllLayers: () =>
        set((state) => {
          const newLayers = { ...state.layers };
          Object.keys(newLayers).forEach((key) => {
            newLayers[key as CADLayer].visible = true;
          });
          return { layers: newLayers };
        }),

      hideAllLayers: () =>
        set((state) => {
          const newLayers = { ...state.layers };
          Object.keys(newLayers).forEach((key) => {
            newLayers[key as CADLayer].visible = false;
          });
          return { layers: newLayers };
        }),

      selectElement: (id, addToSelection = false) =>
        set((state) => ({
          selectedElementIds: addToSelection
            ? [...state.selectedElementIds, id]
            : [id],
        })),

      selectElements: (ids) => set({ selectedElementIds: ids }),

      deselectElement: (id) =>
        set((state) => ({
          selectedElementIds: state.selectedElementIds.filter((eid) => eid !== id),
        })),

      clearSelection: () => set({ selectedElementIds: [], hoveredElementId: null }),

      setHoveredElement: (id) => set({ hoveredElementId: id }),

      setViewTransform: (transform) =>
        set((state) => ({
          viewTransform: { ...state.viewTransform, ...transform },
        })),

      resetViewTransform: () => set({ viewTransform: { ...defaultViewTransform } }),

      zoomIn: () =>
        set((state) => ({
          viewTransform: {
            ...state.viewTransform,
            zoom: Math.min(state.viewTransform.zoom * 1.2, 50),
          },
        })),

      zoomOut: () =>
        set((state) => ({
          viewTransform: {
            ...state.viewTransform,
            zoom: Math.max(state.viewTransform.zoom / 1.2, 0.1),
          },
        })),

      zoomToFit: () =>
        set({
          viewTransform: { panX: 0, panY: 0, zoom: 1, rotation: 0 },
        }),

      rotateView: (degrees) =>
        set((state) => ({
          viewTransform: {
            ...state.viewTransform,
            rotation: (state.viewTransform.rotation + degrees) % 360,
          },
        })),

      setBackgroundColor: (color) => set({ backgroundColor: color }),

      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

      setGridSize: (size) => set({ gridSize: size }),

      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

      startMeasurement: () =>
        set({
          measurementActive: true,
          measurementPoints: [],
          activeTool: "select",
        }),

      addMeasurementPoint: (point) =>
        set((state) => ({
          measurementPoints: [...state.measurementPoints, point],
        })),

      clearMeasurement: () =>
        set({ measurementActive: false, measurementPoints: [] }),

      setMeasurementUnit: (unit) => set({ measurementUnit: unit }),

      // -----------------------------------------------------------------------
      // 3D Actions
      // -----------------------------------------------------------------------

      setTotalFloors: (count) => {
        const floors = Array.from({ length: count }, (_, i) => i);
        const opacities: Record<number, number> = {};
        floors.forEach((f) => (opacities[f] = 1));
        set({ totalFloors: count, visibleFloors: floors, floorOpacity: opacities });
      },

      toggleFloorVisibility: (floor) =>
        set((state) => ({
          visibleFloors: state.visibleFloors.includes(floor)
            ? state.visibleFloors.filter((f) => f !== floor)
            : [...state.visibleFloors, floor].sort((a, b) => a - b),
        })),

      showFloor: (floor) =>
        set((state) => ({
          visibleFloors: state.visibleFloors.includes(floor)
            ? state.visibleFloors
            : [...state.visibleFloors, floor].sort((a, b) => a - b),
        })),

      hideFloor: (floor) =>
        set((state) => ({
          visibleFloors: state.visibleFloors.filter((f) => f !== floor),
        })),

      showAllFloors: () =>
        set((state) => ({
          visibleFloors: Array.from({ length: state.totalFloors }, (_, i) => i),
        })),

      hideAllFloors: () => set({ visibleFloors: [] }),

      isolateFloor: (floor) => set({ visibleFloors: [floor] }),

      setFloorOpacity: (floor, opacity) =>
        set((state) => ({
          floorOpacity: { ...state.floorOpacity, [floor]: opacity },
        })),

      toggleExplodedView: () =>
        set((state) => ({ explodedView: !state.explodedView })),

      setExplodeDistance: (distance) => set({ explodeDistance: distance }),

      addClippingPlane: (plane) =>
        set((state) => ({
          clippingPlanes: [...state.clippingPlanes, plane],
        })),

      removeClippingPlane: (id) =>
        set((state) => ({
          clippingPlanes: state.clippingPlanes.filter((p) => p.id !== id),
          activeClippingPlaneId:
            state.activeClippingPlaneId === id ? null : state.activeClippingPlaneId,
        })),

      updateClippingPlane: (id, updates) =>
        set((state) => ({
          clippingPlanes: state.clippingPlanes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      toggleClippingPlane: (id) =>
        set((state) => ({
          clippingPlanes: state.clippingPlanes.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          ),
        })),

      setActiveClippingPlane: (id) => set({ activeClippingPlaneId: id }),

      clearAllClippingPlanes: () =>
        set({ clippingPlanes: [], activeClippingPlaneId: null }),

      setCameraMode: (mode) => set({ cameraMode: mode }),

      setCameraPosition: (position) => set({ cameraPosition: position }),

      setCameraTarget: (target) => set({ cameraTarget: target }),

      resetCamera: () =>
        set({
          cameraPosition: { ...defaultCameraPosition },
          cameraTarget: { ...defaultCameraTarget },
          cameraMode: "orbit",
        }),

      selectObject: (id, addToSelection = false) =>
        set((state) => ({
          selectedObjectIds: addToSelection
            ? [...state.selectedObjectIds, id]
            : [id],
        })),

      selectObjects: (ids) => set({ selectedObjectIds: ids }),

      deselectObject: (id) =>
        set((state) => ({
          selectedObjectIds: state.selectedObjectIds.filter((oid) => oid !== id),
        })),

      clearObjectSelection: () =>
        set({ selectedObjectIds: [], hoveredObjectId: null }),

      setHoveredObject: (id) => set({ hoveredObjectId: id }),

      setRenderQuality: (quality) => set({ renderQuality: quality }),

      toggleShadows: () => set((state) => ({ showShadows: !state.showShadows })),

      toggleAmbientOcclusion: () =>
        set((state) => ({ showAmbientOcclusion: !state.showAmbientOcclusion })),

      toggleAntialiasing: () =>
        set((state) => ({ antialiasing: !state.antialiasing })),

      startMeasurement3D: () =>
        set({ measurement3DActive: true, measurement3DPoints: [] }),

      addMeasurement3DPoint: (point) =>
        set((state) => ({
          measurement3DPoints: [...state.measurement3DPoints, point],
        })),

      clearMeasurement3D: () =>
        set({ measurement3DActive: false, measurement3DPoints: [] }),
    }),
    {
      name: "ai-designer-viewer",
      partialize: (state) => ({
        // Persist user preferences
        backgroundColor: state.backgroundColor,
        showGrid: state.showGrid,
        gridSize: state.gridSize,
        snapToGrid: state.snapToGrid,
        measurementUnit: state.measurementUnit,
        renderQuality: state.renderQuality,
        showShadows: state.showShadows,
        antialiasing: state.antialiasing,
        cameraMode: state.cameraMode,
      }),
    }
  )
);

// =============================================================================
// Selector Hooks for Common Operations
// =============================================================================

export const useActiveTool = () => useViewerStore((state) => state.activeTool);
export const useSelectedElements = () => useViewerStore((state) => state.selectedElementIds);
export const useViewTransform = () => useViewerStore((state) => state.viewTransform);
export const useLayers = () => useViewerStore((state) => state.layers);
export const useBackgroundColor = () => useViewerStore((state) => state.backgroundColor);

export const useVisibleFloors = () => useViewerStore((state) => state.visibleFloors);
export const useClippingPlanes = () => useViewerStore((state) => state.clippingPlanes);
export const useCameraMode = () => useViewerStore((state) => state.cameraMode);
export const useSelectedObjects = () => useViewerStore((state) => state.selectedObjectIds);
