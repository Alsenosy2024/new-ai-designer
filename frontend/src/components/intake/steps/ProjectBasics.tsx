"use client";

import { Building2, Hotel, Home, ShoppingBag, Heart, GraduationCap, UtensilsCrossed, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData, BuildingType, Region } from "@/types";

interface ProjectBasicsProps {
  data: ProjectFormData;
  onChange: (updates: Partial<ProjectFormData>) => void;
}

const buildingTypes: { value: BuildingType; label: string; labelAr: string; icon: typeof Building2 }[] = [
  { value: "office", label: "Office", labelAr: "مكتبي", icon: Building2 },
  { value: "residential", label: "Residential", labelAr: "سكني", icon: Home },
  { value: "commercial", label: "Commercial", labelAr: "تجاري", icon: ShoppingBag },
  { value: "hospitality", label: "Hospitality", labelAr: "ضيافة", icon: Hotel },
  { value: "healthcare", label: "Healthcare", labelAr: "صحي", icon: Heart },
  { value: "education", label: "Education", labelAr: "تعليمي", icon: GraduationCap },
  { value: "retail", label: "Retail", labelAr: "تجزئة", icon: UtensilsCrossed },
  { value: "mixed_use", label: "Mixed Use", labelAr: "متعدد", icon: Layers },
];

const regions: { value: Region; label: string; labelAr: string }[] = [
  { value: "saudi_arabia", label: "Saudi Arabia", labelAr: "السعودية" },
  { value: "uae", label: "UAE", labelAr: "الإمارات" },
  { value: "qatar", label: "Qatar", labelAr: "قطر" },
  { value: "bahrain", label: "Bahrain", labelAr: "البحرين" },
  { value: "oman", label: "Oman", labelAr: "عمان" },
];

export function ProjectBasics({ data, onChange }: ProjectBasicsProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--ink)] mb-2">
          {isRtl ? "معلومات المشروع الأساسية" : "Project Basics"}
        </h2>
        <p className="text-[var(--ink-soft)]">
          {isRtl
            ? "أدخل اسم المشروع واختر نوع المبنى والمنطقة"
            : "Enter project name and select building type and region"}
        </p>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-2">
          {isRtl ? "اسم المشروع" : "Project Name"}
        </label>
        <Input
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={isRtl ? "أدخل اسم المشروع" : "Enter project name"}
          className="max-w-md"
        />
      </div>

      {/* Region Selector */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "المنطقة" : "Region"}
        </label>
        <div className="flex flex-wrap gap-3">
          {regions.map((region) => (
            <button
              key={region.value}
              onClick={() => onChange({ region: region.value })}
              className={cn(
                "px-4 py-2.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all",
                data.region === region.value
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md"
                  : "bg-[var(--surface-2)] text-[var(--ink-soft)] border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--ink)]"
              )}
            >
              {isRtl ? region.labelAr : region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Building Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-[var(--ink)] mb-3">
          {isRtl ? "نوع المبنى" : "Building Type"}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {buildingTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => onChange({ building_type: type.value })}
                className={cn(
                  "p-4 rounded-[var(--radius-md)] border text-center transition-all",
                  data.building_type === type.value
                    ? "bg-[rgba(15,76,129,0.1)] border-[var(--accent)] shadow-md"
                    : "bg-[var(--surface-2)] border-[var(--line)] hover:border-[var(--accent)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    data.building_type === type.value
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-faint)]"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    data.building_type === type.value
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-soft)]"
                  )}
                >
                  {isRtl ? type.labelAr : type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
