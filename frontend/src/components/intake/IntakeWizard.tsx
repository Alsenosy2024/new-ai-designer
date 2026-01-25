"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useUIStore } from "@/stores/ui-store";
import type { ProjectFormData } from "@/types";

import { ProjectBasics } from "./steps/ProjectBasics";
import { SiteContext } from "./steps/SiteContext";
import { ProgramRequirements } from "./steps/ProgramRequirements";
import { TechnicalSpecs } from "./steps/TechnicalSpecs";
import { ReviewLaunch } from "./steps/ReviewLaunch";

const steps = [
  { id: "basics", label: "Basics", labelAr: "الأساسيات" },
  { id: "site", label: "Site", labelAr: "الموقع" },
  { id: "program", label: "Program", labelAr: "البرنامج" },
  { id: "technical", label: "Technical", labelAr: "التقنية" },
  { id: "review", label: "Review", labelAr: "المراجعة" },
];

const initialFormData: ProjectFormData = {
  name: "",
  region: "saudi_arabia",
  building_type: "office",
  phase: "schematic",
  gfa: 10000,
  floors: 10,
  budget: undefined,
  delivery: undefined,
  energy_target: 85,
  daylight: 300,
  structural_system: "moment_frame",
  mep_strategy: "standard",
  design_brief: "",
  core_ratio: 20,
  parking: 100,
  code_library: "sbc",
};

interface IntakeWizardProps {
  onComplete: (data: ProjectFormData) => void;
}

export function IntakeWizard({ onComplete }: IntakeWizardProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const updateFormData = (updates: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProjectBasics data={formData} onChange={updateFormData} />;
      case 1:
        return <SiteContext data={formData} onChange={updateFormData} />;
      case 2:
        return <ProgramRequirements data={formData} onChange={updateFormData} />;
      case 3:
        return <TechnicalSpecs data={formData} onChange={updateFormData} />;
      case 4:
        return <ReviewLaunch data={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all",
                    index < currentStep
                      ? "bg-[var(--accent-3)] text-white"
                      : index === currentStep
                        ? "bg-[var(--accent)] text-white shadow-lg"
                        : "bg-[var(--bg-2)] text-[var(--ink-soft)] border border-[var(--line)]"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    index <= currentStep ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"
                  )}
                >
                  {isRtl ? step.labelAr : step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-24 h-0.5 mx-2",
                    index < currentStep ? "bg-[var(--accent-3)]" : "bg-[var(--line)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6 sm:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />
          {isRtl ? "السابق" : "Previous"}
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            {isRtl ? "إطلاق التوليد" : "Launch Generation"}
            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Button>
        ) : (
          <Button onClick={nextStep} className="flex items-center gap-2">
            {isRtl ? "التالي" : "Next"}
            <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Button>
        )}
      </div>
    </div>
  );
}
