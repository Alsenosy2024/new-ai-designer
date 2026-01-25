// Project Types
export interface Project {
  id?: string | number;
  name: string;
  region: Region;
  building_type: BuildingType;
  phase: DesignPhase;
  gfa: number;
  floors: number;
  status: ProjectStatus;
  budget?: number;
  delivery?: string;
  energy_target?: number;
  daylight?: number;
  structural_system?: string;
  mep_strategy?: string;
  site_model?: string;
  design_brief?: string;
  core_ratio?: number;
  parking?: number;
  code_library?: string;
}

export type Region = "saudi_arabia" | "uae" | "qatar" | "bahrain" | "oman";
export type BuildingType =
  | "residential"
  | "commercial"
  | "office"
  | "retail"
  | "healthcare"
  | "education"
  | "hospitality"
  | "mixed_use";
export type DesignPhase = "schematic" | "design_development" | "construction_documents";
export type ProjectStatus = "Draft" | "In progress" | "Review" | "Completed";

// Run Types
export interface Run {
  id?: string | number;
  project_id: string | number;
  status: RunStatus;
  conflicts: number;
  started_at?: string;
  completed_at?: string;
}

export type RunStatus = "In progress" | "Completed" | "Failed";

// Output Types
export interface Outputs {
  id?: string | number;
  run_id: string | number;
  clash_density?: number;
  energy?: number;
  structural_variance?: number;
  compliance?: number;
  clash_free?: number;
  code_compliance?: number;
  energy_score?: number;
  structural_score?: number;
  ifc_file?: string;
  gltf_file?: string;
  plan_svg_file?: string;
  mep_schedule_file?: string;
  energy_report_file?: string;
  generated_at?: string;
}

// Run Event Types
export interface RunEvent {
  id?: string | number;
  run_id: string | number;
  message: string;
  level: "info" | "warning" | "error";
  step?: string;
  created_at?: string;
}

// Artifact Types
export interface Artifact {
  id?: string | number;
  run_id: string | number;
  kind: string;
  file_name: string;
  description?: string;
  created_at?: string;
}

// API Response Types
export interface StateResponse {
  project: Project | null;
  run: Run | null;
  outputs: Outputs | null;
}

export interface StatePayload {
  project: Partial<Project>;
  run?: Partial<Run>;
  outputs?: Partial<Outputs>;
}

// Live Metrics for Orchestrator
export interface LiveMetrics {
  compliance: number;
  structuralVariance: number;
  clashDensity: number;
  energyIntensity: number;
}

// Plan Editor Types
export type ToolType =
  | "select"
  | "pan"
  | "wall"
  | "door"
  | "window"
  | "dimension"
  | "text"
  | "erase";

export interface LayerVisibility {
  architectural: boolean;
  structural: boolean;
  mep: boolean;
  annotations: boolean;
}

export interface PlanElement {
  id: string;
  type: "wall" | "door" | "window" | "dimension" | "text";
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  text?: string;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Form Data Types
export interface ProjectFormData {
  name?: string;
  region?: Region;
  building_type?: BuildingType;
  phase?: DesignPhase;
  gfa?: number;
  floors?: number;
  budget?: number;
  delivery?: string;
  energy_target?: number;
  daylight?: number;
  structural_system?: string;
  mep_strategy?: string;
  site_model?: string;
  design_brief?: string;
  core_ratio?: number;
  parking?: number;
  code_library?: string;
}
