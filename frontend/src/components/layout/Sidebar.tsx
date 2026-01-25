"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  FolderOpen,
  Sparkles,
  Layout,
  Box,
  Package,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";

const navigation = [
  {
    section: "Projects",
    sectionAr: "المشاريع",
    items: [
      { name: "Dashboard", nameAr: "لوحة المتابعة", href: "/", icon: Home },
      { name: "New Project", nameAr: "مشروع جديد", href: "/new-project", icon: Plus },
    ],
  },
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

export function Sidebar() {
  const pathname = usePathname();
  const { language, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { project } = useProjectStore();
  const isRtl = language === "ar";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "sticky top-6 h-[calc(100vh-48px)] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] transition-all duration-300 overflow-hidden",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className={cn("p-4 border-b border-[var(--line)]", sidebarCollapsed && "px-3")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[#1d4b8f] via-[#174070] to-[#c9792c] text-white grid place-items-center font-bold text-sm shadow-lg flex-shrink-0">
              AI
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate">
                  {isRtl ? "المصمم الذكي" : "AI Designer"}
                </h1>
                <p className="text-xs text-[var(--ink-soft)] truncate">
                  {isRtl ? "منصة التصميم الهندسي" : "Engineering Design"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Main Navigation */}
          {navigation.map((section) => (
            <div key={section.section}>
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2 px-2">
                  {isRtl ? section.sectionAr : section.section}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                        active
                          ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                          : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]",
                        sidebarCollapsed && "justify-center px-2"
                      )}
                      title={sidebarCollapsed ? (isRtl ? item.nameAr : item.name) : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="truncate">{isRtl ? item.nameAr : item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Active Project Navigation */}
          {project && (
            <div>
              {!sidebarCollapsed && (
                <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2 px-2">
                  {isRtl ? "المشروع الحالي" : "Active Project"}
                </p>
              )}
              {!sidebarCollapsed && (
                <div className="px-2 mb-3">
                  <p className="text-sm font-semibold text-[var(--ink)] truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">{project.status}</p>
                </div>
              )}
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
                        "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                        active
                          ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                          : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]",
                        sidebarCollapsed && "justify-center px-2"
                      )}
                      title={sidebarCollapsed ? (isRtl ? item.nameAr : item.name) : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="truncate">{isRtl ? item.nameAr : item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Access */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-xs font-semibold text-[var(--ink-faint)] uppercase tracking-wider mb-2 px-2">
                {isRtl ? "وصول سريع" : "Quick Access"}
              </p>
            )}
            <div className="space-y-1">
              {quickAccess.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] font-medium text-sm transition-colors",
                      active
                        ? "bg-[rgba(15,76,129,0.1)] text-[var(--accent)] border border-[rgba(15,76,129,0.2)]"
                        : "text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)]",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                    title={sidebarCollapsed ? (isRtl ? item.nameAr : item.name) : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{isRtl ? item.nameAr : item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-[var(--line)]">
          <button
            onClick={toggleSidebar}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[var(--ink-soft)] hover:bg-[rgba(28,30,36,0.06)] hover:text-[var(--ink)] transition-colors text-sm",
              sidebarCollapsed && "justify-center px-2"
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>{isRtl ? "طي القائمة" : "Collapse"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
