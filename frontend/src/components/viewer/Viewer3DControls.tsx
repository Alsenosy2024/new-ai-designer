"use client";

import { useViewerStore } from "@/stores/viewer-store";
import {
  RotateCcw,
  Ruler,
  Sun,
  Moon,
  Move3D,
  User,
  Target,
  Maximize2,
} from "lucide-react";

interface Viewer3DControlsProps {
  onFullscreen?: () => void;
  className?: string;
  isRtl?: boolean;
}

export function Viewer3DControls({ onFullscreen, className = "", isRtl = false }: Viewer3DControlsProps) {
  const {
    cameraMode,
    renderQuality,
    showShadows,
    measurement3DActive,
    setCameraMode,
    resetCamera,
    setRenderQuality,
    toggleShadows,
    startMeasurement3D,
    clearMeasurement3D,
  } = useViewerStore();

  const handleMeasureToggle = () => {
    if (measurement3DActive) {
      clearMeasurement3D();
    } else {
      startMeasurement3D();
    }
  };

  return (
    <div className={`flex items-center gap-1 bg-slate-800/90 backdrop-blur rounded-full px-3 py-1.5 shadow-lg border border-slate-700 ${className}`}>
      {/* Camera Mode Toggle */}
      <div className="flex items-center border-r border-slate-600 pr-2 mr-1">
        <button
          onClick={() => setCameraMode("orbit")}
          className={`p-1.5 rounded-full transition-colors ${
            cameraMode === "orbit"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title={isRtl ? "وضع الدوران" : "Orbit Mode"}
        >
          <Move3D className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCameraMode("firstPerson")}
          className={`p-1.5 rounded-full transition-colors ${
            cameraMode === "firstPerson"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title={isRtl ? "وضع التجول" : "Walk Mode"}
        >
          <User className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCameraMode("plan")}
          className={`p-1.5 rounded-full transition-colors ${
            cameraMode === "plan"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          }`}
          title={isRtl ? "منظور علوي" : "Plan View"}
        >
          <Target className="w-4 h-4" />
        </button>
      </div>

      {/* Reset Camera */}
      <button
        onClick={resetCamera}
        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
        title={isRtl ? "إعادة تعيين الكاميرا" : "Reset Camera"}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Measure Tool */}
      <button
        onClick={handleMeasureToggle}
        className={`p-1.5 rounded-full transition-colors ${
          measurement3DActive
            ? "bg-amber-600 text-white"
            : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        }`}
        title={isRtl ? "أداة القياس" : "Measure Tool"}
      >
        <Ruler className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Render Quality */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setRenderQuality("low")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            renderQuality === "low"
              ? "bg-slate-600 text-slate-200"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title={isRtl ? "جودة منخفضة" : "Low Quality"}
        >
          L
        </button>
        <button
          onClick={() => setRenderQuality("medium")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            renderQuality === "medium"
              ? "bg-slate-600 text-slate-200"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title={isRtl ? "جودة متوسطة" : "Medium Quality"}
        >
          M
        </button>
        <button
          onClick={() => setRenderQuality("high")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            renderQuality === "high"
              ? "bg-slate-600 text-slate-200"
              : "text-slate-500 hover:text-slate-300"
          }`}
          title={isRtl ? "جودة عالية" : "High Quality"}
        >
          H
        </button>
      </div>

      {/* Shadows Toggle */}
      <button
        onClick={toggleShadows}
        className={`p-1.5 rounded-full transition-colors ${
          showShadows
            ? "text-yellow-400 bg-slate-700"
            : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
        }`}
        title={isRtl ? "الظلال" : "Shadows"}
      >
        {showShadows ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Fullscreen */}
      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          title={isRtl ? "ملء الشاشة" : "Fullscreen"}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}

      {/* Instructions */}
      <div className="hidden sm:block text-xs text-slate-500 px-2 border-l border-slate-600 ml-1">
        {isRtl ? "اسحب للدوران | تمرير للتكبير" : "Drag to orbit | Scroll to zoom"}
      </div>
    </div>
  );
}

export default Viewer3DControls;
