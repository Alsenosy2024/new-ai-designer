"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  Clock,
  Sparkles,
  Building2,
  Grid3X3,
  Zap,
  FileCheck,
  Package,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, Badge, Progress } from "@/components/ui";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

const steps = [
  { id: "init", label: "Initialization", labelAr: "التهيئة", icon: Sparkles, duration: 3 },
  { id: "arch", label: "Architectural", labelAr: "المعماري", icon: Building2, duration: 15 },
  { id: "struct", label: "Structural", labelAr: "الهيكلي", icon: Grid3X3, duration: 10 },
  { id: "mep", label: "MEP Systems", labelAr: "الميكانيكية", icon: Zap, duration: 12 },
  { id: "sim", label: "Simulation", labelAr: "المحاكاة", icon: FileCheck, duration: 8 },
  { id: "package", label: "Packaging", labelAr: "التجميع", icon: Package, duration: 5 },
];

const demoDecisions = [
  { step: "init", message: "Validating project parameters", messageAr: "التحقق من معايير المشروع" },
  { step: "init", message: "Loading regional building codes", messageAr: "تحميل أكواد البناء المحلية" },
  { step: "arch", message: "Generating floor plan layout", messageAr: "إنشاء تخطيط المخطط" },
  { step: "arch", message: "Optimizing core placement for efficiency", messageAr: "تحسين موقع النواة للكفاءة" },
  { step: "arch", message: "Calculating facade window-to-wall ratio", messageAr: "حساب نسبة النافذة للجدار" },
  { step: "struct", message: "Designing moment frame system", messageAr: "تصميم نظام الإطار الزمني" },
  { step: "struct", message: "Verifying lateral load resistance", messageAr: "التحقق من مقاومة الحمل الجانبي" },
  { step: "mep", message: "Routing HVAC ductwork", messageAr: "توجيه مجاري التكييف" },
  { step: "mep", message: "Placing electrical distribution panels", messageAr: "وضع لوحات التوزيع الكهربائية" },
  { step: "sim", message: "Running energy simulation", messageAr: "تشغيل محاكاة الطاقة" },
  { step: "sim", message: "Analyzing structural performance", messageAr: "تحليل الأداء الهيكلي" },
  { step: "package", message: "Generating IFC model", messageAr: "إنشاء نموذج IFC" },
  { step: "package", message: "Creating review package", messageAr: "إنشاء حزمة المراجعة" },
];

export default function OrchestratorPage() {
  const params = useParams();
  const { language } = useUIStore();
  const { project, setProject } = useProjectStore();
  const isRtl = language === "ar";
  const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const projectId = projectIdParam ?? "";

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [decisions, setDecisions] = useState<typeof demoDecisions>([]);
  const [metrics, setMetrics] = useState({
    compliance: 0,
    structuralVariance: 0,
    clashDensity: 0,
    energyIntensity: 0,
  });

  useEffect(() => {
    const loadProject = async () => {
      const found = await apiClient.getProject(projectId);
      if (found) {
        setProject(found);
      }
    };
    loadProject();
  }, [projectId, setProject]);

  // Demo simulation
  useEffect(() => {
    if (!isRunning) return;

    const stepDuration = steps[currentStep]?.duration || 5;
    const decisionsForStep = demoDecisions.filter(
      (d) => d.step === steps[currentStep]?.id
    );

    // Add decisions gradually
    decisionsForStep.forEach((decision, i) => {
      setTimeout(() => {
        setDecisions((prev) => [...prev, decision]);
      }, (stepDuration * 1000 * (i + 1)) / (decisionsForStep.length + 1));
    });

    // Update metrics
    const metricsInterval = setInterval(() => {
      setMetrics((prev) => ({
        compliance: Math.min(100, prev.compliance + Math.random() * 5),
        structuralVariance: Math.min(5, prev.structuralVariance + Math.random() * 0.3),
        clashDensity: Math.max(0, prev.clashDensity + (Math.random() - 0.7) * 2),
        energyIntensity: Math.min(150, prev.energyIntensity + Math.random() * 10),
      }));
    }, 1000);

    // Move to next step
    const timeout = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsRunning(false);
      }
    }, stepDuration * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(metricsInterval);
    };
  }, [isRunning, currentStep]);

  const handleStart = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setDecisions([]);
    setMetrics({
      compliance: 0,
      structuralVariance: 0,
      clashDensity: 0,
      energyIntensity: 0,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1">
            {project?.name || (isRtl ? "المشروع" : "Project")}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            {isRtl ? "التوليد الذكي" : "AI Generation"}
          </h1>
        </div>
        {!isRunning && currentStep === 0 && (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-[var(--radius-md)] font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-5 h-5" />
            {isRtl ? "بدء التوليد" : "Start Generation"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "خط زمني الوكلاء" : "Agent Timeline"}
              </h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep && isRunning;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-[var(--radius-md)] border transition-all",
                        isCompleted
                          ? "bg-[rgba(27,107,97,0.08)] border-[var(--accent-3)]"
                          : isCurrent
                            ? "bg-[rgba(15,76,129,0.08)] border-[var(--accent)] shadow-md"
                            : "bg-[var(--surface-2)] border-[var(--line)]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isCompleted
                            ? "bg-[var(--accent-3)] text-white"
                            : isCurrent
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[var(--bg-2)] text-[var(--ink-faint)]"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : isCurrent ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-semibold",
                            isCompleted || isCurrent
                              ? "text-[var(--ink)]"
                              : "text-[var(--ink-soft)]"
                          )}
                        >
                          {isRtl ? step.labelAr : step.label}
                        </p>
                        <p className="text-xs text-[var(--ink-faint)]">
                          {isCompleted
                            ? isRtl
                              ? "مكتمل"
                              : "Completed"
                            : isCurrent
                              ? isRtl
                                ? "جاري التنفيذ..."
                                : "Processing..."
                              : `~${step.duration}s`}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="animate-pulse-soft">
                          <Badge variant="default">
                            {isRtl ? "نشط" : "Active"}
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Decision Feed */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "سجل القرارات" : "Decision Feed"}
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {decisions.length === 0 ? (
                    <p className="text-[var(--ink-soft)] text-sm text-center py-8">
                      {isRtl
                        ? "ابدأ التوليد لرؤية القرارات"
                        : "Start generation to see decisions"}
                    </p>
                  ) : (
                    decisions.map((decision, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 bg-[var(--bg-2)] rounded-[var(--radius-sm)]"
                      >
                        <Sparkles className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[var(--ink)]">
                          {isRtl ? decision.messageAr : decision.message}
                        </p>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4">
                {isRtl ? "المقاييس المباشرة" : "Live Metrics"}
              </h2>
              <div className="space-y-5">
                <div>
                  <Progress
                    value={metrics.compliance}
                    label={isRtl ? "الامتثال للكود" : "Code Compliance"}
                    variant="success"
                  />
                </div>
                <div>
                  <Progress
                    value={metrics.structuralVariance * 20}
                    max={100}
                    label={isRtl ? "الانحراف الهيكلي" : "Structural Variance"}
                    variant="warning"
                  />
                  <p className="text-xs text-[var(--ink-faint)] mt-1">
                    {metrics.structuralVariance.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <Progress
                    value={100 - metrics.clashDensity * 10}
                    label={isRtl ? "خالي من التعارض" : "Clash Free"}
                    variant="default"
                  />
                </div>
                <div>
                  <Progress
                    value={(metrics.energyIntensity / 150) * 100}
                    label={isRtl ? "كثافة الطاقة" : "Energy Intensity"}
                    variant="warning"
                  />
                  <p className="text-xs text-[var(--ink-faint)] mt-1">
                    {metrics.energyIntensity.toFixed(0)} kWh/m²/yr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conflicts */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[var(--accent-2)]" />
                {isRtl ? "التعارضات" : "Conflicts"}
              </h2>
              {isRunning && currentStep > 2 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-[rgba(179,107,45,0.1)] rounded-[var(--radius-sm)] border border-[rgba(179,107,45,0.2)]">
                    <Badge variant="warning">MEP</Badge>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {isRtl
                        ? "تداخل مجرى مع عمود"
                        : "Duct intersects with column"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--ink-soft)] text-center py-4">
                  {isRtl ? "لا توجد تعارضات" : "No conflicts detected"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="p-5 text-center">
              <div
                className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                  isRunning
                    ? "bg-[rgba(15,76,129,0.1)]"
                    : currentStep >= steps.length - 1
                      ? "bg-[rgba(27,107,97,0.1)]"
                      : "bg-[var(--bg-2)]"
                )}
              >
                {isRunning ? (
                  <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                ) : currentStep >= steps.length - 1 ? (
                  <Check className="w-8 h-8 text-[var(--accent-3)]" />
                ) : (
                  <Clock className="w-8 h-8 text-[var(--ink-faint)]" />
                )}
              </div>
              <p className="font-semibold text-[var(--ink)]">
                {isRunning
                  ? isRtl
                    ? "جاري التوليد..."
                    : "Generating..."
                  : currentStep >= steps.length - 1
                    ? isRtl
                      ? "اكتمل التوليد"
                      : "Generation Complete"
                    : isRtl
                      ? "جاهز للبدء"
                      : "Ready to Start"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
