import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "ar";

interface UIState {
  language: Language;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // For mobile drawer
  activeView: "plan" | "3d" | "split";

  // Actions
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: "plan" | "3d" | "split") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: "en",
      sidebarCollapsed: false,
      sidebarOpen: false,
      activeView: "plan",

      setLanguage: (language) => set({ language }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setActiveView: (activeView) => set({ activeView }),
    }),
    {
      name: "ai-designer-ui",
      partialize: (state) => ({
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
