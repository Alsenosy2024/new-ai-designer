"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Maximize, Minimize } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { ModelViewer3D, FloorManager, SectionPlanePanel, Viewer3DControls } from "@/components/viewer";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useViewerStore } from "@/stores/viewer-store";

// Feature flag for new viewer (can be controlled via env)
const USE_NEW_VIEWER = true;

export default function ThreeDViewPage() {
  const params = useParams();
  const { language } = useUIStore();
  const { project, run, setProject, setRun } = useProjectStore();
  const { setTotalFloors } = useViewerStore();
  const isRtl = language === "ar";
  const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const projectId = projectIdParam ?? "";

  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState({ available: true, message: "" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFloorPanel, setShowFloorPanel] = useState(true);
  const [showSectionPanel, setShowSectionPanel] = useState(false);

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Load project and run data
  useEffect(() => {
    const loadProjectAndRun = async () => {
      // Check backend connection first
      await apiClient.checkBackend();
      const status = apiClient.getBackendStatus();
      setBackendStatus(status);

      const found = await apiClient.getProject(projectId);
      if (found) {
        setProject(found);
        // Set total floors from project data
        if (found.floors) {
          setTotalFloors(found.floors);
        }
        // Load the latest run
        const latestRun = await apiClient.getLatestRunForProject(projectId);
        if (latestRun) {
          setRun(latestRun);
        }
      }
    };
    loadProjectAndRun();
  }, [projectId, setProject, setRun, setTotalFloors]);

  // Retry connection handler
  const handleRetryConnection = async () => {
    const connected = await apiClient.retryConnection();
    if (connected) {
      window.location.reload();
    } else {
      setBackendStatus(apiClient.getBackendStatus());
    }
  };

  // Load glTF model from artifacts
  useEffect(() => {
    const loadModel = async () => {
      if (!run?.id || !project?.id) return;
      try {
        setModelUrl(null);
        const artifacts = await apiClient.getRunArtifacts(run.id);
        const gltfArtifact = artifacts.find(
          (a) => a.kind === "gltf" || a.file_name?.endsWith(".glb") || a.file_name?.endsWith(".gltf")
        );
        if (gltfArtifact) {
          const url = apiClient.getFileUrl(project.id, run.id, gltfArtifact.file_name);
          setModelUrl(url);
          return;
        }

        const state = await apiClient.getState().catch(() => null);
        const outputFile = state?.outputs?.gltf_file;
        const stateRunId = state?.run?.id ? String(state.run.id) : "";
        const stateProjectId = state?.project?.id ? String(state.project.id) : "";
        if (
          outputFile &&
          stateRunId &&
          stateProjectId &&
          stateRunId === String(run.id) &&
          stateProjectId === String(project.id)
        ) {
          setModelUrl(apiClient.getFileUrl(project.id, run.id, outputFile));
        }
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    };
    loadModel();
  }, [run?.id, project?.id]);

  // Fullscreen handler
  const handleFullscreen = useCallback(() => {
    if (!viewerContainerRef.current) return;

    if (!isFullscreen) {
      if (viewerContainerRef.current.requestFullscreen) {
        viewerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "f":
          handleFullscreen();
          break;
        case "l":
          setShowFloorPanel((prev) => !prev);
          break;
        case "s":
          if (!e.ctrlKey && !e.metaKey) {
            setShowSectionPanel((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFullscreen]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {project?.name || (isRtl ? "المشروع" : "Project")}
          </p>
          <h1 className="text-2xl font-bold text-[var(--ink)]">
            {isRtl ? "العرض ثلاثي الأبعاد" : "3D View"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFloorPanel ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFloorPanel(!showFloorPanel)}
            title="Toggle Floors (L)"
          >
            {isRtl ? "الطوابق" : "Floors"}
          </Button>
          <Button
            variant={showSectionPanel ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowSectionPanel(!showSectionPanel)}
            title="Toggle Sections (S)"
          >
            {isRtl ? "المقاطع" : "Sections"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
            title="Fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
            <span className={isRtl ? "mr-2" : "ml-2"}>
              {isRtl ? "ملء الشاشة" : "Fullscreen"}
            </span>
          </Button>
        </div>
      </div>

      {/* 3D Viewer */}
      <Card className="overflow-hidden">
        <CardContent className="p-0 relative">
          <div
            ref={viewerContainerRef}
            className={`relative ${isFullscreen ? "fixed inset-0 z-50" : "min-h-[700px]"}`}
          >
            {modelUrl ? (
              USE_NEW_VIEWER ? (
                <ModelViewer3D
                  modelUrl={modelUrl}
                  className={`w-full ${isFullscreen ? "h-full" : "h-[700px]"} rounded-[var(--radius-lg)]`}
                />
              ) : (
                // Fallback to old viewer if needed
                <div className="w-full h-[700px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[var(--radius-lg)] flex items-center justify-center text-slate-400">
                  Old viewer disabled
                </div>
              )
            ) : (
              <div
                className={`w-full ${
                  isFullscreen ? "h-full" : "h-[700px]"
                } bg-gradient-to-b from-slate-900 to-slate-800 rounded-[var(--radius-lg)] flex items-center justify-center`}
              >
                <div className="text-center text-slate-400 max-w-md px-4">
                  <Box className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  {!backendStatus.available ? (
                    <>
                      <p className="text-lg font-medium text-amber-500">
                        {isRtl ? "الخادم غير متصل" : "Backend Not Connected"}
                      </p>
                      <p className="text-sm mt-2">
                        {isRtl
                          ? "قم بتشغيل الخادم لعرض النماذج ثلاثية الأبعاد"
                          : "Start the backend server to view 3D models"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={handleRetryConnection}
                      >
                        {isRtl ? "إعادة المحاولة" : "Retry Connection"}
                      </Button>
                    </>
                  ) : !run?.id ? (
                    <>
                      <p className="text-lg font-medium">
                        {isRtl ? "لا يوجد تشغيل نشط" : "No Active Run"}
                      </p>
                      <p className="text-sm mt-2">
                        {isRtl
                          ? "انتقل إلى المنظم لبدء التوليد"
                          : "Go to Orchestrator to start generation"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">
                        {isRtl ? "جاري تحميل النموذج..." : "Loading model..."}
                      </p>
                      <p className="text-sm mt-2">
                        {isRtl
                          ? "يرجى الانتظار أثناء تحميل الملفات"
                          : "Please wait while files are loading"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Floor Manager Panel - Right Side */}
            {showFloorPanel && modelUrl && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <FloorManager isRtl={isRtl} />
              </div>
            )}

            {/* Section Plane Panel - Left Side */}
            {showSectionPanel && modelUrl && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <SectionPlanePanel isRtl={isRtl} />
              </div>
            )}

            {/* Bottom Controls */}
            {modelUrl && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Viewer3DControls
                  isRtl={isRtl}
                  onFullscreen={handleFullscreen}
                />
              </div>
            )}

            {/* Keyboard Shortcuts Help */}
            {modelUrl && !isFullscreen && (
              <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                <span className="bg-slate-800/80 px-2 py-1 rounded">
                  {isRtl ? "L: طوابق | S: مقاطع | F: ملء الشاشة" : "L: Floors | S: Sections | F: Fullscreen"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
