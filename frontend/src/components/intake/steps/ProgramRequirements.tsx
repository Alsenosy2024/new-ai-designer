"use client";

import { Textarea } from "@/components/ui";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData } from "@/types";

interface ProgramRequirementsProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

export function ProgramRequirements({ data, onChange }: ProgramRequirementsProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
          {isRtl ? "متطلبات البرنامج" : "Program Requirements"}
        </h2>
        <p className="text-[var(--ink-soft)]">
          {isRtl
            ? "وصف المشروع والمتطلبات الخاصة"
            : "Project description and specific requirements"}
        </p>
      </div>

      {/* Design Brief */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
          {isRtl ? "وصف المشروع" : "Design Brief"}
        </label>
        <Textarea
          value={data.design_brief || ""}
          onChange={(e) => onChange({ design_brief: e.target.value })}
          placeholder={
            isRtl
              ? "صف متطلبات المشروع، الأهداف، والقيود..."
              : "Describe project requirements, goals, and constraints..."
          }
          className="min-h-[120px]"
        />
        <p className="text-xs text-[var(--ink-faint)] mt-2">
          {isRtl
            ? "الذكاء الاصطناعي سيستخدم هذا الوصف لتحسين التصميم"
            : "AI will use this brief to optimize the design"}
        </p>
      </div>

      {/* Core Ratio */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "نسبة النواة (%)" : "Core Ratio (%)"}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="10"
            max="35"
            value={data.core_ratio || 20}
            onChange={(e) => onChange({ core_ratio: parseInt(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--ink-faint)]">10%</span>
            <span className="text-lg font-bold text-[var(--accent)]">
              {data.core_ratio || 20}%
            </span>
            <span className="text-xs text-[var(--ink-faint)]">35%</span>
          </div>
          <p className="text-xs text-[var(--ink-soft)]">
            {isRtl
              ? "المساحة المخصصة للمصاعد والسلالم والخدمات"
              : "Area allocated for elevators, stairs, and services"}
          </p>
        </div>
      </div>

      {/* Parking */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "مواقف السيارات" : "Parking Spaces"}
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={data.parking || 100}
            onChange={(e) => onChange({ parking: parseInt(e.target.value) })}
            className="w-full h-2 bg-[var(--bg-2)] rounded-full appearance-none cursor-pointer accent-[var(--accent)]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--ink-faint)]">0</span>
            <span className="text-lg font-bold text-[var(--accent)]">
              {data.parking || 100} {isRtl ? "موقف" : "spaces"}
            </span>
            <span className="text-xs text-[var(--ink-faint)]">500</span>
          </div>
        </div>
      </div>

      {/* Budget (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
            {isRtl ? "الميزانية (اختياري)" : "Budget (Optional)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]">
              $
            </span>
            <input
              type="number"
              value={data.budget || ""}
              onChange={(e) =>
                onChange({ budget: e.target.value ? parseInt(e.target.value) : undefined })
              }
              placeholder="0"
              className="w-full pl-8 pr-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
            {isRtl ? "موعد التسليم (اختياري)" : "Delivery Date (Optional)"}
          </label>
          <input
            type="date"
            value={data.delivery || ""}
            onChange={(e) => onChange({ delivery: e.target.value || undefined })}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>
    </div>
  );
}
