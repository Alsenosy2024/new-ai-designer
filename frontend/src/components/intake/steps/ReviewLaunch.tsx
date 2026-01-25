"use client";

import { Building2, MapPin, Layers, Target, Zap, Sun } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData } from "@/types";

interface ReviewLaunchProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const labels = {
  regions: {
    saudi_arabia: { en: "Saudi Arabia", ar: "السعودية" },
    uae: { en: "UAE", ar: "الإمارات" },
    qatar: { en: "Qatar", ar: "قطر" },
    bahrain: { en: "Bahrain", ar: "البحرين" },
    oman: { en: "Oman", ar: "عمان" },
  } as Record<string, { en: string; ar: string }>,
  buildingTypes: {
    office: { en: "Office", ar: "مكتبي" },
    residential: { en: "Residential", ar: "سكني" },
    commercial: { en: "Commercial", ar: "تجاري" },
    hospitality: { en: "Hospitality", ar: "ضيافة" },
    healthcare: { en: "Healthcare", ar: "صحي" },
    education: { en: "Education", ar: "تعليمي" },
    retail: { en: "Retail", ar: "تجزئة" },
    mixed_use: { en: "Mixed Use", ar: "متعدد" },
  } as Record<string, { en: string; ar: string }>,
  phases: {
    schematic: { en: "Schematic Design", ar: "التصميم التخطيطي" },
    design_development: { en: "Design Development", ar: "تطوير التصميم" },
    construction_documents: { en: "Construction Documents", ar: "وثائق البناء" },
  } as Record<string, { en: string; ar: string }>,
};

export function ReviewLaunch({ data }: ReviewLaunchProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  const regionKey = data.region || "saudi_arabia";
  const buildingTypeKey = data.building_type || "office";
  const phaseKey = data.phase || "schematic";

  const region = labels.regions[regionKey] || { en: regionKey, ar: regionKey };
  const buildingType = labels.buildingTypes[buildingTypeKey] || { en: buildingTypeKey, ar: buildingTypeKey };
  const phase = labels.phases[phaseKey] || { en: phaseKey, ar: phaseKey };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
          {isRtl ? "مراجعة وإطلاق" : "Review & Launch"}
        </h2>
        <p className="text-[var(--ink-soft)]">
          {isRtl
            ? "راجع تفاصيل المشروع قبل بدء التوليد"
            : "Review project details before starting generation"}
        </p>
      </div>

      {/* Project Summary */}
      <div className="bg-[var(--bg-2)] rounded-[var(--radius-lg)] p-6 border border-[var(--line)]">
        <h3 className="text-lg font-bold text-[var(--ink)] mb-4">
          {data.name || (isRtl ? "مشروع بدون اسم" : "Untitled Project")}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "المنطقة" : "Region"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {isRtl ? region.ar : region.en}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <Building2 className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "نوع المبنى" : "Building Type"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {isRtl ? buildingType.ar : buildingType.en}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <Target className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "المرحلة" : "Phase"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {isRtl ? phase.ar : phase.en}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <Layers className="w-4 h-4 text-[var(--accent-3)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "المساحة / الطوابق" : "GFA / Floors"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {(data.gfa || 0).toLocaleString()} m² / {data.floors || 1}F
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <Zap className="w-4 h-4 text-[var(--accent-3)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "هدف الطاقة" : "Energy Target"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {data.energy_target || 85} kWh/m²
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] rounded-[var(--radius-sm)]">
              <Sun className="w-4 h-4 text-[var(--accent-2)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--ink-faint)]">
                {isRtl ? "هدف الإضاءة" : "Daylight Target"}
              </p>
              <p className="text-sm font-semibold text-[var(--ink)]">
                {data.daylight || 300} lux
              </p>
            </div>
          </div>
        </div>

        {/* Design Brief */}
        {data.design_brief && (
          <div className="mt-4 pt-4 border-t border-[var(--line)]">
            <p className="text-xs text-[var(--ink-faint)] mb-1">
              {isRtl ? "وصف المشروع" : "Design Brief"}
            </p>
            <p className="text-sm text-[var(--ink-soft)]">{data.design_brief}</p>
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      <div className="bg-[rgba(27,107,97,0.08)] rounded-[var(--radius-lg)] p-5 border border-[rgba(27,107,97,0.2)]">
        <h4 className="text-sm font-bold text-[var(--accent-3)] mb-3">
          {isRtl ? "اقتراحات الذكاء الاصطناعي" : "AI Suggestions"}
        </h4>
        <ul className="space-y-2 text-sm text-[var(--ink-soft)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-3)]">•</span>
            {isRtl
              ? `بناءً على نوع المبنى (${buildingType.ar})، يُنصح بنسبة نواة ${data.building_type === "office" ? "18-22%" : "15-20%"}`
              : `Based on building type (${buildingType.en}), recommended core ratio is ${data.building_type === "office" ? "18-22%" : "15-20%"}`}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-3)]">•</span>
            {isRtl
              ? `المنطقة (${region.ar}) تتطلب أنظمة تبريد عالية الكفاءة`
              : `Region (${region.en}) requires high-efficiency cooling systems`}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--accent-3)]">•</span>
            {isRtl
              ? "التصميم سيتم تحسينه وفقًا للأكواد المحلية"
              : "Design will be optimized according to local building codes"}
          </li>
        </ul>
      </div>

      {/* What happens next */}
      <div className="text-center text-sm text-[var(--ink-soft)]">
        <p>
          {isRtl
            ? "عند الضغط على 'إطلاق التوليد'، سيبدأ الذكاء الاصطناعي في إنشاء التصميم"
            : "Clicking 'Launch Generation' will start AI-powered design generation"}
        </p>
        <p className="text-xs text-[var(--ink-faint)] mt-1">
          {isRtl
            ? "الوقت المتوقع: 2-5 دقائق"
            : "Estimated time: 2-5 minutes"}
        </p>
      </div>
    </div>
  );
}
