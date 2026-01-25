"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Plus,
  FolderOpen,
  Sparkles,
  Layout,
  Box,
  Package,
  BookOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

const navigation = [
  { name: "Dashboard", nameAr: "لوحة المتابعة", href: "/", icon: Home },
  { name: "New Project", nameAr: "مشروع جديد", href: "/new-project", icon: Plus },
];

const projectNavigation = [
  { name: "Overview", nameAr: "نظرة عامة", href: "", icon: FolderOpen },
  { name: "AI Generation", nameAr: "التوليد الذكي", href: "/orchestrator", icon: Sparkles },
  { name: "Plan Editor", nameAr: "محرر المخطط", href: "/plan-editor", icon: Layout },
  { name: "3D View", nameAr: "العرض ثلاثي الأبعاد", href: "/3d-view", icon: Box },
  { name: "Deliverables", nameAr: "المخرجات", href: "/outputs", icon: Package },
];

const quickAccess = [
  { name: "Code Libraries", nameAr: "مكتبات الأكواد", href: "/libraries", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();
  const { language, sidebarOpen, setSidebarOpen } = useUIStore();
  const { project } = useProjectStore();
  const isRtl = language === "ar";

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: isRtl ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 bottom-0 w-[280px] bg-[var(--surface)] z-50 lg:hidden shadow-2xl",
              isRtl ? "right-0" : "left-0"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[#1d4b8f] via-[#174070] to-[#c9792c] text-white grid place-items-center font-bold text-sm shadow-lg">
                    AI
                  </div>
                  <div>
                    <h1 className="font-bold text-sm">
                      {isRtl ? "المصمم الذكي" : "AI Designer"}
                    </h1>
                    <p className="text-xs text-[var(--ink-soft)]">
                      {isRtl ? "منصة التصميم" : "Design Platform"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-[var(--radius-sm)] hover:bg-[rgba(28,30,36,0.06)] text-[var(--ink-soft)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Main Navigation */}
                <div>
                  <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-3">
                    {isRtl ? "المشاريع" : "Projects"}
                  </p>
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                            active
                              ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                              : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{isRtl ? item.nameAr : item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Active Project */}
                {project && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2">
                      {isRtl ? "المشروع الحالي" : "Active Project"}
                    </p>
                    <div className="px-3 mb-3">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {project.name}
                      </p>
                      <p className="text-xs text-[var(--ink-soft)]">{project.status}</p>
                    </div>
                    <div className="space-y-1">
                      {projectNavigation.map((item) => {
                        const Icon = item.icon;
                        const href = `/project/${project.id}${item.href}`;
                        const active = pathname === href;
                        return (
                          <Link
                            key={item.href}
                            href={href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                              active
                                ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                                : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]"
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{isRtl ? item.nameAr : item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Access */}
                <div>
                  <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-3">
                    {isRtl ? "وصول سريع" : "Quick Access"}
                  </p>
                  <div className="space-y-1">
                    {quickAccess.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                            active
                              ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                              : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{isRtl ? item.nameAr : item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
