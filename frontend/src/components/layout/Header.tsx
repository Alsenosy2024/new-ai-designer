"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Globe, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { Button } from "@/components/ui";

const breadcrumbNames: Record<string, { en: string; ar: string }> = {
  "": { en: "Dashboard", ar: "لوحة المتابعة" },
  "new-project": { en: "New Project", ar: "مشروع جديد" },
  project: { en: "Project", ar: "المشروع" },
  orchestrator: { en: "AI Generation", ar: "التوليد الذكي" },
  "plan-editor": { en: "Plan Editor", ar: "محرر المخطط" },
  "3d-view": { en: "3D View", ar: "العرض ثلاثي الأبعاد" },
  outputs: { en: "Deliverables", ar: "المخرجات" },
  libraries: { en: "Code Libraries", ar: "مكتبات الأكواد" },
};

export function Header() {
  const pathname = usePathname();
  const { language, setLanguage, setSidebarOpen } = useUIStore();
  const { project } = useProjectStore();
  const isRtl = language === "ar";

  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    const crumbs: { name: string; href: string }[] = [
      { name: isRtl ? "الرئيسية" : "Home", href: "/" },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip numeric IDs in breadcrumbs, but use project name instead
      if (/^\d+$/.test(segment)) {
        if (project && pathSegments[index - 1] === "project") {
          crumbs.push({ name: project.name, href: currentPath });
        }
        return;
      }

      const names = breadcrumbNames[segment];
      if (names) {
        crumbs.push({
          name: isRtl ? names.ar : names.en,
          href: currentPath,
        });
      }
    });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
    document.documentElement.dir = language === "en" ? "rtl" : "ltr";
    document.documentElement.lang = language === "en" ? "ar" : "en";
  };

  return (
    <header className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-[var(--radius-sm)] hover:bg-[rgba(28,30,36,0.06)] text-[var(--ink-soft)]"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm flex-1 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2 min-w-0">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-[var(--ink-faint)] flex-shrink-0",
                    isRtl && "rotate-180"
                  )}
                />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-[var(--ink)] truncate">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors truncate"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === "en" ? "العربية" : "English"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
