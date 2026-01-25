"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData, DesignPhase } from "@/types";

interface SiteContextProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const phases: { value: DesignPhase; label: string; labelAr: string; description: string; descriptionAr: string }[] = [
  {
    value: "schematic",
    label: "Schematic Design",
    labelAr: "التصميم التخطيطي",
    description: "Early concept exploration",
    descriptionAr: "استكشاف المفهوم المبكر",
  },
  {
    value: "design_development",
    label: "Design Development",
    labelAr: "تطوير التصميم",
    description: "Detailed design refinement",
    descriptionAr: "تحسين التصميم التفصيلي",
  },
  {
    value: "construction_documents",
    label: "Construction Docs",
    labelAr: "وثائق البناء",
    description: "Final construction details",
    descriptionAr: "تفاصيل البناء النهائية",
  },
];

export function SiteContext({ data, onChange }: SiteContextProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
          {isRtl ? "سياق الموقع" : "Site Context"}
        </h2>
        <p className="text-[var(--ink-soft)]">
          {isRtl
            ? "حدد مرحلة التصميم ومعايير المبنى"
            : "Define design phase and building parameters"}
        </p>
      </div>

      {/* Design Phase */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "مرحلة التصميم" : "Design Phase"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {phases.map((phase) => (
            <button
              key={phase.value}
              onClick={() => onChange({ phase: phase.value })}
              className={cn(
                "p-4 rounded-[var(--radius-md)] border text-left transition-all",
                data.phase === phase.value
                  ? "bg-[rgba(15,76,129,0.1)] border-[var(--accent)] shadow-md"
                  : "bg-[var(--surface-2)] border-[var(--line)] hover:border-[var(--accent)]"
              )}
            >
              <span
                className={cn(
                  "block text-sm font-semibold mb-1",
                  data.phase === phase.value
                    ? "text-[var(--accent)]"
                    : "text-[var(--ink)]"
                )}
              >
                {isRtl ? phase.labelAr : phase.label}
              </span>
              <span className="text-xs text-[var(--ink-soft)]">
                {isRtl ? phase.descriptionAr : phase.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* GFA Slider */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "المساحة الإجمالية (م²)" : "Gross Floor Area (m²)"}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="1000"
            max="100000"
            step="1000"
            value={data.gfa || 10000}
            onChange={(e) => onChange({ gfa: parseInt(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--ink-faint)]">1,000 m²</span>
            <span className="text-lg font-bold text-[var(--accent)]">
              {(data.gfa || 10000).toLocaleString()} m²
            </span>
            <span className="text-xs text-[var(--ink-faint)]">100,000 m²</span>
          </div>
        </div>
      </div>

      {/* Floors Slider */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "عدد الطوابق" : "Number of Floors"}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="60"
            value={data.floors || 10}
            onChange={(e) => onChange({ floors: parseInt(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--ink-faint)]">1</span>
            <span className="text-lg font-bold text-[var(--accent)]">
              {data.floors || 10} {isRtl ? "طابق" : "floors"}
            </span>
            <span className="text-xs text-[var(--ink-faint)]">60</span>
          </div>
        </div>
      </div>

      {/* Site Model Upload */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "نموذج الموقع (اختياري)" : "Site Model (Optional)"}
        </label>
        <div className="border-2 border-dashed border-[var(--line)] rounded-[var(--radius-md)] p-8 text-center hover:border-[var(--accent)] transition-colors cursor-pointer">
          <p className="text-[var(--ink-soft)]">
            {isRtl
              ? "اسحب وأفلت ملف IFC أو اضغط للتحميل"
              : "Drag & drop IFC file or click to upload"}
          </p>
          <p className="text-xs text-[var(--ink-faint)] mt-2">
            {isRtl ? "IFC, DWG, PDF حتى 50 ميجابايت" : "IFC, DWG, PDF up to 50MB"}
          </p>
        </div>
      </div>
    </div>
  );
}
