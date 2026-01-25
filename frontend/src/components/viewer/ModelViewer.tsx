"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame, invalidate } from "@react-three/fiber";
import { OrbitControls, Grid, useGLTF, Center } from "@react-three/drei";
import { Loader2, Box, RotateCcw } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Performance constants
const TARGET_FPS = 30;
const MAX_PIXEL_RATIO = 1.5;

interface ModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

function Model({ url, onLoad, onError }: ModelProps) {
  const { scene } = useGLTF(url, true, true, (loader) => {
    loader.manager.onLoad = () => onLoad?.();
    loader.manager.onError = (url) => onError?.(new Error(`Failed to load: ${url}`));
  });

  useEffect(() => {
    if (scene) {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Move model to origin
      scene.position.sub(center);

      // Scale to fit
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 50) {
        const scale = 50 / maxDim;
        scene.scale.setScalar(scale);
      }
    }
  }, [scene]);

  return <primitive object={scene} />;
}

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(60, 40, 60);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// Frame rate limiter for performance optimization
function FrameLimiter() {
  const lastFrameTime = useRef(0);
  const frameInterval = 1000 / TARGET_FPS;

  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * 1000;
    if (currentTime - lastFrameTime.current >= frameInterval) {
      lastFrameTime.current = currentTime;
      invalidate(); // Request next frame
    }
  });

  return null;
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color="#c7b8a8" wireframe />
    </mesh>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  className?: string;
}

export function ModelViewer({ modelUrl, className = "" }: ModelViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = (err: Error) => {
    setLoading(false);
    setError(err.message);
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Pause rendering when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center h-full bg-gradient-to-b from-[#e8e4dc] to-[#d4d0c8] ${className}`}>
        <div className="text-center text-[var(--ink-faint)]">
          <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No model available</p>
          <p className="text-sm mt-2">Generate a project to view the 3D model</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [60, 40, 60], fov: 45 }}
        style={{ background: "linear-gradient(to bottom, #e8e4dc, #d4d0c8)" }}
        frameloop={isVisible ? "demand" : "never"} // Pause when tab hidden
        dpr={[1, MAX_PIXEL_RATIO]} // Cap pixel ratio for performance
        gl={{
          antialias: false, // Disable expensive AA
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.5 }} // Allow quality reduction under load
      >
        <FrameLimiter />
        <CameraController />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-30, 30, -25]} intensity={0.3} />

        {/* Model */}
        <Suspense fallback={<LoadingFallback />}>
          <Center>
            <Model url={modelUrl} onLoad={handleLoad} onError={handleError} />
          </Center>
        </Suspense>

        {/* Ground Grid - Optimized for performance */}
        <Grid
          args={[100, 100]}  // Reduced from 200x200 for better performance
          position={[0, -0.1, 0]}
          cellSize={10}  // Larger cells = fewer lines
          cellThickness={0.5}
          cellColor="#c9c0b5"
          sectionSize={50}
          sectionThickness={1}
          sectionColor="#b5aa9d"
          fadeDistance={80}  // Fade closer for performance
          fadeStrength={1.5}
          followCamera={false}
        />

        {/* Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={300}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin text-[var(--accent)]" />
            <p className="text-sm text-[var(--ink-soft)]">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--surface)] rounded-full px-4 py-2 shadow-lg border border-[var(--line)]">
        <button
          onClick={resetCamera}
          className="p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <span className="text-xs text-[var(--ink-faint)] px-2">
          Drag to rotate | Scroll to zoom
        </span>
      </div>

      {/* Model info */}
      <div className="absolute top-4 right-4 bg-[var(--surface)] rounded-[var(--radius-sm)] px-3 py-1.5 shadow border border-[var(--line)]">
        <span className="text-xs text-[var(--ink-soft)] font-mono">
          glTF 2.0
        </span>
      </div>
    </div>
  );
}

export default ModelViewer;
