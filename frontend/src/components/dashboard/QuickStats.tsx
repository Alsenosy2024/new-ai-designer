"use client";

import { FolderOpen, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import type { Project } from "@/types";

interface QuickStatsProps {
  projects: Project[];
}

export function QuickStats({ projects }: QuickStatsProps) {
  const { language } = useUIStore();
  const isRtl = language === "ar";

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    review: projects.filter((p) => p.status === "Review").length,
  };

  const items = [
    {
      label: isRtl ? "إجمالي المشاريع" : "Total Projects",
      value: stats.total,
      icon: FolderOpen,
      color: "text-[var(--accent)]",
      bg: "bg-[rgba(15,76,129,0.1)]",
    },
    {
      label: isRtl ? "قيد التنفيذ" : "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-[var(--accent-2)]",
      bg: "bg-[rgba(179,107,45,0.1)]",
    },
    {
      label: isRtl ? "مكتملة" : "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-[var(--accent-3)]",
      bg: "bg-[rgba(27,107,97,0.1)]",
    },
    {
      label: isRtl ? "قيد المراجعة" : "In Review",
      value: stats.review,
      icon: AlertTriangle,
      color: "text-[var(--ink-soft)]",
      bg: "bg-[rgba(28,30,36,0.06)]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-[var(--radius-md)] ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--ink)]">{item.value}</p>
                <p className="text-xs text-[var(--ink-soft)]">{item.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
