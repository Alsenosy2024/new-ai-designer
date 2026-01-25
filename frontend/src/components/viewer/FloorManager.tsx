"use client";

import { useViewerStore } from "@/stores/viewer-store";
import { Eye, EyeOff, Layers, SplitSquareVertical } from "lucide-react";

interface FloorManagerProps {
  className?: string;
  isRtl?: boolean;
}

export function FloorManager({ className = "", isRtl = false }: FloorManagerProps) {
  const {
    totalFloors,
    visibleFloors,
    explodedView,
    explodeDistance,
    toggleFloorVisibility,
    showAllFloors,
    hideAllFloors,
    isolateFloor,
    toggleExplodedView,
    setExplodeDistance,
  } = useViewerStore();

  if (totalFloors <= 1) {
    return (
      <div className={`bg-slate-800/90 backdrop-blur rounded-lg p-2 ${className}`}>
        <div className="text-xs text-slate-400 text-center px-2">
          {isRtl ? "طابق واحد" : "Single floor"}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            {isRtl ? "الطوابق" : "Floors"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={showAllFloors}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isRtl ? "عرض الكل" : "Show all"}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={hideAllFloors}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isRtl ? "إخفاء الكل" : "Hide all"}
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floor Buttons */}
      <div className="space-y-1">
        {Array.from({ length: totalFloors }, (_, i) => {
          const floorNum = totalFloors - 1 - i; // Display from top to bottom
          const isVisible = visibleFloors.includes(floorNum);
          const isIsolated = visibleFloors.length === 1 && visibleFloors[0] === floorNum;

          return (
            <div
              key={floorNum}
              className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
                isVisible ? "bg-slate-700/50" : "bg-transparent"
              }`}
            >
              {/* Visibility toggle */}
              <button
                onClick={() => toggleFloorVisibility(floorNum)}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  isVisible
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Floor number */}
              <span
                className={`flex-1 text-sm font-medium ${
                  isVisible ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {isRtl ? `طابق ${floorNum + 1}` : `Floor ${floorNum + 1}`}
              </span>

              {/* Isolate button */}
              <button
                onClick={() => isolateFloor(floorNum)}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                  isIsolated
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                }`}
                title={isRtl ? "عزل" : "Solo"}
              >
                S
              </button>
            </div>
          );
        })}
      </div>

      {/* Exploded View */}
      <div className="mt-3 pt-2 border-t border-slate-700">
        <button
          onClick={toggleExplodedView}
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded transition-colors ${
            explodedView ? "bg-blue-600/30 text-blue-300" : "hover:bg-slate-700 text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <SplitSquareVertical className="w-4 h-4" />
            <span className="text-xs font-medium">
              {isRtl ? "عرض منفصل" : "Exploded View"}
            </span>
          </div>
          <div
            className={`w-8 h-4 rounded-full transition-colors ${
              explodedView ? "bg-blue-600" : "bg-slate-600"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${
                explodedView ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {/* Explode distance slider */}
        {explodedView && (
          <div className="mt-2 px-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{isRtl ? "المسافة" : "Distance"}</span>
              <span>{explodeDistance.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={explodeDistance}
              onChange={(e) => setExplodeDistance(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorManager;
