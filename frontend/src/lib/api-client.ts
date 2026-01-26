import type {
  StateResponse,
  StatePayload,
  RunEvent,
  Artifact,
  Project,
  Run,
} from "@/types";

const runtimeApiBase =
  typeof window !== "undefined"
    ? (window as Window & { aiDesignerApiBase?: string }).aiDesignerApiBase
    : undefined;

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  runtimeApiBase ||
  (typeof window !== "undefined" ? window.location.origin : "") ||
  "http://localhost:8001";

// Demo mode flag - set to true when backend is unavailable
let demoMode = false;

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text().catch(() => "Unknown error");
    throw new ApiError(response.status, message);
  }
  return response.json();
}

// Demo data for when backend is unavailable
const demoProjects: Project[] = [
  {
    id: 1,
    name: "KAFD Tower Complex",
    region: "saudi_arabia",
    building_type: "office",
    phase: "design_development",
    gfa: 45000,
    floors: 32,
    status: "In progress",
  },
  {
    id: 2,
    name: "Al Maryah Residences",
    region: "uae",
    building_type: "residential",
    phase: "schematic",
    gfa: 28000,
    floors: 18,
    status: "Review",
  },
  {
    id: 3,
    name: "Qatar Innovation Hub",
    region: "qatar",
    building_type: "mixed_use",
    phase: "construction_documents",
    gfa: 62000,
    floors: 24,
    status: "Completed",
  },
];

let nextProjectId = 100;

export const apiClient = {
  // Check if backend is available
  async checkBackend(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${API_BASE}/api/state`, {
        signal: controller.signal,
        method: "GET",
      });
      clearTimeout(timeoutId);
      demoMode = !response.ok;
      return response.ok;
    } catch {
      demoMode = true;
      console.warn("Backend not available, using demo mode");
      return false;
    }
  },

  isDemoMode(): boolean {
    return demoMode;
  },

  // Check if backend is connected and return status info
  getBackendStatus(): { available: boolean; message: string } {
    if (demoMode) {
      return {
        available: false,
        message: "Backend server is not connected. Start the backend to view generated content.",
      };
    }
    return { available: true, message: "" };
  },

  // Retry backend connection
  async retryConnection(): Promise<boolean> {
    const wasDemo = demoMode;
    const isAvailable = await this.checkBackend();
    if (wasDemo && isAvailable) {
      console.info("Backend connection restored");
    }
    return isAvailable;
  },

  // State Management
  async getState(): Promise<StateResponse> {
    try {
      const response = await fetch(`${API_BASE}/api/state`);
      return handleResponse<StateResponse>(response);
    } catch {
      demoMode = true;
      return { project: null, run: null, outputs: null };
    }
  },

  async updateState(payload: StatePayload): Promise<StateResponse> {
    if (demoMode) {
      // Demo mode: simulate project creation
      const newProject: Project = {
        id: nextProjectId++,
        name: payload.project.name || "New Project",
        region: payload.project.region || "saudi_arabia",
        building_type: payload.project.building_type || "office",
        phase: payload.project.phase || "schematic",
        gfa: payload.project.gfa || 10000,
        floors: payload.project.floors || 10,
        status: "Draft",
        ...payload.project,
      };
      demoProjects.unshift(newProject);
      return { project: newProject, run: null, outputs: null };
    }

    const response = await fetch(`${API_BASE}/api/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<StateResponse>(response);
  },

  // Project Operations
  async createProject(project: Partial<Project>): Promise<StateResponse> {
    return this.updateState({ project });
  },

  async getProject(id: string | number): Promise<Project | null> {
    if (demoMode) {
      const numericId = typeof id === "number" ? id : Number(id);
      if (!Number.isFinite(numericId)) return null;
      return demoProjects.find((p) => p.id === numericId) || null;
    }
    const state = await this.getState();
    return state.project;
  },

  getProjects(): Project[] {
    return demoProjects;
  },

  // Run Operations
  async startRun(
    projectId: string | number,
    stage: "architectural" | "full" = "full"
  ): Promise<StateResponse> {
    if (demoMode) {
      // Demo mode: simulate run creation
      const project = demoProjects.find((p) => p.id === projectId);
      if (project) {
        project.status = "In progress";
      }
      return {
        project: project || null,
        run: {
          id: Date.now(),
          project_id: projectId,
          status: "In progress",
          conflicts: 0,
          started_at: new Date().toISOString(),
        },
        outputs: null,
      };
    }

    const response = await fetch(
      `${API_BASE}/api/runs/start?project_id=${projectId}&stage=${stage}`,
      { method: "POST" }
    );
    return handleResponse<StateResponse>(response);
  },

  async getRunEvents(runId: string | number): Promise<RunEvent[]> {
    if (demoMode) {
      // Demo mode: return sample events
      return [
        { id: 1, run_id: runId, message: "Starting design generation...", level: "info", step: "init", created_at: new Date().toISOString() },
        { id: 2, run_id: runId, message: "Analyzing site context", level: "info", step: "analysis", created_at: new Date().toISOString() },
        { id: 3, run_id: runId, message: "Generating floor plans", level: "info", step: "architectural", created_at: new Date().toISOString() },
      ];
    }

    const response = await fetch(`${API_BASE}/api/runs/${runId}/events`);
    return handleResponse<RunEvent[]>(response);
  },

  async getRunArtifacts(runId: string | number): Promise<Artifact[]> {
    if (demoMode) {
      console.warn("[Demo Mode] Artifacts not available - backend connection required");
      return [];
    }
    try {
      const response = await fetch(`${API_BASE}/api/runs/${runId}/artifacts`);
      return handleResponse<Artifact[]>(response);
    } catch (error) {
      console.error("Failed to fetch artifacts:", error);
      return [];
    }
  },

  // Get the latest run for a specific project
  async getLatestRunForProject(projectId: string | number): Promise<Run | null> {
    if (demoMode) {
      console.warn("[Demo Mode] Runs not available - backend connection required");
      return null;
    }
    try {
      const response = await fetch(`${API_BASE}/api/projects/${projectId}/runs/latest`);
      const data = await handleResponse<{ run: Run | null }>(response);
      return data.run;
    } catch {
      return null;
    }
  },

  // Plan Operations
  async getPlanRevision(runId: string | number): Promise<Record<string, unknown>> {
    if (demoMode) {
      return {};
    }
    const response = await fetch(`${API_BASE}/api/runs/${runId}/plan`);
    return handleResponse<Record<string, unknown>>(response);
  },

  async savePlanRevision(
    runId: string | number,
    payload: Record<string, unknown>
  ): Promise<void> {
    if (demoMode) {
      console.log("Demo mode: Plan saved locally", payload);
      return;
    }
    await fetch(`${API_BASE}/api/runs/${runId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
  },

  // File URLs
  getFileUrl(projectId: string | number, runId: string | number, fileName: string): string {
    return `${API_BASE}/files/${projectId}/${runId}/${fileName}`;
  },

  // Generic file fetch
  async fetchFile(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to fetch file");
    }
    return response.text();
  },

  // Get run outputs with file URLs
  async getRunOutputs(
    projectId: string | number,
    runId: string | number
  ): Promise<{
    plan_svg?: string;
    gltf?: string;
    ifc?: string;
    dxf?: string;
    schedule?: string;
    energy_report?: string;
    structural_report?: string;
    structural_plan?: string;
    mep_layout?: string;
    review_package?: string;
  }> {
    const artifacts = await this.getRunArtifacts(runId);
    const outputs: Record<string, string> = {};

    for (const artifact of artifacts) {
      const url = this.getFileUrl(projectId, runId, artifact.file_name);
      outputs[artifact.kind] = url;
    }

    return outputs;
  },

  // Download a file by triggering browser download
  async downloadFile(
    projectId: string | number,
    runId: string | number,
    fileName: string
  ): Promise<void> {
    const url = this.getFileUrl(projectId, runId, fileName);
    const response = await fetch(url);
    if (!response.ok) {
      throw new ApiError(response.status, "Failed to download file");
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  },
};

export { ApiError };

// Artifact kind constants for robust artifact finding
export const ARTIFACT_KINDS = {
  PLAN_SVG: ["plan", "plan_svg"],
  GLTF: ["gltf", "model", "3d"],
  DXF: ["dxf", "cad"],
  IFC: ["ifc", "bim"],
  SCHEDULE: ["schedule", "mep_schedule"],
  ENERGY_REPORT: ["energy", "energy_report"],
  STRUCTURAL_REPORT: ["structural", "structural_report"],
  STRUCTURAL_PLAN: ["structural_plan"],
  MEP_LAYOUT: ["mep", "mep_layout"],
  REVIEW_PACKAGE: ["package", "review_package"],
} as const;

// Helper to find artifact by kind with fallback to file extensions
export function findArtifactByKind(
  artifacts: Artifact[],
  kinds: readonly string[],
  fileExtensions?: string[]
): Artifact | undefined {
  return artifacts.find((a) => {
    // Check kind match
    if (kinds.includes(a.kind)) return true;
    // Check file extension match
    if (fileExtensions?.some((ext) => a.file_name?.endsWith(ext))) return true;
    return false;
  });
}
