import { create } from "zustand";
import type { Project, Run, Outputs } from "@/types";

interface ProjectState {
  // Current project data
  project: Project | null;
  run: Run | null;
  outputs: Outputs | null;

  // All projects for dashboard
  projects: Project[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setProject: (project: Project | null) => void;
  setRun: (run: Run | null) => void;
  setOutputs: (outputs: Outputs | null) => void;
  setProjects: (projects: Project[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  reset: () => void;
}

const initialState = {
  project: null,
  run: null,
  outputs: null,
  projects: [],
  isLoading: false,
  error: null,
};

export const useProjectStore = create<ProjectState>()((set) => ({
  ...initialState,

  setProject: (project) => set({ project }),
  setRun: (run) => set({ run }),
  setOutputs: (outputs) => set({ outputs }),
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateProject: (updates) =>
    set((state) => ({
      project: state.project ? { ...state.project, ...updates } : null,
    })),

  reset: () => set(initialState),
}));
