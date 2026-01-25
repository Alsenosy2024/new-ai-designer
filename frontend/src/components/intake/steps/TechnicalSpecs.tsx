"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData } from "@/types";

interface TechnicalSpecsProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const codeLibraries = [
  { value: "sbc", label: "Saudi Building Code", labelAr: "كود البناء السعودي" },
  { value: "uae_code", label: "UAE Building Code", labelAr: "كود البناء الإماراتي" },
  { value: "qcs", label: "Qatar Construction Spec", labelAr: "مواصفات البناء القطرية" },
  { value: "ibc", label: "International Building Code", labelAr: "كود البناء الدولي" },
];

const structuralSystems = [
  { value: "moment_frame", label: "Moment Frame", labelAr: "إطار زمني" },
  { value: "shear_wall", label: "Shear Wall", labelAr: "جدار قص" },
  { value: "dual_system", label: "Dual System", labelAr: "نظام مزدوج" },
  { value: "braced_frame", label: "Braced Frame", labelAr: "إطار مدعم" },
];

const mepStrategies = [
  { value: "standard", label: "Standard", labelAr: "قياسي" },
  { value: "high_efficiency", label: "High Efficiency", labelAr: "كفاءة عالية" },
  { value: "district_cooling", label: "District Cooling", labelAr: "تبريد مركزي" },
];

export function TechnicalSpecs({ data, onChange }: TechnicalSpecsProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
          {isRtl ? "المواصفات التقنية" : "Technical Specifications"}
        </h2>
        <p className="text-[var(--ink-soft)]">
          {isRtl
            ? "اختر الأنظمة الهيكلية والميكانيكية والأكواد"
            : "Select structural, MEP systems and code compliance"}
        </p>
      </div>

      {/* Code Library */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "مكتبة الأكواد" : "Code Library"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {codeLibraries.map((lib) => (
            <button
              key={lib.value}
              onClick={() => onChange({ code_library: lib.value })}
              className={cn(
                "p-3 rounded-[var(--radius-md)] border text-left transition-all",
                data.code_library === lib.value
                  ? "bg-[rgba(15,76,129,0.1)] border-[var(--accent)]"
                  : "bg-[var(--surface-2)] border-[var(--line)] hover:border-[var(--accent)]"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  data.code_library === lib.value
                    ? "text-[var(--accent)]"
                    : "text-[var(--ink)]"
                )}
              >
                {isRtl ? lib.labelAr : lib.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Structural System */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "النظام الهيكلي" : "Structural System"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {structuralSystems.map((sys) => (
            <button
              key={sys.value}
              onClick={() => onChange({ structural_system: sys.value })}
              className={cn(
                "p-3 rounded-[var(--radius-md)] border text-center transition-all",
                data.structural_system === sys.value
                  ? "bg-[rgba(15,76,129,0.1)] border-[var(--accent)]"
                  : "bg-[var(--surface-2)] border-[var(--line)] hover:border-[var(--accent)]"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  data.structural_system === sys.value
                    ? "text-[var(--accent)]"
                    : "text-[var(--ink)]"
                )}
              >
                {isRtl ? sys.labelAr : sys.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MEP Strategy */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "استراتيجية MEP" : "MEP Strategy"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {mepStrategies.map((strategy) => (
            <button
              key={strategy.value}
              onClick={() => onChange({ mep_strategy: strategy.value })}
              className={cn(
                "p-3 rounded-[var(--radius-md)] border text-center transition-all",
                data.mep_strategy === strategy.value
                  ? "bg-[rgba(15,76,129,0.1)] border-[var(--accent)]"
                  : "bg-[var(--surface-2)] border-[var(--line)] hover:border-[var(--accent)]"
              )}
            >
              <span
                className={cn(
                  "text-sm font-medium",
                  data.mep_strategy === strategy.value
                    ? "text-[var(--accent)]"
                    : "text-[var(--ink)]"
                )}
              >
                {isRtl ? strategy.labelAr : strategy.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy & Daylight Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
            {isRtl ? "هدف الطاقة (EUI kWh/m²/yr)" : "Energy Target (EUI kWh/m²/yr)"}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="50"
              max="150"
              value={data.energy_target || 85}
              onChange={(e) => onChange({ energy_target: parseInt(e.target.value) })}
              className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent-3)]"
            />
            <div className="flex justify-between">
              <span className="text-xs text-[var(--ink-faint)]">50</span>
              <span className="text-sm font-bold text-[var(--accent-3)]">
                {data.energy_target || 85}
              </span>
              <span className="text-xs text-[var(--ink-faint)]">150</span>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
            {isRtl ? "هدف الإضاءة الطبيعية (lux)" : "Daylight Target (lux)"}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="100"
              max="500"
              step="50"
              value={data.daylight || 300}
              onChange={(e) => onChange({ daylight: parseInt(e.target.value) })}
              className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent-2)]"
            />
            <div className="flex justify-between">
              <span className="text-xs text-[var(--ink-faint)]">100</span>
              <span className="text-sm font-bold text-[var(--accent-2)]">
                {data.daylight || 300} lux
              </span>
              <span className="text-xs text-[var(--ink-faint)]">500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
