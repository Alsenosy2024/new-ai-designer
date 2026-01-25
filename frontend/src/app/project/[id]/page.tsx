"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Layers,
  Target,
  Zap,
  Sun,
  Play,
  Layout,
  Box,
  Package,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

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

const statusVariants: Record<string, "default" | "success" | "warning" | "muted"> = {
  Draft: "muted",
  "In progress": "warning",
  Review: "default",
  Completed: "success",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useUIStore();
  const { project, setProject } = useProjectStore();
  const isRtl = language === "ar";
  const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const projectId = projectIdParam ?? "";

  useEffect(() => {
    // Load project from demo data or API
    const loadProject = async () => {
      const found = await apiClient.getProject(projectId);
      if (found) {
        setProject(found);
      }
    };
    loadProject();
  }, [projectId, setProject]);

  if (!project) {
    return (
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-[var(--ink-soft)]">
              {isRtl ? "جاري تحميل المشروع..." : "Loading project..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const region = labels.regions[project.region] || { en: project.region, ar: project.region };
  const buildingType = labels.buildingTypes[project.building_type] || {
    en: project.building_type,
    ar: project.building_type,
  };
  const phase = labels.phases[project.phase] || { en: project.phase, ar: project.phase };

  const handleStartGeneration = async () => {
    router.push(`/project/${projectId}/orchestrator`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {isRtl ? "تفاصيل المشروع" : "Project Details"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            {project.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={statusVariants[project.status] || "muted"}>
              {project.status}
            </Badge>
            <span className="text-sm text-[var(--ink-soft)]">
              {isRtl ? region.ar : region.en}
            </span>
          </div>
        </div>
        <Button onClick={handleStartGeneration} className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          {isRtl ? "بدء التوليد" : "Start Generation"}
        </Button>
      </div>

      {/* Project Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
            {isRtl ? "ملخص المشروع" : "Project Summary"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <Building2 className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-faint)]">
                  {isRtl ? "نوع المبنى" : "Type"}
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {isRtl ? buildingType.ar : buildingType.en}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <MapPin className="w-5 h-5 text-[var(--accent)]" />
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
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <Target className="w-5 h-5 text-[var(--accent)]" />
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
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <Layers className="w-5 h-5 text-[var(--accent-3)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-faint)]">
                  {isRtl ? "المساحة" : "GFA"}
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {project.gfa.toLocaleString()} m²
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <Zap className="w-5 h-5 text-[var(--accent-3)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-faint)]">
                  {isRtl ? "الطوابق" : "Floors"}
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {project.floors}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-sm)]">
                <Sun className="w-5 h-5 text-[var(--accent-2)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--ink-faint)]">
                  {isRtl ? "الطاقة" : "Energy"}
                </p>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {project.energy_target || 85} kWh/m²
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href={`/project/${projectId}/orchestrator`}>
          <Card className="cursor-pointer hover:border-[var(--accent)] transition-colors h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-[rgba(15,76,129,0.1)] rounded-[var(--radius-md)]">
                <Play className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ink)]">
                  {isRtl ? "التوليد الذكي" : "AI Generation"}
                </h3>
                <p className="text-sm text-[var(--ink-soft)]">
                  {isRtl ? "ابدأ أو راقب التوليد" : "Start or monitor generation"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/project/${projectId}/plan-editor`}>
          <Card className="cursor-pointer hover:border-[var(--accent)] transition-colors h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-[rgba(27,107,97,0.1)] rounded-[var(--radius-md)]">
                <Layout className="w-6 h-6 text-[var(--accent-3)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ink)]">
                  {isRtl ? "محرر المخطط" : "Plan Editor"}
                </h3>
                <p className="text-sm text-[var(--ink-soft)]">
                  {isRtl ? "عرض وتعديل المخططات" : "View and edit floor plans"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/project/${projectId}/outputs`}>
          <Card className="cursor-pointer hover:border-[var(--accent)] transition-colors h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-[rgba(179,107,45,0.1)] rounded-[var(--radius-md)]">
                <Package className="w-6 h-6 text-[var(--accent-2)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--ink)]">
                  {isRtl ? "المخرجات" : "Deliverables"}
                </h3>
                <p className="text-sm text-[var(--ink-soft)]">
                  {isRtl ? "تحميل الملفات والتقارير" : "Download files and reports"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 3D Preview Placeholder */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--ink)]">
              {isRtl ? "معاينة ثلاثية الأبعاد" : "3D Preview"}
            </h2>
            <Link href={`/project/${projectId}/3d-view`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                {isRtl ? "فتح العارض" : "Open Viewer"}
              </Button>
            </Link>
          </div>
          <div className="aspect-video bg-[var(--bg-2)] rounded-[var(--radius-md)] flex items-center justify-center border border-[var(--line)]">
            <div className="text-center text-[var(--ink-faint)]">
              <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{isRtl ? "ابدأ التوليد لعرض النموذج" : "Start generation to view model"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
