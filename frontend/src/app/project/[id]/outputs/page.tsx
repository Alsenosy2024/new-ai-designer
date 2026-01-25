"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Package,
  FileText,
  Download,
  Box,
  Image,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  FileCode,
  Loader2,
} from "lucide-react";
import { Card, CardContent, Button, Badge, Progress } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

interface DeliverableFile {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ComponentType<{ className?: string }>;
  fileName?: string;
  size?: string;
  status: "ready" | "pending" | "loading";
}

// Mapping from artifact kind to deliverable metadata
const artifactMetadata: Record<string, Omit<DeliverableFile, "id" | "fileName" | "size" | "status">> = {
  ifc: {
    name: "BIM Model",
    nameAr: "نموذج BIM",
    description: "IFC 4.0 format",
    descriptionAr: "صيغة IFC 4.0",
    icon: Box,
  },
  plan_svg: {
    name: "Floor Plans",
    nameAr: "مخططات الطوابق",
    description: "SVG vector drawings",
    descriptionAr: "رسومات SVG",
    icon: Image,
  },
  dxf: {
    name: "CAD Drawing",
    nameAr: "رسم CAD",
    description: "DXF format for AutoCAD",
    descriptionAr: "صيغة DXF لـ AutoCAD",
    icon: FileCode,
  },
  gltf: {
    name: "3D Model",
    nameAr: "نموذج ثلاثي الأبعاد",
    description: "glTF 2.0 format",
    descriptionAr: "صيغة glTF 2.0",
    icon: Box,
  },
  schedule: {
    name: "MEP Schedule",
    nameAr: "جدول MEP",
    description: "Excel spreadsheet",
    descriptionAr: "جدول Excel",
    icon: FileSpreadsheet,
  },
  energy_report: {
    name: "Energy Report",
    nameAr: "تقرير الطاقة",
    description: "PDF analysis",
    descriptionAr: "تحليل PDF",
    icon: FileText,
  },
  structural_report: {
    name: "Structural Report",
    nameAr: "التقرير الهيكلي",
    description: "PDF analysis",
    descriptionAr: "تحليل PDF",
    icon: FileText,
  },
  structural_plan: {
    name: "Structural Plan",
    nameAr: "المخطط الهيكلي",
    description: "SVG structural layout",
    descriptionAr: "تخطيط هيكلي SVG",
    icon: Image,
  },
  mep_layout: {
    name: "MEP Layout",
    nameAr: "تخطيط MEP",
    description: "SVG MEP drawing",
    descriptionAr: "رسم MEP بصيغة SVG",
    icon: Image,
  },
  review_package: {
    name: "Review Package",
    nameAr: "حزمة المراجعة",
    description: "ZIP with all files",
    descriptionAr: "ملف ZIP بكل الملفات",
    icon: Package,
  },
};

export default function OutputsPage() {
  const params = useParams();
  const { language } = useUIStore();
  const { project, run, setProject, setRun } = useProjectStore();
  const isRtl = language === "ar";
  const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const projectId = projectIdParam ?? "";
  const [deliverables, setDeliverables] = useState<DeliverableFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState({ available: true, message: "" });

  useEffect(() => {
    const loadProjectAndRun = async () => {
      // Check backend connection first
      await apiClient.checkBackend();
      const status = apiClient.getBackendStatus();
      setBackendStatus(status);

      const found = await apiClient.getProject(projectId);
      if (found) {
        setProject(found);
        // Also load the latest run for this project
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

  // Load artifacts from backend
  useEffect(() => {
    const loadArtifacts = async () => {
      if (!run?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const artifacts = await apiClient.getRunArtifacts(run.id);
        const files: DeliverableFile[] = artifacts.map((artifact) => {
          const metadata = artifactMetadata[artifact.kind] || {
            name: artifact.kind,
            nameAr: artifact.kind,
            description: artifact.description || "",
            descriptionAr: artifact.description || "",
            icon: FileText,
          };
          return {
            id: artifact.kind,
            ...metadata,
            fileName: artifact.file_name,
            status: "ready" as const,
          };
        });
        setDeliverables(files);
      } catch (error) {
        console.error("Failed to load artifacts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadArtifacts();
  }, [run?.id]);

  // Download handler
  const handleDownload = useCallback(async (file: DeliverableFile) => {
    if (!project?.id || !run?.id || !file.fileName) return;

    setDownloadingId(file.id);
    try {
      const url = apiClient.getFileUrl(project.id, run.id, file.fileName);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingId(null);
    }
  }, [project?.id, run?.id]);

  // Download all files as a package
  const handleDownloadAll = useCallback(async () => {
    const reviewPackage = deliverables.find((d) => d.id === "review_package");
    if (reviewPackage) {
      handleDownload(reviewPackage);
    } else {
      // Download files individually if no package
      for (const file of deliverables) {
        if (file.status === "ready" && file.fileName) {
          await handleDownload(file);
        }
      }
    }
  }, [deliverables, handleDownload]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {project?.name || (isRtl ? "المشروع" : "Project")}
          </p>
          <h1 className="text-2xl font-bold text-[var(--ink)]">
            {isRtl ? "المخرجات" : "Deliverables"}
          </h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={handleDownloadAll}
          disabled={deliverables.length === 0 || loading}
        >
          <Package className="w-4 h-4" />
          {isRtl ? "تحميل الكل" : "Download All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Files Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "الملفات المتاحة" : "Available Files"}
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                </div>
              ) : deliverables.length === 0 ? (
                <div className="text-center py-12 text-[var(--ink-soft)]">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  {!backendStatus.available ? (
                    <>
                      <p className="text-lg font-medium text-amber-600">
                        {isRtl ? "الخادم غير متصل" : "Backend Not Connected"}
                      </p>
                      <p className="text-sm mt-2">
                        {isRtl
                          ? "قم بتشغيل الخادم لعرض الملفات المتاحة"
                          : "Start the backend server to view available files"}
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
                      <p className="font-medium">
                        {isRtl ? "لا يوجد تشغيل نشط" : "No Active Run"}
                      </p>
                      <p className="text-sm mt-1">
                        {isRtl
                          ? "انتقل إلى المنظم لبدء التوليد"
                          : "Go to Orchestrator to start generation"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>{isRtl ? "لا توجد ملفات متاحة" : "No files available"}</p>
                      <p className="text-sm mt-1">
                        {isRtl
                          ? "ابدأ التوليد لإنشاء الملفات"
                          : "Start generation to create files"}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deliverables.map((file) => {
                    const Icon = file.icon;
                    const isReady = file.status === "ready";
                    const isDownloading = downloadingId === file.id;
                    return (
                      <div
                        key={file.id}
                        className="flex items-start gap-4 p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)]"
                      >
                        <div className="p-3 bg-[var(--surface)] rounded-[var(--radius-sm)] border border-[var(--line)]">
                          <Icon className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[var(--ink)] truncate">
                              {isRtl ? file.nameAr : file.name}
                            </h3>
                            {isReady ? (
                              <CheckCircle className="w-4 h-4 text-[var(--accent-3)]" />
                            ) : (
                              <Clock className="w-4 h-4 text-[var(--ink-faint)]" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--ink-soft)]">
                            {isRtl ? file.descriptionAr : file.description}
                          </p>
                          {file.fileName && (
                            <p className="text-xs text-[var(--ink-faint)] mt-1 font-mono truncate">
                              {file.fileName}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isReady || isDownloading}
                          className="flex-shrink-0"
                          onClick={() => handleDownload(file)}
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Model Health */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "صحة النموذج" : "Model Health"}
              </h2>
              <div className="space-y-4">
                <Progress
                  value={95}
                  label={isRtl ? "خالي من التعارض" : "Clash Free"}
                  variant="success"
                />
                <Progress
                  value={88}
                  label={isRtl ? "الامتثال للكود" : "Code Compliance"}
                  variant="success"
                />
                <Progress
                  value={72}
                  label={isRtl ? "كفاءة الطاقة" : "Energy Score"}
                  variant="warning"
                />
                <Progress
                  value={91}
                  label={isRtl ? "السلامة الهيكلية" : "Structural Score"}
                  variant="success"
                />
              </div>
            </CardContent>
          </Card>

          {/* Review Notes */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "ملاحظات المراجعة" : "Review Notes"}
              </h2>
              <textarea
                placeholder={
                  isRtl
                    ? "أضف ملاحظاتك هنا..."
                    : "Add your notes here..."
                }
                className="w-full min-h-[100px] p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex items-center gap-2 mt-3">
                <select className="flex-1 p-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-white text-sm">
                  <option>{isRtl ? "اختر الفئة" : "Select category"}</option>
                  <option>{isRtl ? "معماري" : "Architectural"}</option>
                  <option>{isRtl ? "هيكلي" : "Structural"}</option>
                  <option>MEP</option>
                </select>
                <Button size="sm">
                  {isRtl ? "إضافة" : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Approval */}
          <Card>
            <CardContent className="p-5 text-center">
              <Badge variant="warning" className="mb-3">
                {isRtl ? "قيد المراجعة" : "Pending Review"}
              </Badge>
              <p className="text-sm text-[var(--ink-soft)] mb-4">
                {isRtl
                  ? "وافق على التصميم لبدء توليد التفاصيل"
                  : "Approve design to start generating detailed output"}
              </p>
              <Button className="w-full">
                {isRtl ? "الموافقة على التصميم" : "Approve Design"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
