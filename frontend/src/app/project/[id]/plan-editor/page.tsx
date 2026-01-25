"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Move,
  Square,
  DoorOpen,
  Maximize2,
  Type,
  Eraser,
  Grid,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, Button } from "@/components/ui";
import { CADCanvas, SvgCanvas } from "@/components/plan-editor";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useViewerStore } from "@/stores/viewer-store";
import type { ToolType } from "@/types";
import type { CADLayer } from "@/types/cad";

// Feature flag for new viewer
const USE_NEW_VIEWER = process.env.NEXT_PUBLIC_USE_NEW_VIEWERS !== "false";

const tools: Array<{ id: ToolType; icon: typeof Move; label: string; labelAr: string }> = [
  { id: "select", icon: Move, label: "Select", labelAr: "تحديد" },
  { id: "pan", icon: Layout, label: "Pan", labelAr: "تحريك" },
  { id: "wall", icon: Square, label: "Wall", labelAr: "جدار" },
  { id: "door", icon: DoorOpen, label: "Door", labelAr: "باب" },
  { id: "window", icon: Maximize2, label: "Window", labelAr: "نافذة" },
  { id: "dimension", icon: Ruler, label: "Dimension", labelAr: "بعد" },
  { id: "text", icon: Type, label: "Text", labelAr: "نص" },
  { id: "erase", icon: Eraser, label: "Erase", labelAr: "مسح" },
];

const layerDefinitions: Array<{
  id: CADLayer;
  label: string;
  labelAr: string;
  color: string;
}> = [
  { id: "architectural", label: "Architectural", labelAr: "معماري", color: "#FFFFFF" },
  { id: "structural", label: "Structural", labelAr: "هيكلي", color: "#FF0000" },
  { id: "mep-hvac", label: "MEP - HVAC", labelAr: "تكييف", color: "#00FFFF" },
  { id: "mep-electrical", label: "MEP - Electrical", labelAr: "كهرباء", color: "#FF00FF" },
  { id: "mep-plumbing", label: "MEP - Plumbing", labelAr: "سباكة", color: "#0000FF" },
  { id: "annotations", label: "Annotations", labelAr: "تعليقات", color: "#00FF00" },
  { id: "grid", label: "Grid", labelAr: "شبكة", color: "#808080" },
  { id: "dimensions", label: "Dimensions", labelAr: "أبعاد", color: "#FFFF00" },
];

export default function PlanEditorPage() {
  const params = useParams();
  const { language } = useUIStore();
  const { project, run, setProject, setRun } = useProjectStore();
  const {
    activeTool,
    setActiveTool,
    layers,
    toggleLayerVisibility,
    setLayerLocked,
    backgroundColor,
    setBackgroundColor,
    showGrid,
    toggleGrid,
    viewTransform,
    zoomIn,
    zoomOut,
    zoomToFit,
    rotateView,
    measurementActive,
    startMeasurement,
    clearMeasurement,
    selectedElementIds,
  } = useViewerStore();

  const isRtl = language === "ar";
  const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const projectId = projectIdParam ?? "";
  const [planFile, setPlanFile] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState({ available: true, message: "" });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "escape":
          clearMeasurement();
          break;
        case "v":
        case "1":
          setActiveTool("select");
          break;
        case "h":
        case "2":
          setActiveTool("pan");
          break;
        case "m":
          if (measurementActive) {
            clearMeasurement();
          } else {
            startMeasurement();
          }
          break;
        case "g":
          toggleGrid();
          break;
        case "r":
          rotateView(90);
          break;
        case "f":
          zoomToFit();
          break;
        case "+":
        case "=":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    measurementActive,
    setActiveTool,
    toggleGrid,
    rotateView,
    zoomToFit,
    zoomIn,
    zoomOut,
    startMeasurement,
    clearMeasurement,
  ]);

  useEffect(() => {
    const loadProjectAndRun = async () => {
      // Check backend connection first
      await apiClient.checkBackend();
      const status = apiClient.getBackendStatus();
      setBackendStatus(status);

      const found = await apiClient.getProject(projectId);
      if (found) {
        setProject(found);
        const latestRun = await apiClient.getLatestRunForProject(projectId);
        if (latestRun) {
          setRun(latestRun);
        }
      }
    };
    loadProjectAndRun();
  }, [projectId, setProject, setRun]);

  const handleRetryConnection = async () => {
    const connected = await apiClient.retryConnection();
    if (connected) {
      window.location.reload();
    } else {
      setBackendStatus(apiClient.getBackendStatus());
    }
  };

  useEffect(() => {
    const loadArtifacts = async () => {
      if (!run?.id) return;
      try {
        setPlanFile(null);
        const artifacts = await apiClient.getRunArtifacts(run.id);
        const planArtifact = artifacts.find(
          (a) =>
            a.kind === "plan" || a.kind === "plan_svg" || a.file_name?.endsWith("_plan.svg")
        );
        if (planArtifact) {
          setPlanFile(planArtifact.file_name);
          return;
        }

        const state = await apiClient.getState().catch(() => null);
        const outputFile = state?.outputs?.plan_svg_file;
        const stateRunId = state?.run?.id ? String(state.run.id) : "";
        const stateProjectId = state?.project?.id ? String(state.project.id) : "";
        if (
          outputFile &&
          stateRunId &&
          stateProjectId &&
          stateRunId === String(run.id) &&
          stateProjectId === String(project?.id)
        ) {
          setPlanFile(outputFile);
        }
      } catch (error) {
        console.error("Failed to load artifacts:", error);
      }
    };
    loadArtifacts();
  }, [run?.id, project?.id]);

  const handleMeasureToggle = useCallback(() => {
    if (measurementActive) {
      clearMeasurement();
    } else {
      startMeasurement();
    }
  }, [measurementActive, startMeasurement, clearMeasurement]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {project?.name || (isRtl ? "المشروع" : "Project")}
          </p>
          <h1 className="text-2xl font-bold text-[var(--ink)]">
            {isRtl ? "محرر المخطط" : "Plan Editor"}
          </h1>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[var(--surface-2)] rounded-lg p-1 border border-[var(--line)]">
            <Button variant="ghost" size="sm" onClick={zoomOut} title="Zoom Out (-)">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-[var(--ink-soft)] min-w-[50px] text-center">
              {(viewTransform.zoom * 100).toFixed(0)}%
            </span>
            <Button variant="ghost" size="sm" onClick={zoomIn} title="Zoom In (+)">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomToFit} title="Fit View (F)">
              <Home className="w-4 h-4" />
            </Button>
          </div>

          {/* Rotate */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => rotateView(90)}
            title="Rotate 90° (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Grid Toggle */}
          <Button
            variant={showGrid ? "primary" : "outline"}
            size="sm"
            onClick={toggleGrid}
            title="Toggle Grid (G)"
          >
            <Grid className="w-4 h-4" />
          </Button>

          {/* Measure Tool */}
          <Button
            variant={measurementActive ? "primary" : "outline"}
            size="sm"
            onClick={handleMeasureToggle}
            title="Measure Tool (M)"
          >
            <Ruler className="w-4 h-4" />
          </Button>

          {/* Background Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBackgroundColor(backgroundColor === "dark" ? "light" : "dark")}
            title="Toggle Background"
          >
            {backgroundColor === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* CAD Workspace */}
      <div className="grid grid-cols-[72px_1fr_280px] gap-4">
        {/* Tools Palette */}
        <Card className="h-fit">
          <CardContent className="p-2">
            <div className="space-y-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = tool.id === activeTool;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      "w-12 h-12 rounded-[var(--radius-sm)] border flex items-center justify-center transition-all",
                      isActive
                        ? "bg-[rgba(15,76,129,0.12)] border-[var(--accent)] text-[var(--accent)]"
                        : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
                    )}
                    title={`${isRtl ? tool.labelAr : tool.label}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="min-h-[600px] overflow-hidden">
          <CardContent className="p-0 h-full">
            {planFile && project?.id && run?.id ? (
              USE_NEW_VIEWER ? (
                <CADCanvas
                  projectId={project.id}
                  runId={run.id}
                  fileName={planFile}
                  className="w-full h-[600px]"
                />
              ) : (
                <SvgCanvas
                  projectId={project.id}
                  runId={run.id}
                  fileName={planFile}
                  className="w-full h-[600px] rounded-[var(--radius-md)]"
                />
              )
            ) : (
              <div
                className={cn(
                  "w-full h-[600px] rounded-[var(--radius-md)] border border-[var(--line)] relative overflow-hidden",
                  backgroundColor === "dark" ? "bg-[#1a1a2e]" : "bg-[#f8f6f1]"
                )}
                style={{
                  backgroundImage:
                    showGrid
                      ? `
                      linear-gradient(0deg, rgba(100,110,125,0.14) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(100,110,125,0.14) 1px, transparent 1px)
                    `
                      : undefined,
                  backgroundSize: "24px 24px",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-[var(--ink-faint)] max-w-md px-4">
                    <Layout className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    {!backendStatus.available ? (
                      <>
                        <p className="text-lg font-medium text-amber-600">
                          {isRtl ? "الخادم غير متصل" : "Backend Not Connected"}
                        </p>
                        <p className="text-sm mt-2">
                          {isRtl
                            ? "قم بتشغيل الخادم لعرض المخططات المولدة"
                            : "Start the backend server to view generated plans"}
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
                          {isRtl ? "جاري تحميل المخطط..." : "Loading plan..."}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties Panel */}
        <div className="space-y-4">
          {/* Layers */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--ink)]">
                  {isRtl ? "الطبقات" : "Layers"}
                </h3>
                <Layers className="w-4 h-4 text-[var(--ink-soft)]" />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {layerDefinitions.map((layer) => {
                  const layerState = layers[layer.id];
                  const isVisible = layerState?.visible !== false;
                  const isLocked = layerState?.locked === true;

                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all",
                        isVisible
                          ? "bg-[var(--surface-2)] border-[var(--line)]"
                          : "bg-[var(--bg-2)] border-transparent opacity-60"
                      )}
                    >
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className="p-1 hover:bg-[var(--bg-2)] rounded"
                        title={isVisible ? "Hide Layer" : "Show Layer"}
                      >
                        {isVisible ? (
                          <Eye className="w-4 h-4 text-[var(--ink-soft)]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[var(--ink-faint)]" />
                        )}
                      </button>

                      {/* Lock Toggle */}
                      <button
                        onClick={() => setLayerLocked(layer.id, !isLocked)}
                        className="p-1 hover:bg-[var(--bg-2)] rounded"
                        title={isLocked ? "Unlock Layer" : "Lock Layer"}
                      >
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-[var(--ink-faint)]" />
                        )}
                      </button>

                      {/* Color indicator */}
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: layer.color }}
                      />

                      {/* Layer name */}
                      <span className="text-sm text-[var(--ink)] flex-1">
                        {isRtl ? layer.labelAr : layer.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selection Info / Properties */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-[var(--ink)] mb-3">
                {isRtl ? "الخصائص" : "Properties"}
              </h3>
              {selectedElementIds.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--accent)]">
                    {selectedElementIds.length}{" "}
                    {isRtl
                      ? `عنصر محدد`
                      : `element${selectedElementIds.length > 1 ? "s" : ""} selected`}
                  </p>
                  <div className="text-xs text-[var(--ink-soft)] space-y-1">
                    {selectedElementIds.slice(0, 5).map((id) => (
                      <div key={id} className="truncate">
                        {id}
                      </div>
                    ))}
                    {selectedElementIds.length > 5 && (
                      <div className="text-[var(--ink-faint)]">
                        +{selectedElementIds.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--ink-soft)]">
                  {isRtl
                    ? "انقر على عنصر لرؤية خصائصه"
                    : "Click an element to view properties"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-[var(--ink)] mb-3 text-sm">
                {isRtl ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
              </h3>
              <div className="text-xs text-[var(--ink-soft)] space-y-1">
                <div className="flex justify-between">
                  <span>V / 1</span>
                  <span>{isRtl ? "تحديد" : "Select"}</span>
                </div>
                <div className="flex justify-between">
                  <span>M</span>
                  <span>{isRtl ? "قياس" : "Measure"}</span>
                </div>
                <div className="flex justify-between">
                  <span>G</span>
                  <span>{isRtl ? "شبكة" : "Grid"}</span>
                </div>
                <div className="flex justify-between">
                  <span>R</span>
                  <span>{isRtl ? "تدوير" : "Rotate"}</span>
                </div>
                <div className="flex justify-between">
                  <span>F</span>
                  <span>{isRtl ? "ملاءمة" : "Fit"}</span>
                </div>
                <div className="flex justify-between">
                  <span>+/-</span>
                  <span>{isRtl ? "تكبير" : "Zoom"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Esc</span>
                  <span>{isRtl ? "إلغاء" : "Cancel"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
