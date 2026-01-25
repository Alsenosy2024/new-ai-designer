"use client";

import Link from "next/link";
import { Building2, MapPin, Layers, Calendar } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import type { Project } from "@/types";
import { useUIStore } from "@/stores/ui-store";

interface ProjectCardProps {
  project: Project;
}

const buildingTypeLabels: Record<string, { en: string; ar: string }> = {
  residential: { en: "Residential", ar: "سكني" },
  commercial: { en: "Commercial", ar: "تجاري" },
  office: { en: "Office", ar: "مكتبي" },
  retail: { en: "Retail", ar: "تجزئة" },
  healthcare: { en: "Healthcare", ar: "صحي" },
  education: { en: "Education", ar: "تعليمي" },
  hospitality: { en: "Hospitality", ar: "ضيافة" },
  mixed_use: { en: "Mixed Use", ar: "متعدد الاستخدام" },
};

const regionLabels: Record<string, { en: string; ar: string }> = {
  saudi_arabia: { en: "Saudi Arabia", ar: "السعودية" },
  uae: { en: "UAE", ar: "الإمارات" },
  qatar: { en: "Qatar", ar: "قطر" },
  bahrain: { en: "Bahrain", ar: "البحرين" },
  oman: { en: "Oman", ar: "عمان" },
};

const statusVariants: Record<string, "default" | "success" | "warning" | "muted"> = {
  Draft: "muted",
  "In progress": "warning",
  Review: "default",
  Completed: "success",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  const buildingType = buildingTypeLabels[project.building_type] || {
    en: project.building_type,
    ar: project.building_type,
  };
  const region = regionLabels[project.region] || {
    en: project.region,
    ar: project.region,
  };

  return (
    <Link href={`/project/${project.id}`} className="block group">
      <article className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-lg hover:border-[var(--accent)] hover:-translate-y-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-lg text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-[var(--ink-soft)] flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              {isRtl ? region.ar : region.en}
            </p>
          </div>
          <Badge variant={statusVariants[project.status] || "muted"}>
            {project.status}
          </Badge>
        </div>

        {/* Preview Placeholder */}
        <div className="aspect-[16/10] bg-[var(--bg-2)] rounded-[var(--radius-md)] mb-4 flex items-center justify-center border border-[var(--line)]">
          <div className="text-center text-[var(--ink-faint)]">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{isRtl ? "معاينة المخطط" : "Plan Preview"}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
            <Building2 className="w-4 h-4 mx-auto text-[var(--ink-faint)] mb-1" />
            <p className="text-xs text-[var(--ink-soft)]">
              {isRtl ? buildingType.ar : buildingType.en}
            </p>
          </div>
          <div className="text-center p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
            <Layers className="w-4 h-4 mx-auto text-[var(--ink-faint)] mb-1" />
            <p className="text-xs text-[var(--ink-soft)]">
              {project.floors} {isRtl ? "طابق" : "Floors"}
            </p>
          </div>
          <div className="text-center p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
            <Calendar className="w-4 h-4 mx-auto text-[var(--ink-faint)] mb-1" />
            <p className="text-xs text-[var(--ink-soft)]">
              {formatNumber(project.gfa)} m²
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
