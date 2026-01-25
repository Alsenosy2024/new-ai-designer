"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { IntakeWizard } from "@/components/intake";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import type { ProjectFormData } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { language } = useUIStore();
  const { setProject, setRun } = useProjectStore();
  const isRtl = language === "ar";

  // Check backend on mount
  useEffect(() => {
    apiClient.checkBackend();
  }, []);

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      // Create the project (works in both demo and real mode)
      const response = await apiClient.createProject({
        name: data.name || "New Project",
        region: data.region,
        building_type: data.building_type,
        phase: data.phase,
        gfa: data.gfa,
        floors: data.floors,
        budget: data.budget,
        delivery: data.delivery,
        energy_target: data.energy_target,
        daylight: data.daylight,
        structural_system: data.structural_system,
        mep_strategy: data.mep_strategy,
        design_brief: data.design_brief,
        core_ratio: data.core_ratio,
        parking: data.parking,
        code_library: data.code_library,
        status: "Draft",
      });

      if (response.project) {
        setProject(response.project);

        // Start a run
        const runResponse = await apiClient.startRun(response.project.id!, "full");
        if (runResponse.run) {
          setRun(runResponse.run);
        }

        return response.project;
      }

      // If no project returned, throw error
      throw new Error("Failed to create project");
    },
    onSuccess: (project) => {
      // Navigate to orchestrator to watch the generation
      router.push(`/project/${project.id}/orchestrator`);
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      // Still try to navigate - demo mode should work
      router.push("/");
    },
  });

  const handleComplete = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  return (
    <div className="animate-fade-in">
      {/* Demo Mode Banner */}
      {apiClient.isDemoMode() && (
        <div className="mb-4 p-3 bg-[rgba(179,107,45,0.1)] border border-[rgba(179,107,45,0.3)] rounded-[var(--radius-md)] text-sm text-[var(--accent-2)]">
          {isRtl
            ? "وضع العرض التوضيحي - لم يتم الاتصال بالخادم الخلفي"
            : "Demo Mode - Backend server not connected"}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
          {isRtl ? "إنشاء مشروع" : "Create Project"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
          {isRtl ? "مشروع جديد" : "New Project"}
        </h1>
        <p className="text-[var(--ink-soft)] mt-1">
          {isRtl
            ? "أكمل الخطوات التالية لإعداد مشروعك"
            : "Complete the following steps to set up your project"}
        </p>
      </div>

      {/* Intake Wizard */}
      <IntakeWizard onComplete={handleComplete} />

      {/* Loading Overlay */}
      {createProjectMutation.isPending && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] p-8 text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--ink)] font-semibold">
              {isRtl ? "جاري إنشاء المشروع..." : "Creating project..."}
            </p>
            <p className="text-sm text-[var(--ink-soft)] mt-1">
              {isRtl ? "يرجى الانتظار" : "Please wait"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
