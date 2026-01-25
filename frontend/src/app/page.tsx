"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardContent } from "@/components/ui";
import { ProjectCard, QuickStats } from "@/components/dashboard";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import type { Project } from "@/types";

// Demo projects for initial display
const demoProjects: Project[] = [
  {
    id: 1,
    name: "KAFD Tower Complex",
    region: "saudi_arabia",
    building_type: "office",
    phase: "design_development",
    gfa: 45000,
    floors: 32,
    status: "In progress",
  },
  {
    id: 2,
    name: "Al Maryah Residences",
    region: "uae",
    building_type: "residential",
    phase: "schematic",
    gfa: 28000,
    floors: 18,
    status: "Review",
  },
  {
    id: 3,
    name: "Qatar Innovation Hub",
    region: "qatar",
    building_type: "mixed_use",
    phase: "construction_documents",
    gfa: 62000,
    floors: 24,
    status: "Completed",
  },
  {
    id: 4,
    name: "Bahrain Medical Center",
    region: "bahrain",
    building_type: "healthcare",
    phase: "schematic",
    gfa: 35000,
    floors: 12,
    status: "Draft",
  },
];

export default function DashboardPage() {
  const { language } = useUIStore();
  const { projects, setProjects, setProject } = useProjectStore();
  const isRtl = language === "ar";

  // Fetch state from API
  const { data: stateData } = useQuery({
    queryKey: ["state"],
    queryFn: () => apiClient.getState(),
    retry: false,
  });

  // Initialize with demo projects if no real projects
  useEffect(() => {
    if (stateData?.project) {
      // If we have a project from API, add it to the list
      setProjects([stateData.project, ...demoProjects.slice(1)]);
      setProject(stateData.project);
    } else {
      setProjects(demoProjects);
    }
  }, [stateData, setProjects, setProject]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {isRtl ? "منصة المصمم الذكي" : "AI Designer Platform"}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            {isRtl ? "لوحة المتابعة" : "Dashboard"}
          </h1>
          <p className="text-[var(--ink-soft)] mt-1">
            {isRtl
              ? "إدارة مشاريع التصميم الهندسي الخاصة بك"
              : "Manage your engineering design projects"}
          </p>
        </div>
        <Link href="/new-project">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRtl ? "مشروع جديد" : "New Project"}
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <QuickStats projects={projects} />

      {/* Projects Section */}
      <Card>
        <CardContent className="p-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-lg font-bold text-[var(--ink)]">
              {isRtl ? "المشاريع" : "Projects"}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)]" />
                <input
                  type="text"
                  placeholder={isRtl ? "بحث..." : "Search..."}
                  className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{isRtl ? "تصفية" : "Filter"}</span>
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[var(--ink-soft)] mb-4">
                {isRtl ? "لا توجد مشاريع حتى الآن" : "No projects yet"}
              </p>
              <Link href="/new-project">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {isRtl ? "إنشاء أول مشروع" : "Create your first project"}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
