module.exports = [
"[project]/src/lib/api-client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ARTIFACT_KINDS",
    ()=>ARTIFACT_KINDS,
    "ApiError",
    ()=>ApiError,
    "apiClient",
    ()=>apiClient,
    "findArtifactByKind",
    ()=>findArtifactByKind
]);
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// Demo mode flag - set to true when backend is unavailable
let demoMode = false;
class ApiError extends Error {
    status;
    constructor(status, message){
        super(message), this.status = status;
        this.name = "ApiError";
    }
}
async function handleResponse(response) {
    if (!response.ok) {
        const message = await response.text().catch(()=>"Unknown error");
        throw new ApiError(response.status, message);
    }
    return response.json();
}
// Demo data for when backend is unavailable
const demoProjects = [
    {
        id: 1,
        name: "KAFD Tower Complex",
        region: "saudi_arabia",
        building_type: "office",
        phase: "design_development",
        gfa: 45000,
        floors: 32,
        status: "In progress"
    },
    {
        id: 2,
        name: "Al Maryah Residences",
        region: "uae",
        building_type: "residential",
        phase: "schematic",
        gfa: 28000,
        floors: 18,
        status: "Review"
    },
    {
        id: 3,
        name: "Qatar Innovation Hub",
        region: "qatar",
        building_type: "mixed_use",
        phase: "construction_documents",
        gfa: 62000,
        floors: 24,
        status: "Completed"
    }
];
let nextProjectId = 100;
const apiClient = {
    // Check if backend is available
    async checkBackend () {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 2000);
            const response = await fetch(`${API_BASE}/api/state`, {
                signal: controller.signal,
                method: "GET"
            });
            clearTimeout(timeoutId);
            demoMode = !response.ok;
            return response.ok;
        } catch  {
            demoMode = true;
            console.warn("Backend not available, using demo mode");
            return false;
        }
    },
    isDemoMode () {
        return demoMode;
    },
    // Check if backend is connected and return status info
    getBackendStatus () {
        if (demoMode) {
            return {
                available: false,
                message: "Backend server is not connected. Start the backend to view generated content."
            };
        }
        return {
            available: true,
            message: ""
        };
    },
    // Retry backend connection
    async retryConnection () {
        const wasDemo = demoMode;
        const isAvailable = await this.checkBackend();
        if (wasDemo && isAvailable) {
            console.info("Backend connection restored");
        }
        return isAvailable;
    },
    // State Management
    async getState () {
        try {
            const response = await fetch(`${API_BASE}/api/state`);
            return handleResponse(response);
        } catch  {
            demoMode = true;
            return {
                project: null,
                run: null,
                outputs: null
            };
        }
    },
    async updateState (payload) {
        if (demoMode) {
            // Demo mode: simulate project creation
            const newProject = {
                id: nextProjectId++,
                name: payload.project.name || "New Project",
                region: payload.project.region || "saudi_arabia",
                building_type: payload.project.building_type || "office",
                phase: payload.project.phase || "schematic",
                gfa: payload.project.gfa || 10000,
                floors: payload.project.floors || 10,
                status: "Draft",
                ...payload.project
            };
            demoProjects.unshift(newProject);
            return {
                project: newProject,
                run: null,
                outputs: null
            };
        }
        const response = await fetch(`${API_BASE}/api/state`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        return handleResponse(response);
    },
    // Project Operations
    async createProject (project) {
        return this.updateState({
            project
        });
    },
    async getProject (id) {
        if (demoMode) {
            const numericId = typeof id === "number" ? id : Number(id);
            if (!Number.isFinite(numericId)) return null;
            return demoProjects.find((p)=>p.id === numericId) || null;
        }
        const state = await this.getState();
        return state.project;
    },
    getProjects () {
        return demoProjects;
    },
    // Run Operations
    async startRun (projectId, stage = "full") {
        if (demoMode) {
            // Demo mode: simulate run creation
            const project = demoProjects.find((p)=>p.id === projectId);
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
                    started_at: new Date().toISOString()
                },
                outputs: null
            };
        }
        const response = await fetch(`${API_BASE}/api/runs/start?project_id=${projectId}&stage=${stage}`, {
            method: "POST"
        });
        return handleResponse(response);
    },
    async getRunEvents (runId) {
        if (demoMode) {
            // Demo mode: return sample events
            return [
                {
                    id: 1,
                    run_id: runId,
                    message: "Starting design generation...",
                    level: "info",
                    step: "init",
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    run_id: runId,
                    message: "Analyzing site context",
                    level: "info",
                    step: "analysis",
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    run_id: runId,
                    message: "Generating floor plans",
                    level: "info",
                    step: "architectural",
                    created_at: new Date().toISOString()
                }
            ];
        }
        const response = await fetch(`${API_BASE}/api/runs/${runId}/events`);
        return handleResponse(response);
    },
    async getRunArtifacts (runId) {
        if (demoMode) {
            console.warn("[Demo Mode] Artifacts not available - backend connection required");
            return [];
        }
        try {
            const response = await fetch(`${API_BASE}/api/runs/${runId}/artifacts`);
            return handleResponse(response);
        } catch (error) {
            console.error("Failed to fetch artifacts:", error);
            return [];
        }
    },
    // Get the latest run for a specific project
    async getLatestRunForProject (projectId) {
        if (demoMode) {
            console.warn("[Demo Mode] Runs not available - backend connection required");
            return null;
        }
        try {
            const response = await fetch(`${API_BASE}/api/projects/${projectId}/runs/latest`);
            const data = await handleResponse(response);
            return data.run;
        } catch  {
            return null;
        }
    },
    // Plan Operations
    async getPlanRevision (runId) {
        if (demoMode) {
            return {};
        }
        const response = await fetch(`${API_BASE}/api/runs/${runId}/plan`);
        return handleResponse(response);
    },
    async savePlanRevision (runId, payload) {
        if (demoMode) {
            console.log("Demo mode: Plan saved locally", payload);
            return;
        }
        await fetch(`${API_BASE}/api/runs/${runId}/plan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                payload
            })
        });
    },
    // File URLs
    getFileUrl (projectId, runId, fileName) {
        return `${API_BASE}/files/${projectId}/${runId}/${fileName}`;
    },
    // Generic file fetch
    async fetchFile (url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new ApiError(response.status, "Failed to fetch file");
        }
        return response.text();
    },
    // Get run outputs with file URLs
    async getRunOutputs (projectId, runId) {
        const artifacts = await this.getRunArtifacts(runId);
        const outputs = {};
        for (const artifact of artifacts){
            const url = this.getFileUrl(projectId, runId, artifact.file_name);
            outputs[artifact.kind] = url;
        }
        return outputs;
    },
    // Download a file by triggering browser download
    async downloadFile (projectId, runId, fileName) {
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
    }
};
;
const ARTIFACT_KINDS = {
    PLAN_SVG: [
        "plan",
        "plan_svg"
    ],
    GLTF: [
        "gltf",
        "model",
        "3d"
    ],
    DXF: [
        "dxf",
        "cad"
    ],
    IFC: [
        "ifc",
        "bim"
    ],
    SCHEDULE: [
        "schedule",
        "mep_schedule"
    ],
    ENERGY_REPORT: [
        "energy",
        "energy_report"
    ],
    STRUCTURAL_REPORT: [
        "structural",
        "structural_report"
    ],
    STRUCTURAL_PLAN: [
        "structural_plan"
    ],
    MEP_LAYOUT: [
        "mep",
        "mep_layout"
    ],
    REVIEW_PACKAGE: [
        "package",
        "review_package"
    ]
};
function findArtifactByKind(artifacts, kinds, fileExtensions) {
    return artifacts.find((a)=>{
        // Check kind match
        if (kinds.includes(a.kind)) return true;
        // Check file extension match
        if (fileExtensions?.some((ext)=>a.file_name?.endsWith(ext))) return true;
        return false;
    });
}
}),
"[project]/src/components/plan-editor/SvgCanvas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SvgCanvas",
    ()=>SvgCanvas,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-ssr] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-ssr] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move.js [app-ssr] (ecmascript) <export default as Move>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function SvgCanvas({ projectId, runId, fileName, className = "" }) {
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [svgContent, setSvgContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [scale, setScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [position, setPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragStart, setDragStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    // RAF throttling refs for smooth panning
    const rafRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pendingPositionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load SVG content from backend
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadSvg = async ()=>{
            if (!fileName || !projectId || !runId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const url = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getFileUrl(projectId, runId, fileName);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to load SVG: ${response.status}`);
                }
                const svg = await response.text();
                // Validate SVG content
                if (!svg.includes("<svg") || !svg.includes("</svg>")) {
                    throw new Error("Invalid SVG content");
                }
                setSvgContent(svg);
            } catch (err) {
                console.error("Error loading SVG:", err);
                setError(err instanceof Error ? err.message : "Failed to load plan");
            } finally{
                setLoading(false);
            }
        };
        loadSvg();
    }, [
        projectId,
        runId,
        fileName
    ]);
    // Handle mouse wheel zoom
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((prev)=>Math.max(0.1, Math.min(10, prev * delta)));
    }, []);
    // Handle pan start
    const handleMouseDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.button === 0) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    }, [
        position
    ]);
    // Handle pan move with RAF throttling for smooth performance
    const handleMouseMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (!isDragging) return;
        // Store pending position
        pendingPositionRef.current = {
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        };
        // Throttle with RAF - only update on animation frame
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(()=>{
            rafRef.current = null;
            if (pendingPositionRef.current) {
                setPosition(pendingPositionRef.current);
            }
        });
    }, [
        isDragging,
        dragStart
    ]);
    // Handle pan end
    const handleMouseUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setIsDragging(false);
        // Cancel any pending RAF
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);
    // Cleanup RAF on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);
    // Memoize transform style for GPU acceleration
    const transformStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            willChange: isDragging ? "transform" : "auto"
        }), [
        position.x,
        position.y,
        scale,
        isDragging
    ]);
    // Zoom controls
    const zoomIn = ()=>setScale((prev)=>Math.min(10, prev * 1.2));
    const zoomOut = ()=>setScale((prev)=>Math.max(0.1, prev / 1.2));
    const resetView = ()=>{
        setScale(1);
        setPosition({
            x: 0,
            y: 0
        });
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full bg-[#f8f6f1] ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-[var(--ink-soft)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-10 h-10 mx-auto mb-3 animate-spin opacity-50"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 140,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: "Loading plan..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 141,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 139,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full bg-[#f8f6f1] ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-[var(--ink-soft)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-red-500",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs mt-2",
                        children: "Check that the project has been generated."
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 152,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 150,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
            lineNumber: 149,
            columnNumber: 7
        }, this);
    }
    if (!svgContent) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full bg-[#f8f6f1] ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-[var(--ink-soft)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__["Move"], {
                        className: "w-12 h-12 mx-auto mb-3 opacity-30"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        children: "No plan available"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs mt-1",
                        children: "Generate a project to view the floor plan"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 164,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 161,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
            lineNumber: 160,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full h-full overflow-hidden ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "w-full h-full bg-[#f8f6f1] cursor-grab active:cursor-grabbing",
                onWheel: handleWheel,
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onMouseLeave: handleMouseUp,
                style: {
                    backgroundImage: `
            linear-gradient(0deg, rgba(100,110,125,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,110,125,0.08) 1px, transparent 1px)
          `,
                    backgroundSize: "24px 24px"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex items-center justify-center",
                    style: transformStyle,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "svg-container",
                        dangerouslySetInnerHTML: {
                            __html: svgContent
                        },
                        style: {
                            maxWidth: "100%",
                            maxHeight: "100%"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 193,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                    lineNumber: 189,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 173,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--surface)] rounded-full px-3 py-2 shadow-lg border border-[var(--line)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: zoomOut,
                        className: "p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors",
                        title: "Zoom out",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                            lineNumber: 211,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-[var(--ink-soft)] min-w-[48px] text-center",
                        children: [
                            Math.round(scale * 100),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: zoomIn,
                        className: "p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors",
                        title: "Zoom in",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                            lineNumber: 221,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-px h-6 bg-[var(--line)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 223,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetView,
                        className: "p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors",
                        title: "Reset view",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                            lineNumber: 229,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 bg-[var(--surface)] rounded-[var(--radius-sm)] px-3 py-1.5 shadow border border-[var(--line)]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-[var(--ink-soft)] font-mono",
                    children: [
                        "Scale: ",
                        scale.toFixed(2),
                        "x"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                    lineNumber: 235,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/plan-editor/SvgCanvas.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = SvgCanvas;
}),
"[project]/src/stores/viewer-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useActiveTool",
    ()=>useActiveTool,
    "useBackgroundColor",
    ()=>useBackgroundColor,
    "useCameraMode",
    ()=>useCameraMode,
    "useClippingPlanes",
    ()=>useClippingPlanes,
    "useLayers",
    ()=>useLayers,
    "useSelectedElements",
    ()=>useSelectedElements,
    "useSelectedObjects",
    ()=>useSelectedObjects,
    "useViewTransform",
    ()=>useViewTransform,
    "useViewerStore",
    ()=>useViewerStore,
    "useVisibleFloors",
    ()=>useVisibleFloors
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
;
;
// =============================================================================
// Default Values
// =============================================================================
const defaultLayers = {
    architectural: {
        visible: true,
        locked: false,
        opacity: 1
    },
    structural: {
        visible: true,
        locked: false,
        opacity: 1
    },
    "mep-hvac": {
        visible: true,
        locked: false,
        opacity: 1
    },
    "mep-electrical": {
        visible: true,
        locked: false,
        opacity: 1
    },
    "mep-plumbing": {
        visible: true,
        locked: false,
        opacity: 1
    },
    annotations: {
        visible: true,
        locked: false,
        opacity: 1
    },
    grid: {
        visible: true,
        locked: true,
        opacity: 0.5
    },
    dimensions: {
        visible: true,
        locked: false,
        opacity: 1
    },
    furniture: {
        visible: true,
        locked: false,
        opacity: 1
    }
};
const defaultViewTransform = {
    panX: 0,
    panY: 0,
    zoom: 1,
    rotation: 0
};
const defaultCameraPosition = {
    x: 60,
    y: 40,
    z: 60
};
const defaultCameraTarget = {
    x: 0,
    y: 0,
    z: 0
};
const useViewerStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        // -----------------------------------------------------------------------
        // 2D Initial State
        // -----------------------------------------------------------------------
        activeTool: "select",
        layers: {
            ...defaultLayers
        },
        selectedElementIds: [],
        hoveredElementId: null,
        viewTransform: {
            ...defaultViewTransform
        },
        backgroundColor: "dark",
        showGrid: true,
        gridSize: 1.2,
        snapToGrid: true,
        snapTolerance: 0.1,
        measurementActive: false,
        measurementPoints: [],
        measurementUnit: "m",
        // -----------------------------------------------------------------------
        // 3D Initial State
        // -----------------------------------------------------------------------
        totalFloors: 1,
        visibleFloors: [
            0
        ],
        floorOpacity: {
            0: 1
        },
        explodedView: false,
        explodeDistance: 5,
        clippingPlanes: [],
        activeClippingPlaneId: null,
        cameraMode: "orbit",
        cameraPosition: {
            ...defaultCameraPosition
        },
        cameraTarget: {
            ...defaultCameraTarget
        },
        selectedObjectIds: [],
        hoveredObjectId: null,
        renderQuality: "medium",
        showShadows: true,
        showAmbientOcclusion: false,
        antialiasing: true,
        measurement3DActive: false,
        measurement3DPoints: [],
        // -----------------------------------------------------------------------
        // 2D Actions
        // -----------------------------------------------------------------------
        setActiveTool: (tool)=>set({
                activeTool: tool
            }),
        setLayerVisibility: (layer, visible)=>set((state)=>({
                    layers: {
                        ...state.layers,
                        [layer]: {
                            ...state.layers[layer],
                            visible
                        }
                    }
                })),
        setLayerLocked: (layer, locked)=>set((state)=>({
                    layers: {
                        ...state.layers,
                        [layer]: {
                            ...state.layers[layer],
                            locked
                        }
                    }
                })),
        setLayerOpacity: (layer, opacity)=>set((state)=>({
                    layers: {
                        ...state.layers,
                        [layer]: {
                            ...state.layers[layer],
                            opacity
                        }
                    }
                })),
        toggleLayerVisibility: (layer)=>set((state)=>({
                    layers: {
                        ...state.layers,
                        [layer]: {
                            ...state.layers[layer],
                            visible: !state.layers[layer].visible
                        }
                    }
                })),
        showAllLayers: ()=>set((state)=>{
                const newLayers = {
                    ...state.layers
                };
                Object.keys(newLayers).forEach((key)=>{
                    newLayers[key].visible = true;
                });
                return {
                    layers: newLayers
                };
            }),
        hideAllLayers: ()=>set((state)=>{
                const newLayers = {
                    ...state.layers
                };
                Object.keys(newLayers).forEach((key)=>{
                    newLayers[key].visible = false;
                });
                return {
                    layers: newLayers
                };
            }),
        selectElement: (id, addToSelection = false)=>set((state)=>({
                    selectedElementIds: addToSelection ? [
                        ...state.selectedElementIds,
                        id
                    ] : [
                        id
                    ]
                })),
        selectElements: (ids)=>set({
                selectedElementIds: ids
            }),
        deselectElement: (id)=>set((state)=>({
                    selectedElementIds: state.selectedElementIds.filter((eid)=>eid !== id)
                })),
        clearSelection: ()=>set({
                selectedElementIds: [],
                hoveredElementId: null
            }),
        setHoveredElement: (id)=>set({
                hoveredElementId: id
            }),
        setViewTransform: (transform)=>set((state)=>({
                    viewTransform: {
                        ...state.viewTransform,
                        ...transform
                    }
                })),
        resetViewTransform: ()=>set({
                viewTransform: {
                    ...defaultViewTransform
                }
            }),
        zoomIn: ()=>set((state)=>({
                    viewTransform: {
                        ...state.viewTransform,
                        zoom: Math.min(state.viewTransform.zoom * 1.2, 50)
                    }
                })),
        zoomOut: ()=>set((state)=>({
                    viewTransform: {
                        ...state.viewTransform,
                        zoom: Math.max(state.viewTransform.zoom / 1.2, 0.1)
                    }
                })),
        zoomToFit: ()=>set({
                viewTransform: {
                    panX: 0,
                    panY: 0,
                    zoom: 1,
                    rotation: 0
                }
            }),
        rotateView: (degrees)=>set((state)=>({
                    viewTransform: {
                        ...state.viewTransform,
                        rotation: (state.viewTransform.rotation + degrees) % 360
                    }
                })),
        setBackgroundColor: (color)=>set({
                backgroundColor: color
            }),
        toggleGrid: ()=>set((state)=>({
                    showGrid: !state.showGrid
                })),
        setGridSize: (size)=>set({
                gridSize: size
            }),
        toggleSnapToGrid: ()=>set((state)=>({
                    snapToGrid: !state.snapToGrid
                })),
        startMeasurement: ()=>set({
                measurementActive: true,
                measurementPoints: [],
                activeTool: "select"
            }),
        addMeasurementPoint: (point)=>set((state)=>({
                    measurementPoints: [
                        ...state.measurementPoints,
                        point
                    ]
                })),
        clearMeasurement: ()=>set({
                measurementActive: false,
                measurementPoints: []
            }),
        setMeasurementUnit: (unit)=>set({
                measurementUnit: unit
            }),
        // -----------------------------------------------------------------------
        // 3D Actions
        // -----------------------------------------------------------------------
        setTotalFloors: (count)=>{
            const floors = Array.from({
                length: count
            }, (_, i)=>i);
            const opacities = {};
            floors.forEach((f)=>opacities[f] = 1);
            set({
                totalFloors: count,
                visibleFloors: floors,
                floorOpacity: opacities
            });
        },
        toggleFloorVisibility: (floor)=>set((state)=>({
                    visibleFloors: state.visibleFloors.includes(floor) ? state.visibleFloors.filter((f)=>f !== floor) : [
                        ...state.visibleFloors,
                        floor
                    ].sort((a, b)=>a - b)
                })),
        showFloor: (floor)=>set((state)=>({
                    visibleFloors: state.visibleFloors.includes(floor) ? state.visibleFloors : [
                        ...state.visibleFloors,
                        floor
                    ].sort((a, b)=>a - b)
                })),
        hideFloor: (floor)=>set((state)=>({
                    visibleFloors: state.visibleFloors.filter((f)=>f !== floor)
                })),
        showAllFloors: ()=>set((state)=>({
                    visibleFloors: Array.from({
                        length: state.totalFloors
                    }, (_, i)=>i)
                })),
        hideAllFloors: ()=>set({
                visibleFloors: []
            }),
        isolateFloor: (floor)=>set({
                visibleFloors: [
                    floor
                ]
            }),
        setFloorOpacity: (floor, opacity)=>set((state)=>({
                    floorOpacity: {
                        ...state.floorOpacity,
                        [floor]: opacity
                    }
                })),
        toggleExplodedView: ()=>set((state)=>({
                    explodedView: !state.explodedView
                })),
        setExplodeDistance: (distance)=>set({
                explodeDistance: distance
            }),
        addClippingPlane: (plane)=>set((state)=>({
                    clippingPlanes: [
                        ...state.clippingPlanes,
                        plane
                    ]
                })),
        removeClippingPlane: (id)=>set((state)=>({
                    clippingPlanes: state.clippingPlanes.filter((p)=>p.id !== id),
                    activeClippingPlaneId: state.activeClippingPlaneId === id ? null : state.activeClippingPlaneId
                })),
        updateClippingPlane: (id, updates)=>set((state)=>({
                    clippingPlanes: state.clippingPlanes.map((p)=>p.id === id ? {
                            ...p,
                            ...updates
                        } : p)
                })),
        toggleClippingPlane: (id)=>set((state)=>({
                    clippingPlanes: state.clippingPlanes.map((p)=>p.id === id ? {
                            ...p,
                            enabled: !p.enabled
                        } : p)
                })),
        setActiveClippingPlane: (id)=>set({
                activeClippingPlaneId: id
            }),
        clearAllClippingPlanes: ()=>set({
                clippingPlanes: [],
                activeClippingPlaneId: null
            }),
        setCameraMode: (mode)=>set({
                cameraMode: mode
            }),
        setCameraPosition: (position)=>set({
                cameraPosition: position
            }),
        setCameraTarget: (target)=>set({
                cameraTarget: target
            }),
        resetCamera: ()=>set({
                cameraPosition: {
                    ...defaultCameraPosition
                },
                cameraTarget: {
                    ...defaultCameraTarget
                },
                cameraMode: "orbit"
            }),
        selectObject: (id, addToSelection = false)=>set((state)=>({
                    selectedObjectIds: addToSelection ? [
                        ...state.selectedObjectIds,
                        id
                    ] : [
                        id
                    ]
                })),
        selectObjects: (ids)=>set({
                selectedObjectIds: ids
            }),
        deselectObject: (id)=>set((state)=>({
                    selectedObjectIds: state.selectedObjectIds.filter((oid)=>oid !== id)
                })),
        clearObjectSelection: ()=>set({
                selectedObjectIds: [],
                hoveredObjectId: null
            }),
        setHoveredObject: (id)=>set({
                hoveredObjectId: id
            }),
        setRenderQuality: (quality)=>set({
                renderQuality: quality
            }),
        toggleShadows: ()=>set((state)=>({
                    showShadows: !state.showShadows
                })),
        toggleAmbientOcclusion: ()=>set((state)=>({
                    showAmbientOcclusion: !state.showAmbientOcclusion
                })),
        toggleAntialiasing: ()=>set((state)=>({
                    antialiasing: !state.antialiasing
                })),
        startMeasurement3D: ()=>set({
                measurement3DActive: true,
                measurement3DPoints: []
            }),
        addMeasurement3DPoint: (point)=>set((state)=>({
                    measurement3DPoints: [
                        ...state.measurement3DPoints,
                        point
                    ]
                })),
        clearMeasurement3D: ()=>set({
                measurement3DActive: false,
                measurement3DPoints: []
            })
    }), {
    name: "ai-designer-viewer",
    partialize: (state)=>({
            // Persist user preferences
            backgroundColor: state.backgroundColor,
            showGrid: state.showGrid,
            gridSize: state.gridSize,
            snapToGrid: state.snapToGrid,
            measurementUnit: state.measurementUnit,
            renderQuality: state.renderQuality,
            showShadows: state.showShadows,
            antialiasing: state.antialiasing,
            cameraMode: state.cameraMode
        })
}));
const useActiveTool = ()=>useViewerStore((state)=>state.activeTool);
const useSelectedElements = ()=>useViewerStore((state)=>state.selectedElementIds);
const useViewTransform = ()=>useViewerStore((state)=>state.viewTransform);
const useLayers = ()=>useViewerStore((state)=>state.layers);
const useBackgroundColor = ()=>useViewerStore((state)=>state.backgroundColor);
const useVisibleFloors = ()=>useViewerStore((state)=>state.visibleFloors);
const useClippingPlanes = ()=>useViewerStore((state)=>state.clippingPlanes);
const useCameraMode = ()=>useViewerStore((state)=>state.cameraMode);
const useSelectedObjects = ()=>useViewerStore((state)=>state.selectedObjectIds);
}),
"[project]/src/components/plan-editor/utils/svg-parser.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * SVG Parser Utility
 *
 * Parses backend-generated SVG floor plans into structured CAD elements
 * for rendering with Konva.js
 */ __turbopack_context__.s([
    "calculateBounds",
    ()=>calculateBounds,
    "findElementAtPoint",
    ()=>findElementAtPoint,
    "getElementsByLayer",
    ()=>getElementsByLayer,
    "getElementsByType",
    ()=>getElementsByType,
    "parseSVG",
    ()=>parseSVG
]);
// =============================================================================
// Layer Detection
// =============================================================================
function detectLayer(element) {
    const className = element.getAttribute("class") || "";
    const id = element.getAttribute("id") || "";
    const stroke = element.getAttribute("stroke") || "";
    const dataLayer = element.getAttribute("data-layer");
    if (dataLayer) {
        return dataLayer;
    }
    // Check class names
    if (className.includes("wall") || className.includes("outline")) {
        return "architectural";
    }
    if (className.includes("column") || className.includes("beam") || className.includes("structural")) {
        return "structural";
    }
    if (className.includes("hvac") || className.includes("duct")) {
        return "mep-hvac";
    }
    if (className.includes("electrical") || className.includes("panel")) {
        return "mep-electrical";
    }
    if (className.includes("plumbing") || className.includes("pipe") || className.includes("riser")) {
        return "mep-plumbing";
    }
    if (className.includes("grid") || className.includes("axis")) {
        return "grid";
    }
    if (className.includes("dimension") || className.includes("dim")) {
        return "dimensions";
    }
    if (className.includes("annotation") || className.includes("label") || className.includes("text")) {
        return "annotations";
    }
    if (className.includes("furniture") || className.includes("equipment")) {
        return "furniture";
    }
    // Check stroke colors
    if (stroke.includes("#FF0000") || stroke.includes("red")) {
        return "structural";
    }
    if (stroke.includes("#00FFFF") || stroke.includes("cyan")) {
        return "mep-hvac";
    }
    if (stroke.includes("#FF00FF") || stroke.includes("magenta")) {
        return "mep-electrical";
    }
    if (stroke.includes("#0000FF") || stroke.includes("blue")) {
        return "mep-plumbing";
    }
    return "architectural";
}
// =============================================================================
// Element Type Detection
// =============================================================================
function detectElementType(element) {
    const className = element.getAttribute("class") || "";
    const id = element.getAttribute("id") || "";
    const dataType = element.getAttribute("data-type");
    if (dataType) {
        return dataType;
    }
    const lowerClass = className.toLowerCase();
    const lowerId = id.toLowerCase();
    if (lowerClass.includes("wall") || lowerId.includes("wall")) return "wall";
    if (lowerClass.includes("door") || lowerId.includes("door")) return "door";
    if (lowerClass.includes("window") || lowerId.includes("window")) return "window";
    if (lowerClass.includes("column") || lowerId.includes("column")) return "column";
    if (lowerClass.includes("beam") || lowerId.includes("beam")) return "beam";
    if (lowerClass.includes("space") || lowerId.includes("space")) return "space";
    if (lowerClass.includes("core") || lowerId.includes("core")) return "core";
    if (lowerClass.includes("stair") || lowerId.includes("stair")) return "stairs";
    if (lowerClass.includes("elevator") || lowerId.includes("elevator")) return "elevator";
    if (lowerClass.includes("duct") || lowerId.includes("duct")) return "duct";
    if (lowerClass.includes("pipe") || lowerId.includes("pipe")) return "pipe";
    if (lowerClass.includes("grid") || lowerId.includes("grid")) return "grid-line";
    if (lowerClass.includes("dimension") || lowerId.includes("dim")) return "dimension";
    if (lowerClass.includes("text") || lowerId.includes("text") || lowerId.includes("label")) return "text";
    // Default based on element type
    const tagName = element.tagName.toLowerCase();
    if (tagName === "text" || tagName === "tspan") return "text";
    if (tagName === "rect") return "space";
    if (tagName === "line" || tagName === "polyline" || tagName === "path") return "wall";
    return "wall";
}
// =============================================================================
// Coordinate Parsing
// =============================================================================
function parsePoints(pointsAttr) {
    const points = [];
    const pairs = pointsAttr.trim().split(/\s+/);
    for (const pair of pairs){
        const [x, y] = pair.split(",").map(Number);
        if (!isNaN(x) && !isNaN(y)) {
            points.push({
                x,
                y
            });
        }
    }
    return points;
}
function parseTransform(transformAttr) {
    const result = {
        translateX: 0,
        translateY: 0,
        scale: 1,
        rotate: 0
    };
    if (!transformAttr) return result;
    // Parse translate
    const translateMatch = transformAttr.match(/translate\(\s*([^,\s]+)\s*,?\s*([^)]*)\s*\)/);
    if (translateMatch) {
        result.translateX = parseFloat(translateMatch[1]) || 0;
        result.translateY = parseFloat(translateMatch[2]) || 0;
    }
    // Parse scale
    const scaleMatch = transformAttr.match(/scale\(\s*([^,\s]+)\s*,?\s*([^)]*)\s*\)/);
    if (scaleMatch) {
        result.scale = parseFloat(scaleMatch[1]) || 1;
    }
    // Parse rotate
    const rotateMatch = transformAttr.match(/rotate\(\s*([^)]+)\s*\)/);
    if (rotateMatch) {
        result.rotate = parseFloat(rotateMatch[1]) || 0;
    }
    return result;
}
// =============================================================================
// Element Parsers
// =============================================================================
function parseLine(element, index) {
    const x1 = parseFloat(element.getAttribute("x1") || "0");
    const y1 = parseFloat(element.getAttribute("y1") || "0");
    const x2 = parseFloat(element.getAttribute("x2") || "0");
    const y2 = parseFloat(element.getAttribute("y2") || "0");
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    return {
        id: element.getAttribute("id") || `line-${index}`,
        type,
        layer,
        points: [
            {
                x: x1,
                y: y1
            },
            {
                x: x2,
                y: y2
            }
        ],
        bounds: {
            minX: Math.min(x1, x2),
            minY: Math.min(y1, y2),
            maxX: Math.max(x1, x2),
            maxY: Math.max(y1, y2)
        },
        properties: {
            stroke: element.getAttribute("stroke") || "#FFFFFF",
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
}
function parseRect(element, index) {
    const x = parseFloat(element.getAttribute("x") || "0");
    const y = parseFloat(element.getAttribute("y") || "0");
    const width = parseFloat(element.getAttribute("width") || "0");
    const height = parseFloat(element.getAttribute("height") || "0");
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return null;
    if (width === 0 || height === 0) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    const baseElement = {
        id: element.getAttribute("id") || `rect-${index}`,
        type,
        layer,
        points: [
            {
                x,
                y
            },
            {
                x: x + width,
                y
            },
            {
                x: x + width,
                y: y + height
            },
            {
                x,
                y: y + height
            }
        ],
        bounds: {
            minX: x,
            minY: y,
            maxX: x + width,
            maxY: y + height
        },
        properties: {
            width,
            height,
            fill: element.getAttribute("fill"),
            stroke: element.getAttribute("stroke"),
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        fillColor: element.getAttribute("fill") || "transparent",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
    // Handle space elements specially
    if (type === "space" || type === "core") {
        const spaceElement = {
            ...baseElement,
            type: "space",
            name: element.getAttribute("data-name") || element.getAttribute("id") || `Space ${index}`,
            area: width * height,
            spaceType: element.getAttribute("data-space-type") || "general",
            requiresDaylight: element.getAttribute("data-daylight") === "true"
        };
        return spaceElement;
    }
    return baseElement;
}
function parsePolyline(element, index) {
    const pointsAttr = element.getAttribute("points");
    if (!pointsAttr) return null;
    const points = parsePoints(pointsAttr);
    if (points.length < 2) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    const xs = points.map((p)=>p.x);
    const ys = points.map((p)=>p.y);
    return {
        id: element.getAttribute("id") || `polyline-${index}`,
        type,
        layer,
        points,
        bounds: {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        },
        properties: {
            stroke: element.getAttribute("stroke"),
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
            fill: element.getAttribute("fill")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        fillColor: element.getAttribute("fill") || "none",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
}
function parsePolygon(element, index) {
    const pointsAttr = element.getAttribute("points");
    if (!pointsAttr) return null;
    const points = parsePoints(pointsAttr);
    if (points.length < 3) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    const xs = points.map((p)=>p.x);
    const ys = points.map((p)=>p.y);
    return {
        id: element.getAttribute("id") || `polygon-${index}`,
        type,
        layer,
        points,
        bounds: {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        },
        properties: {
            stroke: element.getAttribute("stroke"),
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
            fill: element.getAttribute("fill")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        fillColor: element.getAttribute("fill") || "none",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
}
function parseCircle(element, index) {
    const cx = parseFloat(element.getAttribute("cx") || "0");
    const cy = parseFloat(element.getAttribute("cy") || "0");
    const r = parseFloat(element.getAttribute("r") || "0");
    if (isNaN(cx) || isNaN(cy) || isNaN(r) || r === 0) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    return {
        id: element.getAttribute("id") || `circle-${index}`,
        type,
        layer,
        points: [
            {
                x: cx,
                y: cy
            }
        ],
        bounds: {
            minX: cx - r,
            minY: cy - r,
            maxX: cx + r,
            maxY: cy + r
        },
        properties: {
            cx,
            cy,
            radius: r,
            stroke: element.getAttribute("stroke"),
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
            fill: element.getAttribute("fill")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        fillColor: element.getAttribute("fill") || "none",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
}
function parseText(element, index) {
    const x = parseFloat(element.getAttribute("x") || "0");
    const y = parseFloat(element.getAttribute("y") || "0");
    const text = element.textContent || "";
    if (!text.trim()) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    const fontSize = parseFloat(element.getAttribute("font-size") || "12");
    return {
        id: element.getAttribute("id") || `text-${index}`,
        type: "text",
        layer,
        points: [
            {
                x,
                y
            }
        ],
        properties: {
            text: text.trim(),
            fontSize,
            fontFamily: element.getAttribute("font-family") || "Arial",
            textAnchor: element.getAttribute("text-anchor") || "start",
            fill: element.getAttribute("fill") || "#FFFFFF"
        },
        strokeColor: "transparent",
        fillColor: element.getAttribute("fill") || "#FFFFFF"
    };
}
function parsePath(element, index) {
    const d = element.getAttribute("d");
    if (!d) return null;
    // Simple path parsing - extract key points
    const points = [];
    const regex = /([MLHVCSQTAZ])([^MLHVCSQTAZ]*)/gi;
    let match;
    let currentX = 0;
    let currentY = 0;
    while((match = regex.exec(d)) !== null){
        const cmd = match[1].toUpperCase();
        const args = match[2].trim().split(/[\s,]+/).map(Number);
        switch(cmd){
            case "M":
            case "L":
                if (args.length >= 2) {
                    currentX = args[0];
                    currentY = args[1];
                    points.push({
                        x: currentX,
                        y: currentY
                    });
                }
                break;
            case "H":
                if (args.length >= 1) {
                    currentX = args[0];
                    points.push({
                        x: currentX,
                        y: currentY
                    });
                }
                break;
            case "V":
                if (args.length >= 1) {
                    currentY = args[0];
                    points.push({
                        x: currentX,
                        y: currentY
                    });
                }
                break;
            case "Z":
                break;
        }
    }
    if (points.length < 2) return null;
    const type = detectElementType(element);
    const layer = detectLayer(element);
    const xs = points.map((p)=>p.x);
    const ys = points.map((p)=>p.y);
    return {
        id: element.getAttribute("id") || `path-${index}`,
        type,
        layer,
        points,
        bounds: {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        },
        properties: {
            d,
            stroke: element.getAttribute("stroke"),
            strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1"),
            fill: element.getAttribute("fill")
        },
        strokeColor: element.getAttribute("stroke") || "#FFFFFF",
        fillColor: element.getAttribute("fill") || "none",
        strokeWidth: parseFloat(element.getAttribute("stroke-width") || "1")
    };
}
// =============================================================================
// Grid Data Extraction
// =============================================================================
function extractGridData(svgElement) {
    const result = {
        gridX: [],
        gridY: [],
        labelsX: [],
        labelsY: []
    };
    // Try data attributes first
    const dataGridX = svgElement.getAttribute("data-grid-x");
    const dataGridY = svgElement.getAttribute("data-grid-y");
    if (dataGridX) {
        try {
            result.gridX = JSON.parse(dataGridX);
        } catch  {
        // ignore
        }
    }
    if (dataGridY) {
        try {
            result.gridY = JSON.parse(dataGridY);
        } catch  {
        // ignore
        }
    }
    // Extract from grid lines if not in attributes
    if (result.gridX.length === 0 || result.gridY.length === 0) {
        const lines = svgElement.querySelectorAll('line[class*="grid"], line[class*="axis"]');
        lines.forEach((line)=>{
            const x1 = parseFloat(line.getAttribute("x1") || "0");
            const y1 = parseFloat(line.getAttribute("y1") || "0");
            const x2 = parseFloat(line.getAttribute("x2") || "0");
            const y2 = parseFloat(line.getAttribute("y2") || "0");
            // Vertical line = X grid
            if (Math.abs(x1 - x2) < 0.1) {
                if (!result.gridX.includes(x1)) {
                    result.gridX.push(x1);
                }
            }
            // Horizontal line = Y grid
            if (Math.abs(y1 - y2) < 0.1) {
                if (!result.gridY.includes(y1)) {
                    result.gridY.push(y1);
                }
            }
        });
    }
    // Sort grids
    result.gridX.sort((a, b)=>a - b);
    result.gridY.sort((a, b)=>a - b);
    // Generate labels (A, B, C... for X; 1, 2, 3... for Y)
    result.labelsX = result.gridX.map((_, i)=>String.fromCharCode(65 + i));
    result.labelsY = result.gridY.map((_, i)=>String(i + 1));
    return result;
}
function parseSVG(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    if (!svgElement) {
        throw new Error("Invalid SVG: No SVG element found");
    }
    // Parse dimensions
    const width = parseFloat(svgElement.getAttribute("width") || "800");
    const height = parseFloat(svgElement.getAttribute("height") || "600");
    // Parse viewBox
    let viewBox = null;
    const viewBoxAttr = svgElement.getAttribute("viewBox");
    if (viewBoxAttr) {
        const parts = viewBoxAttr.split(/\s+/).map(Number);
        if (parts.length === 4) {
            viewBox = {
                x: parts[0],
                y: parts[1],
                width: parts[2],
                height: parts[3]
            };
        }
    }
    // Extract grid data
    const gridData = extractGridData(svgElement);
    // Parse all elements
    const elements = [];
    let elementIndex = 0;
    // Parse lines
    svgElement.querySelectorAll("line").forEach((el)=>{
        const parsed = parseLine(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse rectangles
    svgElement.querySelectorAll("rect").forEach((el)=>{
        const parsed = parseRect(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse polylines
    svgElement.querySelectorAll("polyline").forEach((el)=>{
        const parsed = parsePolyline(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse polygons
    svgElement.querySelectorAll("polygon").forEach((el)=>{
        const parsed = parsePolygon(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse circles
    svgElement.querySelectorAll("circle").forEach((el)=>{
        const parsed = parseCircle(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse paths
    svgElement.querySelectorAll("path").forEach((el)=>{
        const parsed = parsePath(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    // Parse text
    svgElement.querySelectorAll("text").forEach((el)=>{
        const parsed = parseText(el, elementIndex++);
        if (parsed) elements.push(parsed);
    });
    return {
        width: viewBox?.width || width,
        height: viewBox?.height || height,
        viewBox,
        elements,
        gridX: gridData.gridX,
        gridY: gridData.gridY,
        gridLabelsX: gridData.labelsX,
        gridLabelsY: gridData.labelsY
    };
}
function getElementsByLayer(elements, layer) {
    return elements.filter((el)=>el.layer === layer);
}
function getElementsByType(elements, type) {
    return elements.filter((el)=>el.type === type);
}
function calculateBounds(elements) {
    if (elements.length === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    elements.forEach((el)=>{
        if (el.bounds) {
            minX = Math.min(minX, el.bounds.minX);
            minY = Math.min(minY, el.bounds.minY);
            maxX = Math.max(maxX, el.bounds.maxX);
            maxY = Math.max(maxY, el.bounds.maxY);
        }
    });
    return {
        minX,
        minY,
        maxX,
        maxY
    };
}
function findElementAtPoint(elements, point, tolerance = 5) {
    // Search in reverse order (top elements first)
    for(let i = elements.length - 1; i >= 0; i--){
        const el = elements[i];
        if (!el.bounds) continue;
        const { minX, minY, maxX, maxY } = el.bounds;
        if (point.x >= minX - tolerance && point.x <= maxX + tolerance && point.y >= minY - tolerance && point.y <= maxY + tolerance) {
            return el;
        }
    }
    return null;
}
}),
"[project]/src/types/cad.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================================================
// CAD Element Type Definitions for Professional 2D/3D Viewers
// =============================================================================
// -----------------------------------------------------------------------------
// Basic Geometry Types
// -----------------------------------------------------------------------------
__turbopack_context__.s([
    "CAD_COLORS",
    ()=>CAD_COLORS,
    "CAD_LINE_WEIGHTS",
    ()=>CAD_LINE_WEIGHTS,
    "DEFAULT_LAYERS",
    ()=>DEFAULT_LAYERS
]);
const CAD_COLORS = {
    // Layer colors
    wall: "#FFFFFF",
    wallExterior: "#00FFFF",
    door: "#FF8000",
    window: "#00BFFF",
    column: "#FF0000",
    beam: "#FF0000",
    space: "#E6E6E6",
    grid: "#808080",
    dimension: "#FFFF00",
    text: "#FFFFFF",
    annotation: "#00FF00",
    core: "#C0C0C0",
    mepHvac: "#00FFFF",
    mepElectrical: "#FF00FF",
    mepPlumbing: "#0000FF",
    // UI colors
    selection: "#00FF00",
    hover: "#FFFF00",
    snap: "#FF00FF",
    measurementLine: "#00FFFF"
};
const CAD_LINE_WEIGHTS = {
    wall: 2.0,
    wallExterior: 2.5,
    partition: 1.5,
    door: 1.0,
    window: 1.0,
    column: 1.5,
    beam: 1.5,
    grid: 0.5,
    dimension: 0.5,
    dimensionExtension: 0.25,
    text: 0.5,
    annotation: 0.5,
    space: 0.25,
    furniture: 0.5,
    mep: 1.0
};
const DEFAULT_LAYERS = [
    {
        id: "architectural",
        name: "Architectural",
        color: CAD_COLORS.wall,
        lineWeight: CAD_LINE_WEIGHTS.wall,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "structural",
        name: "Structural",
        color: CAD_COLORS.column,
        lineWeight: CAD_LINE_WEIGHTS.column,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "mep-hvac",
        name: "MEP - HVAC",
        color: CAD_COLORS.mepHvac,
        lineWeight: CAD_LINE_WEIGHTS.mep,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "mep-electrical",
        name: "MEP - Electrical",
        color: CAD_COLORS.mepElectrical,
        lineWeight: CAD_LINE_WEIGHTS.mep,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "mep-plumbing",
        name: "MEP - Plumbing",
        color: CAD_COLORS.mepPlumbing,
        lineWeight: CAD_LINE_WEIGHTS.mep,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "annotations",
        name: "Annotations",
        color: CAD_COLORS.annotation,
        lineWeight: CAD_LINE_WEIGHTS.annotation,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "grid",
        name: "Grid",
        color: CAD_COLORS.grid,
        lineWeight: CAD_LINE_WEIGHTS.grid,
        visible: true,
        locked: true,
        printable: true
    },
    {
        id: "dimensions",
        name: "Dimensions",
        color: CAD_COLORS.dimension,
        lineWeight: CAD_LINE_WEIGHTS.dimension,
        visible: true,
        locked: false,
        printable: true
    },
    {
        id: "furniture",
        name: "Furniture",
        color: "#A0A0A0",
        lineWeight: CAD_LINE_WEIGHTS.furniture,
        visible: true,
        locked: false,
        printable: true
    }
];
}),
"[project]/src/components/plan-editor/CADCanvas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CADCanvas",
    ()=>CADCanvas,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * CADCanvas - Professional 2D CAD Viewer Component
 *
 * A full-featured 2D floor plan viewer built with Konva.js,
 * providing AutoCAD/Revit-like functionality including:
 * - Pan, zoom, and rotate controls
 * - Layer visibility management
 * - Element selection
 * - Grid display
 * - Measurement tools
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonva$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonva.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-konva/es/ReactKonvaCore.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$utils$2f$svg$2d$parser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/plan-editor/utils/svg-parser.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/cad.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
// =============================================================================
// Constants
// =============================================================================
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 50;
const ZOOM_SENSITIVITY = 1.1;
const GRID_SIZE_BASE = 1.2; // 1.2m architectural module
function CADCanvas({ projectId, runId, fileName, className }) {
    // Refs
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const stageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Local state
    const [canvasSize, setCanvasSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        width: 800,
        height: 600
    });
    const [elements, setElements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [documentSize, setDocumentSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        width: 100,
        height: 100
    });
    const [gridData, setGridData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        gridX: [],
        gridY: []
    });
    // Store state
    const { viewTransform, setViewTransform, backgroundColor, showGrid, layers, selectedElementIds, selectElement, clearSelection, setHoveredElement, hoveredElementId, measurementActive, measurementPoints, addMeasurementPoint } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useViewerStore"])();
    // ==========================================================================
    // Responsive sizing
    // ==========================================================================
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const updateSize = ()=>{
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCanvasSize({
                    width: rect.width || 800,
                    height: rect.height || 600
                });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return ()=>window.removeEventListener("resize", updateSize);
    }, []);
    // ==========================================================================
    // Load SVG data
    // ==========================================================================
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadSVG = async ()=>{
            try {
                setLoading(true);
                setError(null);
                const url = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getFileUrl(projectId, runId, fileName);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch plan: ${response.statusText}`);
                }
                const svgText = await response.text();
                if (!svgText.includes("<svg")) {
                    throw new Error("Invalid SVG content");
                }
                const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$utils$2f$svg$2d$parser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseSVG"])(svgText);
                setElements(parsed.elements);
                setDocumentSize({
                    width: parsed.width,
                    height: parsed.height
                });
                setGridData({
                    gridX: parsed.gridX,
                    gridY: parsed.gridY
                });
                // Auto-fit view
                if (containerRef.current && parsed.width > 0 && parsed.height > 0) {
                    const containerWidth = containerRef.current.clientWidth;
                    const containerHeight = containerRef.current.clientHeight;
                    const scaleX = containerWidth / parsed.width;
                    const scaleY = containerHeight / parsed.height;
                    const fitScale = Math.min(scaleX, scaleY) * 0.9;
                    setViewTransform({
                        zoom: fitScale,
                        panX: (containerWidth - parsed.width * fitScale) / 2,
                        panY: (containerHeight - parsed.height * fitScale) / 2
                    });
                }
            } catch (err) {
                console.error("Failed to load plan:", err);
                setError(err instanceof Error ? err.message : "Failed to load plan");
            } finally{
                setLoading(false);
            }
        };
        if (projectId && runId && fileName) {
            loadSVG();
        }
    }, [
        projectId,
        runId,
        fileName,
        setViewTransform
    ]);
    // ==========================================================================
    // Event Handlers
    // ==========================================================================
    const handleWheel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.evt.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;
        const oldScale = viewTransform.zoom;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const mousePointTo = {
            x: (pointer.x - viewTransform.panX) / oldScale,
            y: (pointer.y - viewTransform.panY) / oldScale
        };
        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * ZOOM_SENSITIVITY : oldScale / ZOOM_SENSITIVITY;
        const clampedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));
        setViewTransform({
            zoom: clampedScale,
            panX: pointer.x - mousePointTo.x * clampedScale,
            panY: pointer.y - mousePointTo.y * clampedScale
        });
    }, [
        viewTransform,
        setViewTransform
    ]);
    const handleDragEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        if (e.target === stageRef.current) {
            setViewTransform({
                panX: e.target.x(),
                panY: e.target.y()
            });
        }
    }, [
        setViewTransform
    ]);
    const handleStageClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        // If clicking on stage background, clear selection
        if (e.target === stageRef.current) {
            if (measurementActive) {
                const stage = stageRef.current;
                if (stage) {
                    const pointer = stage.getPointerPosition();
                    if (pointer) {
                        const point = {
                            x: (pointer.x - viewTransform.panX) / viewTransform.zoom,
                            y: (pointer.y - viewTransform.panY) / viewTransform.zoom
                        };
                        addMeasurementPoint(point);
                    }
                }
            } else {
                clearSelection();
            }
        }
    }, [
        measurementActive,
        viewTransform,
        addMeasurementPoint,
        clearSelection
    ]);
    const handleElementClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((elementId, e)=>{
        e.cancelBubble = true;
        const isMultiSelect = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        selectElement(elementId, isMultiSelect);
    }, [
        selectElement
    ]);
    const handleElementMouseEnter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((elementId)=>{
        setHoveredElement(elementId);
    }, [
        setHoveredElement
    ]);
    const handleElementMouseLeave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setHoveredElement(null);
    }, [
        setHoveredElement
    ]);
    // ==========================================================================
    // Filter elements by layer visibility
    // ==========================================================================
    const visibleElements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return elements.filter((el)=>{
            const layerState = layers[el.layer];
            return layerState?.visible !== false;
        });
    }, [
        elements,
        layers
    ]);
    // ==========================================================================
    // Render Grid
    // ==========================================================================
    const renderGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!showGrid) return null;
        const lines = [];
        const gridColor = backgroundColor === "dark" ? "#333333" : "#CCCCCC";
        const gridStep = GRID_SIZE_BASE * 10; // 12m major grid
        // Calculate grid bounds
        const startX = Math.floor(-100 / gridStep) * gridStep;
        const endX = Math.ceil((documentSize.width + 100) / gridStep) * gridStep;
        const startY = Math.floor(-100 / gridStep) * gridStep;
        const endY = Math.ceil((documentSize.height + 100) / gridStep) * gridStep;
        // Vertical lines
        for(let x = startX; x <= endX; x += gridStep){
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                points: [
                    x,
                    startY,
                    x,
                    endY
                ],
                stroke: gridColor,
                strokeWidth: 0.5 / viewTransform.zoom,
                opacity: 0.3
            }, `grid-v-${x}`, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 279,
                columnNumber: 9
            }, this));
        }
        // Horizontal lines
        for(let y = startY; y <= endY; y += gridStep){
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                points: [
                    startX,
                    y,
                    endX,
                    y
                ],
                stroke: gridColor,
                strokeWidth: 0.5 / viewTransform.zoom,
                opacity: 0.3
            }, `grid-h-${y}`, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 292,
                columnNumber: 9
            }, this));
        }
        // Structural grid from document
        gridData.gridX.forEach((x, i)=>{
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                points: [
                    x,
                    -50,
                    x,
                    documentSize.height + 50
                ],
                stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].grid,
                strokeWidth: 0.3 / viewTransform.zoom,
                dash: [
                    10 / viewTransform.zoom,
                    5 / viewTransform.zoom
                ],
                opacity: 0.5
            }, `struct-grid-x-${i}`, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 305,
                columnNumber: 9
            }, this));
        });
        gridData.gridY.forEach((y, i)=>{
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                points: [
                    -50,
                    y,
                    documentSize.width + 50,
                    y
                ],
                stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].grid,
                strokeWidth: 0.3 / viewTransform.zoom,
                dash: [
                    10 / viewTransform.zoom,
                    5 / viewTransform.zoom
                ],
                opacity: 0.5
            }, `struct-grid-y-${i}`, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 318,
                columnNumber: 9
            }, this));
        });
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
            children: lines
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
            lineNumber: 329,
            columnNumber: 12
        }, this);
    }, [
        showGrid,
        backgroundColor,
        documentSize,
        gridData,
        viewTransform.zoom
    ]);
    // ==========================================================================
    // Render Element
    // ==========================================================================
    const renderElement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((element)=>{
        const isSelected = selectedElementIds.includes(element.id);
        const isHovered = hoveredElementId === element.id;
        const strokeColor = isSelected ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].selection : isHovered ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].hover : element.strokeColor || "#FFFFFF";
        const strokeWidth = (element.strokeWidth || 1) / viewTransform.zoom * (isSelected ? 1.5 : 1);
        const commonProps = {
            key: element.id,
            onClick: (e)=>handleElementClick(element.id, e),
            onMouseEnter: ()=>handleElementMouseEnter(element.id),
            onMouseLeave: handleElementMouseLeave
        };
        // Render based on element type and geometry
        if (element.points.length === 1) {
            // Single point - render as circle (column, etc.)
            const radius = element.properties.radius || 2;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Circle"], {
                ...commonProps,
                x: element.points[0].x,
                y: element.points[0].y,
                radius: radius,
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                fill: element.fillColor || "transparent"
            }, void 0, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 362,
                columnNumber: 11
            }, this);
        }
        if (element.points.length === 2) {
            // Two points - render as line
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                ...commonProps,
                points: [
                    element.points[0].x,
                    element.points[0].y,
                    element.points[1].x,
                    element.points[1].y
                ],
                stroke: strokeColor,
                strokeWidth: strokeWidth,
                hitStrokeWidth: Math.max(strokeWidth * 3, 5 / viewTransform.zoom)
            }, void 0, false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 377,
                columnNumber: 11
            }, this);
        }
        if (element.points.length === 4 && element.type === "space") {
            // Rectangle (space)
            const minX = Math.min(...element.points.map((p)=>p.x));
            const minY = Math.min(...element.points.map((p)=>p.y));
            const maxX = Math.max(...element.points.map((p)=>p.x));
            const maxY = Math.max(...element.points.map((p)=>p.y));
            const spaceColor = backgroundColor === "dark" ? "rgba(100, 100, 150, 0.1)" : "rgba(200, 200, 220, 0.2)";
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Rect"], {
                        ...commonProps,
                        x: minX,
                        y: minY,
                        width: maxX - minX,
                        height: maxY - minY,
                        stroke: strokeColor,
                        strokeWidth: strokeWidth,
                        fill: isSelected ? "rgba(0, 255, 0, 0.1)" : spaceColor
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 406,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                        x: minX + 5,
                        y: minY + 5,
                        text: element.properties.name || element.id,
                        fontSize: Math.max(8 / viewTransform.zoom, 10),
                        fill: backgroundColor === "dark" ? "#AAAAAA" : "#666666"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 417,
                        columnNumber: 13
                    }, this)
                ]
            }, element.id, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 405,
                columnNumber: 11
            }, this);
        }
        // Polyline/polygon
        const flatPoints = element.points.flatMap((p)=>[
                p.x,
                p.y
            ]);
        const isClosed = element.type === "space" || element.type === "core" || element.fillColor !== "none";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
            ...commonProps,
            points: flatPoints,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            fill: isClosed ? element.fillColor || "transparent" : undefined,
            closed: isClosed,
            hitStrokeWidth: Math.max(strokeWidth * 3, 5 / viewTransform.zoom)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
            lineNumber: 436,
            columnNumber: 9
        }, this);
    }, [
        selectedElementIds,
        hoveredElementId,
        viewTransform.zoom,
        backgroundColor,
        handleElementClick,
        handleElementMouseEnter,
        handleElementMouseLeave
    ]);
    // ==========================================================================
    // Render Measurement
    // ==========================================================================
    const renderMeasurement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!measurementActive || measurementPoints.length === 0) return null;
        const lines = [];
        const points = measurementPoints;
        for(let i = 0; i < points.length - 1; i++){
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                        points: [
                            p1.x,
                            p1.y,
                            p2.x,
                            p2.y
                        ],
                        stroke: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].measurementLine,
                        strokeWidth: 2 / viewTransform.zoom
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 479,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Circle"], {
                        x: p1.x,
                        y: p1.y,
                        radius: 4 / viewTransform.zoom,
                        fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].measurementLine
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 484,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Circle"], {
                        x: p2.x,
                        y: p2.y,
                        radius: 4 / viewTransform.zoom,
                        fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].measurementLine
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 490,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], {
                        x: midX,
                        y: midY - 15 / viewTransform.zoom,
                        text: `${distance.toFixed(2)} m`,
                        fontSize: 14 / viewTransform.zoom,
                        fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].dimension,
                        align: "center"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 496,
                        columnNumber: 11
                    }, this)
                ]
            }, `measure-${i}`, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 478,
                columnNumber: 9
            }, this));
        }
        // Show last point marker
        if (points.length > 0) {
            const lastPoint = points[points.length - 1];
            lines.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Circle"], {
                x: lastPoint.x,
                y: lastPoint.y,
                radius: 4 / viewTransform.zoom,
                fill: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$cad$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CAD_COLORS"].measurementLine
            }, "measure-last", false, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 512,
                columnNumber: 9
            }, this));
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Group"], {
            children: lines
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
            lineNumber: 522,
            columnNumber: 12
        }, this);
    }, [
        measurementActive,
        measurementPoints,
        viewTransform.zoom
    ]);
    // ==========================================================================
    // Loading and Error States
    // ==========================================================================
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 533,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-400",
                        children: "Loading floor plan..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 534,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 532,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
            lineNumber: 531,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-4 text-center max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-red-500 text-5xl",
                        children: "!"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 544,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-semibold text-red-400",
                        children: "Failed to load plan"
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 545,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 546,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 543,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
            lineNumber: 542,
            columnNumber: 7
        }, this);
    }
    // ==========================================================================
    // Render
    // ==========================================================================
    const bgColor = backgroundColor === "dark" ? "#1a1a2e" : "#f5f5f5";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `relative w-full h-full overflow-hidden ${className}`,
        style: {
            backgroundColor: bgColor
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Stage"], {
                ref: stageRef,
                width: canvasSize.width,
                height: canvasSize.height,
                x: viewTransform.panX,
                y: viewTransform.panY,
                scaleX: viewTransform.zoom,
                scaleY: viewTransform.zoom,
                rotation: viewTransform.rotation,
                draggable: true,
                onWheel: handleWheel,
                onDragEnd: handleDragEnd,
                onClick: handleStageClick,
                style: {
                    cursor: measurementActive ? "crosshair" : "grab"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
                        children: renderGrid()
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 580,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
                        children: visibleElements.map(renderElement)
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 583,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$konva$2f$es$2f$ReactKonvaCore$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
                        children: renderMeasurement()
                    }, void 0, false, {
                        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                        lineNumber: 586,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 564,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded text-sm",
                children: [
                    (viewTransform.zoom * 100).toFixed(0),
                    "%"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 590,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-xs font-mono",
                children: [
                    documentSize.width.toFixed(1),
                    " × ",
                    documentSize.height.toFixed(1),
                    " m"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
                lineNumber: 595,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/plan-editor/CADCanvas.tsx",
        lineNumber: 559,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = CADCanvas;
}),
"[project]/src/components/plan-editor/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$SvgCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/plan-editor/SvgCanvas.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$CADCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/plan-editor/CADCanvas.tsx [app-ssr] (ecmascript)");
;
;
}),
"[project]/src/app/project/[id]/plan-editor/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlanEditorPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/panels-top-left.js [app-ssr] (ecmascript) <export default as Layout>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move.js [app-ssr] (ecmascript) <export default as Move>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-ssr] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/door-open.js [app-ssr] (ecmascript) <export default as DoorOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/type.js [app-ssr] (ecmascript) <export default as Type>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eraser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eraser$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eraser.js [app-ssr] (ecmascript) <export default as Eraser>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-ssr] (ecmascript) <export default as Grid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-ssr] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-in.js [app-ssr] (ecmascript) <export default as ZoomIn>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zoom-out.js [app-ssr] (ecmascript) <export default as ZoomOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-ssr] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-ssr] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-ssr] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock-open.js [app-ssr] (ecmascript) <export default as Unlock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/ui/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/plan-editor/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$CADCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/plan-editor/CADCanvas.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$SvgCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/plan-editor/SvgCanvas.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/ui-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$project$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/project-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
// Feature flag for new viewer
const USE_NEW_VIEWER = process.env.NEXT_PUBLIC_USE_NEW_VIEWERS !== "false";
const tools = [
    {
        id: "select",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Move$3e$__["Move"],
        label: "Select",
        labelAr: "تحديد"
    },
    {
        id: "pan",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"],
        label: "Pan",
        labelAr: "تحريك"
    },
    {
        id: "wall",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"],
        label: "Wall",
        labelAr: "جدار"
    },
    {
        id: "door",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$door$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__DoorOpen$3e$__["DoorOpen"],
        label: "Door",
        labelAr: "باب"
    },
    {
        id: "window",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"],
        label: "Window",
        labelAr: "نافذة"
    },
    {
        id: "dimension",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"],
        label: "Dimension",
        labelAr: "بعد"
    },
    {
        id: "text",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$type$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Type$3e$__["Type"],
        label: "Text",
        labelAr: "نص"
    },
    {
        id: "erase",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eraser$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eraser$3e$__["Eraser"],
        label: "Erase",
        labelAr: "مسح"
    }
];
const layerDefinitions = [
    {
        id: "architectural",
        label: "Architectural",
        labelAr: "معماري",
        color: "#FFFFFF"
    },
    {
        id: "structural",
        label: "Structural",
        labelAr: "هيكلي",
        color: "#FF0000"
    },
    {
        id: "mep-hvac",
        label: "MEP - HVAC",
        labelAr: "تكييف",
        color: "#00FFFF"
    },
    {
        id: "mep-electrical",
        label: "MEP - Electrical",
        labelAr: "كهرباء",
        color: "#FF00FF"
    },
    {
        id: "mep-plumbing",
        label: "MEP - Plumbing",
        labelAr: "سباكة",
        color: "#0000FF"
    },
    {
        id: "annotations",
        label: "Annotations",
        labelAr: "تعليقات",
        color: "#00FF00"
    },
    {
        id: "grid",
        label: "Grid",
        labelAr: "شبكة",
        color: "#808080"
    },
    {
        id: "dimensions",
        label: "Dimensions",
        labelAr: "أبعاد",
        color: "#FFFF00"
    }
];
function PlanEditorPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUIStore"])();
    const { project, run, setProject, setRun } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$project$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProjectStore"])();
    const { activeTool, setActiveTool, layers, toggleLayerVisibility, setLayerLocked, backgroundColor, setBackgroundColor, showGrid, toggleGrid, viewTransform, zoomIn, zoomOut, zoomToFit, rotateView, measurementActive, startMeasurement, clearMeasurement, selectedElementIds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const isRtl = language === "ar";
    const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const projectId = projectIdParam ?? "";
    const [planFile, setPlanFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [backendStatus, setBackendStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        available: true,
        message: ""
    });
    // Keyboard shortcuts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (e)=>{
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            switch(e.key.toLowerCase()){
                case "escape":
                    clearMeasurement();
                    break;
                case "v":
                case "1":
                    setActiveTool("select");
                    break;
                case "h":
                case "2":
                    setActiveTool("pan");
                    break;
                case "m":
                    if (measurementActive) {
                        clearMeasurement();
                    } else {
                        startMeasurement();
                    }
                    break;
                case "g":
                    toggleGrid();
                    break;
                case "r":
                    rotateView(90);
                    break;
                case "f":
                    zoomToFit();
                    break;
                case "+":
                case "=":
                    zoomIn();
                    break;
                case "-":
                    zoomOut();
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return ()=>window.removeEventListener("keydown", handleKeyDown);
    }, [
        measurementActive,
        setActiveTool,
        toggleGrid,
        rotateView,
        zoomToFit,
        zoomIn,
        zoomOut,
        startMeasurement,
        clearMeasurement
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadProjectAndRun = async ()=>{
            const status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getBackendStatus();
            setBackendStatus(status);
            const found = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getProject(projectId);
            if (found) {
                setProject(found);
                const latestRun = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getLatestRunForProject(projectId);
                if (latestRun) {
                    setRun(latestRun);
                }
            }
        };
        loadProjectAndRun();
    }, [
        projectId,
        setProject,
        setRun
    ]);
    const handleRetryConnection = async ()=>{
        const connected = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].retryConnection();
        if (connected) {
            window.location.reload();
        } else {
            setBackendStatus(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getBackendStatus());
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadArtifacts = async ()=>{
            if (!run?.id) return;
            try {
                setPlanFile(null);
                const artifacts = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getRunArtifacts(run.id);
                const planArtifact = artifacts.find((a)=>a.kind === "plan" || a.kind === "plan_svg" || a.file_name?.endsWith("_plan.svg"));
                if (planArtifact) {
                    setPlanFile(planArtifact.file_name);
                    return;
                }
                const state = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].getState().catch(()=>null);
                const outputFile = state?.outputs?.plan_svg_file;
                const stateRunId = state?.run?.id ? String(state.run.id) : "";
                const stateProjectId = state?.project?.id ? String(state.project.id) : "";
                if (outputFile && stateRunId && stateProjectId && stateRunId === String(run.id) && stateProjectId === String(project?.id)) {
                    setPlanFile(outputFile);
                }
            } catch (error) {
                console.error("Failed to load artifacts:", error);
            }
        };
        loadArtifacts();
    }, [
        run?.id,
        project?.id
    ]);
    const handleMeasureToggle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (measurementActive) {
            clearMeasurement();
        } else {
            startMeasurement();
        }
    }, [
        measurementActive,
        startMeasurement,
        clearMeasurement
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1",
                                children: project?.name || (isRtl ? "المشروع" : "Project")
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 232,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-[var(--ink)]",
                                children: isRtl ? "محرر المخطط" : "Plan Editor"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 bg-[var(--surface-2)] rounded-lg p-1 border border-[var(--line)]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: zoomOut,
                                        title: "Zoom Out (-)",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomOut$3e$__["ZoomOut"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 245,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 244,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-[var(--ink-soft)] min-w-[50px] text-center",
                                        children: [
                                            (viewTransform.zoom * 100).toFixed(0),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 247,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: zoomIn,
                                        title: "Zoom In (+)",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zoom$2d$in$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ZoomIn$3e$__["ZoomIn"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "ghost",
                                        size: "sm",
                                        onClick: zoomToFit,
                                        title: "Fit View (F)",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 254,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 253,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>rotateView(90),
                                title: "Rotate 90° (R)",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 265,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 259,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: showGrid ? "primary" : "outline",
                                size: "sm",
                                onClick: toggleGrid,
                                title: "Toggle Grid (G)",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__["Grid"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 275,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: measurementActive ? "primary" : "outline",
                                size: "sm",
                                onClick: handleMeasureToggle,
                                title: "Measure Tool (M)",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 279,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>setBackgroundColor(backgroundColor === "dark" ? "light" : "dark"),
                                title: "Toggle Background",
                                children: backgroundColor === "dark" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 296,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 298,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 289,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                        lineNumber: 241,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-[72px_1fr_280px] gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "h-fit",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: tools.map((tool)=>{
                                    const Icon = tool.icon;
                                    const isActive = tool.id === activeTool;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTool(tool.id),
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-12 h-12 rounded-[var(--radius-sm)] border flex items-center justify-center transition-all", isActive ? "bg-[rgba(15,76,129,0.12)] border-[var(--accent)] text-[var(--accent)]" : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)]"),
                                        title: `${isRtl ? tool.labelAr : tool.label}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 325,
                                            columnNumber: 21
                                        }, this)
                                    }, tool.id, false, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 314,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 309,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                            lineNumber: 308,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                        lineNumber: 307,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        className: "min-h-[600px] overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-0 h-full",
                            children: planFile && project?.id && run?.id ? USE_NEW_VIEWER ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$CADCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CADCanvas"], {
                                projectId: project.id,
                                runId: run.id,
                                fileName: planFile,
                                className: "w-full h-[600px]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 338,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$plan$2d$editor$2f$SvgCanvas$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SvgCanvas"], {
                                projectId: project.id,
                                runId: run.id,
                                fileName: planFile,
                                className: "w-full h-[600px] rounded-[var(--radius-md)]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 345,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full h-[600px] rounded-[var(--radius-md)] border border-[var(--line)] relative overflow-hidden", backgroundColor === "dark" ? "bg-[#1a1a2e]" : "bg-[#f8f6f1]"),
                                style: {
                                    backgroundImage: showGrid ? `
                      linear-gradient(0deg, rgba(100,110,125,0.14) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(100,110,125,0.14) 1px, transparent 1px)
                    ` : undefined,
                                    backgroundSize: "24px 24px"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center text-[var(--ink-faint)] max-w-md px-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$panels$2d$top$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layout$3e$__["Layout"], {
                                                className: "w-16 h-16 mx-auto mb-4 opacity-30"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                lineNumber: 371,
                                                columnNumber: 21
                                            }, this),
                                            !backendStatus.available ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-medium text-amber-600",
                                                        children: isRtl ? "الخادم غير متصل" : "Backend Not Connected"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 374,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm mt-2",
                                                        children: isRtl ? "قم بتشغيل الخادم لعرض المخططات المولدة" : "Start the backend server to view generated plans"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 377,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        size: "sm",
                                                        className: "mt-4",
                                                        onClick: handleRetryConnection,
                                                        children: isRtl ? "إعادة المحاولة" : "Retry Connection"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true) : !run?.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-medium",
                                                        children: isRtl ? "لا يوجد تشغيل نشط" : "No Active Run"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 393,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm mt-2",
                                                        children: isRtl ? "انتقل إلى المنظم لبدء التوليد" : "Go to Orchestrator to start generation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 396,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-medium",
                                                        children: isRtl ? "جاري تحميل المخطط..." : "Loading plan..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 404,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm mt-2",
                                                        children: isRtl ? "يرجى الانتظار أثناء تحميل الملفات" : "Please wait while files are loading"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                        lineNumber: 407,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 369,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 353,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                            lineNumber: 335,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                        lineNumber: 334,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-semibold text-[var(--ink)]",
                                                    children: isRtl ? "الطبقات" : "Layers"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                    className: "w-4 h-4 text-[var(--ink-soft)]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 430,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 426,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2 max-h-[300px] overflow-y-auto",
                                            children: layerDefinitions.map((layer)=>{
                                                const layerState = layers[layer.id];
                                                const isVisible = layerState?.visible !== false;
                                                const isLocked = layerState?.locked === true;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border transition-all", isVisible ? "bg-[var(--surface-2)] border-[var(--line)]" : "bg-[var(--bg-2)] border-transparent opacity-60"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>toggleLayerVisibility(layer.id),
                                                            className: "p-1 hover:bg-[var(--bg-2)] rounded",
                                                            title: isVisible ? "Hide Layer" : "Show Layer",
                                                            children: isVisible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                className: "w-4 h-4 text-[var(--ink-soft)]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                                lineNumber: 455,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                                className: "w-4 h-4 text-[var(--ink-faint)]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                                lineNumber: 457,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 449,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setLayerLocked(layer.id, !isLocked),
                                                            className: "p-1 hover:bg-[var(--bg-2)] rounded",
                                                            title: isLocked ? "Unlock Layer" : "Lock Layer",
                                                            children: isLocked ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                                className: "w-4 h-4 text-amber-500"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                                lineNumber: 468,
                                                                columnNumber: 27
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Unlock$3e$__["Unlock"], {
                                                                className: "w-4 h-4 text-[var(--ink-faint)]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                                lineNumber: 470,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 462,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "w-3 h-3 rounded-full border border-white/20",
                                                            style: {
                                                                backgroundColor: layer.color
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 475,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-[var(--ink)] flex-1",
                                                            children: isRtl ? layer.labelAr : layer.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 481,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, layer.id, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 439,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 432,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 425,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 424,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-[var(--ink)] mb-3",
                                            children: isRtl ? "الخصائص" : "Properties"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 494,
                                            columnNumber: 15
                                        }, this),
                                        selectedElementIds.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-[var(--accent)]",
                                                    children: [
                                                        selectedElementIds.length,
                                                        " ",
                                                        isRtl ? `عنصر محدد` : `element${selectedElementIds.length > 1 ? "s" : ""} selected`
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[var(--ink-soft)] space-y-1",
                                                    children: [
                                                        selectedElementIds.slice(0, 5).map((id)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "truncate",
                                                                children: id
                                                            }, id, false, {
                                                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                                lineNumber: 507,
                                                                columnNumber: 23
                                                            }, this)),
                                                        selectedElementIds.length > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[var(--ink-faint)]",
                                                            children: [
                                                                "+",
                                                                selectedElementIds.length - 5,
                                                                " more..."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 512,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 505,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 498,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-[var(--ink-soft)]",
                                            children: isRtl ? "انقر على عنصر لرؤية خصائصه" : "Click an element to view properties"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 519,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 493,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 492,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-[var(--ink)] mb-3 text-sm",
                                            children: isRtl ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 531,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-[var(--ink-soft)] space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "V / 1"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "تحديد" : "Select"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 537,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 535,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "M"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 540,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "قياس" : "Measure"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 541,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 539,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "G"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 544,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "شبكة" : "Grid"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 545,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 543,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "R"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 548,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "تدوير" : "Rotate"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 549,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 547,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "F"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 552,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "ملاءمة" : "Fit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 553,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 551,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "+/-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 556,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "تكبير" : "Zoom"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 557,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 555,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Esc"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 560,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: isRtl ? "إلغاء" : "Cancel"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                            lineNumber: 561,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                                    lineNumber: 559,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                            lineNumber: 534,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                    lineNumber: 530,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                                lineNumber: 529,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                        lineNumber: 422,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/project/[id]/plan-editor/page.tsx",
        lineNumber: 228,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_8fd86bac._.js.map