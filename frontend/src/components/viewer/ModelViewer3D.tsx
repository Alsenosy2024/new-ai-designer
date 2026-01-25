"use client";

import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import type { RefObject } from "react";
import { Canvas, useThree, useFrame, invalidate } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  useGLTF,
  Center,
  PointerLockControls,
  Edges,
  Html,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import type {
  OrbitControls as OrbitControlsImpl,
  PointerLockControls as PointerLockControlsImpl,
} from "three-stdlib";
import { useViewerStore } from "@/stores/viewer-store";

// =============================================================================
// Constants
// =============================================================================

const TARGET_FPS = 60;
const RENDER_QUALITY_SETTINGS = {
  low: { shadowMapSize: 512, antialias: false, pixelRatio: 1 },
  medium: { shadowMapSize: 1024, antialias: true, pixelRatio: 1.5 },
  high: { shadowMapSize: 2048, antialias: true, pixelRatio: 2 },
};

// =============================================================================
// Types
// =============================================================================

interface ModelViewer3DProps {
  modelUrl: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface FloorData {
  index: number;
  meshes: THREE.Mesh[];
  minY: number;
  maxY: number;
}

// =============================================================================
// Helper Components
// =============================================================================

function FrameLimiter() {
  const lastFrameTime = useRef(0);
  const frameInterval = 1000 / TARGET_FPS;

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * 1000;
    if (currentTime - lastFrameTime.current >= frameInterval) {
      lastFrameTime.current = currentTime;
      invalidate();
    }
  });

  return null;
}

// Loading spinner for 3D view
function LoadingSpinner() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[8, 8, 8]} />
      <meshStandardMaterial color="#c7b8a8" wireframe />
    </mesh>
  );
}

// =============================================================================
// Clipping Planes Component
// =============================================================================

interface ClippingPlanesManagerProps {
  enabled: boolean;
}

function ClippingPlanesManager({ enabled }: ClippingPlanesManagerProps) {
  const { gl } = useThree();
  const { clippingPlanes } = useViewerStore();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    rendererRef.current = gl;
  }, [gl]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    if (!enabled || clippingPlanes.length === 0) {
      renderer.clippingPlanes = [];
      renderer.localClippingEnabled = false;
      return;
    }

    const planes = clippingPlanes
      .filter((p) => p.enabled)
      .map((p) => {
        const normal = new THREE.Vector3(p.normal.x, p.normal.y, p.normal.z);
        return new THREE.Plane(normal, p.constant);
      });

    renderer.clippingPlanes = planes;
    renderer.localClippingEnabled = true;

    return () => {
      const current = rendererRef.current;
      if (current) {
        current.clippingPlanes = [];
      }
    };
  }, [clippingPlanes, enabled]);

  return null;
}

// =============================================================================
// Selection Outline Component
// =============================================================================

interface SelectionOutlineProps {
  objects: THREE.Object3D[];
}

function SelectionOutline({ objects }: SelectionOutlineProps) {
  if (objects.length === 0) return null;

  return (
    <>
      {objects.map((obj, idx) => {
        if (!(obj instanceof THREE.Mesh)) return null;
        return (
          <mesh key={idx} geometry={obj.geometry} position={obj.position} rotation={obj.rotation} scale={obj.scale}>
            <meshBasicMaterial color="#00aaff" transparent opacity={0.3} side={THREE.DoubleSide} />
            <Edges threshold={15} color="#00aaff" lineWidth={2} />
          </mesh>
        );
      })}
    </>
  );
}

// =============================================================================
// 3D Measurement Component
// =============================================================================

interface MeasurementLine3DProps {
  points: THREE.Vector3[];
  unit: string;
}

function MeasurementLine3D({ points, unit }: MeasurementLine3DProps) {
  if (points.length < 2) return null;

  const linePoints = points.map((p) => [p.x, p.y, p.z] as [number, number, number]);

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += points[i].distanceTo(points[i + 1]);
  }

  const midpoint = points.length >= 2
    ? new THREE.Vector3().lerpVectors(points[0], points[points.length - 1], 0.5)
    : points[0];

  const formatDistance = (d: number): string => {
    switch (unit) {
      case "mm":
        return `${(d * 1000).toFixed(0)} mm`;
      case "ft":
        return `${(d * 3.28084).toFixed(2)} ft`;
      default:
        return `${d.toFixed(2)} m`;
    }
  };

  return (
    <group>
      <Line points={linePoints} color="#ffaa00" lineWidth={3} />
      {/* Measurement points */}
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
      ))}
      {/* Distance label */}
      <Html position={[midpoint.x, midpoint.y + 1, midpoint.z]} center>
        <div className="bg-amber-500 text-white px-2 py-1 rounded text-sm font-mono shadow-lg whitespace-nowrap">
          {formatDistance(totalDistance)}
        </div>
      </Html>
    </group>
  );
}

// =============================================================================
// First Person Controls Component
// =============================================================================

interface FirstPersonModeProps {
  enabled: boolean;
  speed?: number;
}

function FirstPersonMode({ enabled, speed = 0.5 }: FirstPersonModeProps) {
  const { camera } = useThree();
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = true;
          break;
        case "Space":
          moveState.current.up = true;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          moveState.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          moveState.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveState.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveState.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveState.current.right = false;
          break;
        case "Space":
          moveState.current.up = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          moveState.current.down = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      moveState.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
      };
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);
    const upVector = new THREE.Vector3(0, Number(moveState.current.up) - Number(moveState.current.down), 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed * delta * 60)
      .applyEuler(camera.rotation);

    direction.add(upVector.multiplyScalar(speed * delta * 60));

    camera.position.add(direction);
  });

  if (!enabled) return null;

  return <PointerLockControls ref={controlsRef} />;
}

// =============================================================================
// Scene Content Component
// =============================================================================

interface SceneContentProps {
  modelUrl: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

function SceneContent({ modelUrl, onLoad, onError }: SceneContentProps) {
  const { scene: gltfScene } = useGLTF(modelUrl, true, true, (loader) => {
    loader.manager.onLoad = () => onLoad?.();
    loader.manager.onError = (url) => onError?.(new Error(`Failed to load: ${url}`));
  });

  const { raycaster, pointer, camera } = useThree();

  const {
    visibleFloors,
    setTotalFloors,
    explodedView,
    explodeDistance,
    selectedObjectIds,
    selectObject,
    setHoveredObject,
    clearObjectSelection,
    measurement3DActive,
    measurement3DPoints,
    addMeasurement3DPoint,
    measurementUnit,
  } = useViewerStore();

  const floorDataRef = useRef<FloorData[]>([]);
  const visibleFloorsRef = useRef(visibleFloors);
  const explodedViewRef = useRef(explodedView);
  const explodeDistanceRef = useRef(explodeDistance);

  useEffect(() => {
    visibleFloorsRef.current = visibleFloors;
    explodedViewRef.current = explodedView;
    explodeDistanceRef.current = explodeDistance;
  }, [visibleFloors, explodedView, explodeDistance]);

  const applyFloorVisibility = useCallback(() => {
    const floorData = floorDataRef.current;
    if (!floorData.length) return;
    const activeFloors = visibleFloorsRef.current;
    const isExploded = explodedViewRef.current;
    const explodeDistanceValue = explodeDistanceRef.current;

    floorData.forEach((floor) => {
      const isVisible = activeFloors.includes(floor.index);
      floor.meshes.forEach((mesh) => {
        mesh.visible = isVisible;

        if (isExploded && isVisible) {
          mesh.position.y = mesh.userData.originalY ?? mesh.position.y;
          if (mesh.userData.originalY === undefined) {
            mesh.userData.originalY = mesh.position.y;
          }
          mesh.position.y += floor.index * explodeDistanceValue;
        } else if (mesh.userData.originalY !== undefined) {
          mesh.position.y = mesh.userData.originalY;
        }
      });
    });
  }, []);

  // Analyze model and detect floors
  useEffect(() => {
    if (!gltfScene) return;

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(gltfScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    gltfScene.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 50) {
      const scale = 50 / maxDim;
      gltfScene.scale.setScalar(scale);
    }

    // Detect floors based on Y position
    const meshes: THREE.Mesh[] = [];
    gltfScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
        // Enable clipping for each mesh
        if (child.material instanceof THREE.Material) {
          child.material.clippingPlanes = [];
          child.material.clipShadows = true;
        }
        // Assign unique userData for selection
        child.userData.selectableId = child.uuid;
      }
    });

    if (meshes.length === 0) return;

    // Calculate bounding boxes for floor detection
    const yPositions = meshes.map((m) => {
      const meshBox = new THREE.Box3().setFromObject(m);
      return { mesh: m, minY: meshBox.min.y, maxY: meshBox.max.y };
    });

    // Sort by Y position and group into floors
    yPositions.sort((a, b) => a.minY - b.minY);

    // Simple floor detection: divide height into equal sections
    const totalHeight = Math.max(...yPositions.map((p) => p.maxY)) - Math.min(...yPositions.map((p) => p.minY));
    const estimatedFloorHeight = 3; // meters (scaled)
    const estimatedFloors = Math.max(1, Math.round(totalHeight / estimatedFloorHeight));

    const detectedFloors: FloorData[] = [];
    const floorHeight = totalHeight / estimatedFloors;
    const baseY = Math.min(...yPositions.map((p) => p.minY));

    for (let i = 0; i < estimatedFloors; i++) {
      const floorMinY = baseY + i * floorHeight;
      const floorMaxY = baseY + (i + 1) * floorHeight;
      const floorMeshes = meshes.filter((m) => {
        const meshBox = new THREE.Box3().setFromObject(m);
        const meshCenterY = (meshBox.min.y + meshBox.max.y) / 2;
        return meshCenterY >= floorMinY && meshCenterY < floorMaxY;
      });

      if (floorMeshes.length > 0) {
        detectedFloors.push({
          index: i,
          meshes: floorMeshes,
          minY: floorMinY,
          maxY: floorMaxY,
        });
      }
    }

    floorDataRef.current = detectedFloors;
    setTotalFloors(detectedFloors.length || 1);
    applyFloorVisibility();
  }, [gltfScene, setTotalFloors, applyFloorVisibility]);

  useEffect(() => {
    applyFloorVisibility();
  }, [applyFloorVisibility, visibleFloors, explodedView, explodeDistance]);

  const selectedMeshes = useMemo(() => {
    if (!gltfScene) return [];
    const selected: THREE.Mesh[] = [];
    gltfScene.traverse((child) => {
      if (child instanceof THREE.Mesh && selectedObjectIds.includes(child.userData.selectableId)) {
        selected.push(child);
      }
    });
    return selected;
  }, [gltfScene, selectedObjectIds]);

  // Click handler for selection and measurement
  const handleClick = useCallback(
    (event: { stopPropagation: () => void; shiftKey?: boolean }) => {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(gltfScene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0];

        if (measurement3DActive) {
          // Add measurement point
          addMeasurement3DPoint({
            x: hit.point.x,
            y: hit.point.y,
            z: hit.point.z,
          });
        } else {
          // Object selection
          const mesh = hit.object as THREE.Mesh;
          if (mesh.userData.selectableId) {
            selectObject(mesh.userData.selectableId, event.shiftKey ?? false);
          }
        }
      } else if (!measurement3DActive) {
        clearObjectSelection();
      }
    },
    [raycaster, pointer, camera, gltfScene, measurement3DActive, addMeasurement3DPoint, selectObject, clearObjectSelection]
  );

  // Pointer move for hover effect
  const handlePointerMove = useCallback(() => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(gltfScene.children, true);

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      if (mesh.userData.selectableId) {
        setHoveredObject(mesh.userData.selectableId);
      }
    } else {
      setHoveredObject(null);
    }
  }, [raycaster, pointer, camera, gltfScene, setHoveredObject]);

  // Measurement points as THREE.Vector3
  const measurementVector3Points = useMemo(() => {
    return measurement3DPoints.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  }, [measurement3DPoints]);

  return (
    <group onClick={handleClick} onPointerMove={handlePointerMove}>
      <Center>
        <primitive object={gltfScene} />
      </Center>
      <SelectionOutline objects={selectedMeshes} />
      {measurement3DActive && measurement3DPoints.length > 0 && (
        <MeasurementLine3D points={measurementVector3Points} unit={measurementUnit} />
      )}
    </group>
  );
}

// =============================================================================
// Orbit Controls Wrapper
// =============================================================================

interface ControlsWrapperProps {
  cameraMode: "orbit" | "firstPerson" | "plan" | "elevation";
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

function ControlsWrapper({ cameraMode, controlsRef }: ControlsWrapperProps) {
  const { camera } = useThree();
  const { cameraPosition, cameraTarget, setCameraPosition, setCameraTarget } = useViewerStore();

  // Apply camera position from store
  useEffect(() => {
    const target = new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z);
    const distance = Math.max(camera.position.distanceTo(target), 10);

    if (cameraMode === "firstPerson") {
      camera.up.set(0, 1, 0);
      return;
    }

    if (cameraMode === "orbit") {
      camera.up.set(0, 1, 0);
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    } else if (cameraMode === "plan") {
      camera.up.set(0, 0, -1);
      camera.position.set(target.x, target.y + distance, target.z);
    } else if (cameraMode === "elevation") {
      camera.up.set(0, 1, 0);
      camera.position.set(target.x, target.y + distance * 0.2, target.z + distance);
    }

    if (controlsRef.current) {
      controlsRef.current.target.set(target.x, target.y, target.z);
      controlsRef.current.update();
    }

    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, cameraMode, cameraPosition, cameraTarget, controlsRef]);

  if (cameraMode === "firstPerson") return null;

  const lockRotation = cameraMode === "plan" || cameraMode === "elevation";

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={500}
      enableRotate={!lockRotation}
      minPolarAngle={cameraMode === "plan" ? Math.PI / 2 : 0}
      maxPolarAngle={cameraMode === "plan" ? Math.PI / 2 : Math.PI * 0.9}
      target={[cameraTarget.x, cameraTarget.y, cameraTarget.z]}
      onChange={() => {
        if (cameraMode !== "orbit") return;
        if (!controlsRef.current) return;
        const pos = camera.position;
        const target = controlsRef.current.target;
        setCameraPosition({ x: pos.x, y: pos.y, z: pos.z });
        setCameraTarget({ x: target.x, y: target.y, z: target.z });
      }}
    />
  );
}

// =============================================================================
// Main ModelViewer3D Component
// =============================================================================

export function ModelViewer3D({ modelUrl, className = "", onLoad, onError }: ModelViewer3DProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    cameraMode,
    renderQuality,
    showShadows,
    clippingPlanes,
    measurement3DActive,
    setCameraMode,
  } = useViewerStore();

  const qualitySettings = RENDER_QUALITY_SETTINGS[renderQuality];

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(
    (err: Error) => {
      setLoading(false);
      setError(err.message);
      onError?.(err);
    },
    [onError]
  );

  // Pause rendering when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Handle escape key for first person mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cameraMode === "firstPerson") {
        setCameraMode("orbit");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cameraMode, setCameraMode]);

  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-slate-900 to-slate-800 ${className}`}>
        <div className="text-center text-slate-400">
          <div className="w-16 h-16 mx-auto mb-4 opacity-30 border-2 border-dashed border-slate-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">3D</span>
          </div>
          <p className="text-lg font-medium">No model available</p>
          <p className="text-sm mt-2">Generate a project to view the 3D model</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        ref={canvasRef}
        camera={{ position: [60, 40, 60], fov: 50 }}
        style={{ background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}
        frameloop={isVisible ? "always" : "never"}
        dpr={[1, qualitySettings.pixelRatio]}
        shadows={showShadows}
        gl={{
          antialias: qualitySettings.antialias,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          localClippingEnabled: true,
        }}
        performance={{ min: 0.5 }}
      >
        <FrameLimiter />
        <ClippingPlanesManager enabled={clippingPlanes.length > 0} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 100, 50]}
          intensity={1}
          castShadow={showShadows}
          shadow-mapSize={[qualitySettings.shadowMapSize, qualitySettings.shadowMapSize]}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight position={[-30, 50, -30]} intensity={0.4} />
        <hemisphereLight intensity={0.3} groundColor="#1a1a2e" />

        {/* Model */}
        <Suspense fallback={<LoadingSpinner />}>
          <SceneContent modelUrl={modelUrl} onLoad={handleLoad} onError={handleError} />
        </Suspense>

        {/* Ground Grid */}
        <Grid
          args={[200, 200]}
          position={[0, -0.1, 0]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={25}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={150}
          fadeStrength={1.5}
          followCamera={false}
        />

        {/* Controls */}
        <ControlsWrapper cameraMode={cameraMode} controlsRef={controlsRef} />
        <FirstPersonMode enabled={cameraMode === "firstPerson"} speed={0.3} />
      </Canvas>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-300">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/80 border border-red-500 rounded-lg p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* First Person Mode Instructions */}
      {cameraMode === "firstPerson" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-slate-200">
          <span className="font-medium">Walkthrough Mode:</span> WASD to move, Mouse to look, Space/Shift for up/down, ESC to exit
        </div>
      )}

      {/* Measurement Mode Indicator */}
      {measurement3DActive && (
        <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur rounded-lg px-3 py-2 text-sm text-white font-medium">
          Measurement Mode: Click points to measure distance
        </div>
      )}

      {/* Model Info */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur rounded px-3 py-1.5 shadow border border-slate-600">
        <span className="text-xs text-slate-300 font-mono">glTF 2.0</span>
      </div>
    </div>
  );
}

export default ModelViewer3D;
