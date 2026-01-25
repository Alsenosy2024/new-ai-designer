"use client";

import { useRef, useState } from "react";
import { useViewerStore } from "@/stores/viewer-store";
import { Scissors, Plus, Trash2, Eye, EyeOff, RotateCcw } from "lucide-react";
import type { ClippingPlane } from "@/types/cad";

interface SectionPlanePanelProps {
  className?: string;
  isRtl?: boolean;
}

const PRESET_PLANES = [
  { name: "Top", normal: { x: 0, y: -1, z: 0 }, nameAr: "أعلى" },
  { name: "Bottom", normal: { x: 0, y: 1, z: 0 }, nameAr: "أسفل" },
  { name: "Front", normal: { x: 0, y: 0, z: -1 }, nameAr: "أمام" },
  { name: "Back", normal: { x: 0, y: 0, z: 1 }, nameAr: "خلف" },
  { name: "Left", normal: { x: 1, y: 0, z: 0 }, nameAr: "يسار" },
  { name: "Right", normal: { x: -1, y: 0, z: 0 }, nameAr: "يمين" },
];

export function SectionPlanePanel({ className = "", isRtl = false }: SectionPlanePanelProps) {
  const {
    clippingPlanes,
    activeClippingPlaneId,
    addClippingPlane,
    removeClippingPlane,
    toggleClippingPlane,
    setActiveClippingPlane,
    updateClippingPlane,
    clearAllClippingPlanes,
  } = useViewerStore();

  const [showPresets, setShowPresets] = useState(false);
  const planeIdRef = useRef(0);

  const handleAddPreset = (preset: (typeof PRESET_PLANES)[0]) => {
    planeIdRef.current += 1;
    const id = `plane-${planeIdRef.current}`;
    const newPlane: ClippingPlane = {
      id,
      name: isRtl ? preset.nameAr : preset.name,
      normal: preset.normal,
      constant: 0,
      enabled: true,
    };
    addClippingPlane(newPlane);
    setActiveClippingPlane(id);
    setShowPresets(false);
  };

  const handleDistanceChange = (id: string, constant: number) => {
    updateClippingPlane(id, { constant });
  };

  return (
    <div className={`bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-300">
            {isRtl ? "قطع المقاطع" : "Section Cuts"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-colors"
            title={isRtl ? "إضافة قطع" : "Add section"}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {clippingPlanes.length > 0 && (
            <button
              onClick={clearAllClippingPlanes}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
              title={isRtl ? "مسح الكل" : "Clear all"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Selector */}
      {showPresets && (
        <div className="mb-2 grid grid-cols-3 gap-1">
          {PRESET_PLANES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleAddPreset(preset)}
              className="px-2 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
            >
              {isRtl ? preset.nameAr : preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Planes */}
      {clippingPlanes.length === 0 ? (
        <div className="text-xs text-slate-500 text-center py-3">
          {isRtl ? "لا توجد مقاطع" : "No section planes"}
        </div>
      ) : (
        <div className="space-y-2">
          {clippingPlanes.map((plane) => {
            const isActive = activeClippingPlaneId === plane.id;

            return (
              <div
                key={plane.id}
                className={`rounded p-2 transition-colors ${
                  isActive ? "bg-slate-700/70 ring-1 ring-blue-500" : "bg-slate-700/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  {/* Plane name */}
                  <button
                    onClick={() => setActiveClippingPlane(isActive ? null : plane.id)}
                    className={`text-xs font-medium transition-colors ${
                      plane.enabled ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    {plane.name}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Toggle visibility */}
                    <button
                      onClick={() => toggleClippingPlane(plane.id)}
                      className={`p-1 rounded transition-colors ${
                        plane.enabled
                          ? "text-blue-400 hover:bg-slate-600"
                          : "text-slate-500 hover:bg-slate-600"
                      }`}
                      title={plane.enabled ? (isRtl ? "إخفاء" : "Hide") : (isRtl ? "عرض" : "Show")}
                    >
                      {plane.enabled ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Remove plane */}
                    <button
                      onClick={() => removeClippingPlane(plane.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-600 transition-colors"
                      title={isRtl ? "حذف" : "Remove"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distance slider */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="0.5"
                    value={plane.constant}
                    onChange={(e) => handleDistanceChange(plane.id, parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    disabled={!plane.enabled}
                  />
                  <span className="text-xs text-slate-400 w-10 text-right font-mono">
                    {plane.constant.toFixed(1)}
                  </span>
                  <button
                    onClick={() => handleDistanceChange(plane.id, 0)}
                    className="p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-600 transition-colors"
                    title={isRtl ? "إعادة تعيين" : "Reset"}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SectionPlanePanel;
