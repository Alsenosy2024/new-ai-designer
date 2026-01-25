(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/viewer/ModelViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelViewer",
    ()=>ModelViewer,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Grid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Center.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// Performance constants
const TARGET_FPS = 30;
const MAX_PIXEL_RATIO = 1.5;
function Model({ url, onLoad, onError }) {
    _s();
    const { scene } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])(url, true, true, {
        "Model.useGLTF": (loader)=>{
            loader.manager.onLoad = ({
                "Model.useGLTF": ()=>onLoad?.()
            })["Model.useGLTF"];
            loader.manager.onError = ({
                "Model.useGLTF": (url)=>onError?.(new Error(`Failed to load: ${url}`))
            })["Model.useGLTF"];
        }
    }["Model.useGLTF"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Model.useEffect": ()=>{
            if (scene) {
                // Center and scale the model
                const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(scene);
                const center = box.getCenter(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
                const size = box.getSize(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
                // Move model to origin
                scene.position.sub(center);
                // Scale to fit
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 50) {
                    const scale = 50 / maxDim;
                    scene.scale.setScalar(scale);
                }
            }
        }
    }["Model.useEffect"], [
        scene
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
        object: scene
    }, void 0, false, {
        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
        lineNumber: 45,
        columnNumber: 10
    }, this);
}
_s(Model, "N2zR9ZykRX406VVmLIXmzSJYw38=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"]
    ];
});
_c = Model;
function CameraController() {
    _s1();
    const { camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CameraController.useEffect": ()=>{
            camera.position.set(60, 40, 60);
            camera.lookAt(0, 0, 0);
        }
    }["CameraController.useEffect"], [
        camera
    ]);
    return null;
}
_s1(CameraController, "Wo14/kl28HhoRfDX+Cg7MK2EhFU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"]
    ];
});
_c1 = CameraController;
// Frame rate limiter for performance optimization
function FrameLimiter() {
    _s2();
    const lastFrameTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const frameInterval = 1000 / TARGET_FPS;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "FrameLimiter.useFrame": (state)=>{
            const currentTime = state.clock.elapsedTime * 1000;
            if (currentTime - lastFrameTime.current >= frameInterval) {
                lastFrameTime.current = currentTime;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])(); // Request next frame
            }
        }
    }["FrameLimiter.useFrame"]);
    return null;
}
_s2(FrameLimiter, "VFX+uTjvqr7bzccePdYBF4e0P1g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c2 = FrameLimiter;
function LoadingFallback() {
    _s3();
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "LoadingFallback.useFrame": (state)=>{
            if (meshRef.current) {
                meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            }
        }
    }["LoadingFallback.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        ref: meshRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                args: [
                    10,
                    10,
                    10
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                color: "#c7b8a8",
                wireframe: true
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
_s3(LoadingFallback, "/vg1AmA8+P3+Fj0/y210JTVKtL0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c3 = LoadingFallback;
function ModelViewer({ modelUrl, className = "" }) {
    _s4();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const controlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const handleLoad = ()=>{
        setLoading(false);
        setError(null);
    };
    const handleError = (err)=>{
        setLoading(false);
        setError(err.message);
    };
    const resetCamera = ()=>{
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };
    // Pause rendering when tab is not visible
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelViewer.useEffect": ()=>{
            const handleVisibilityChange = {
                "ModelViewer.useEffect.handleVisibilityChange": ()=>{
                    setIsVisible(!document.hidden);
                }
            }["ModelViewer.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "ModelViewer.useEffect": ()=>document.removeEventListener("visibilitychange", handleVisibilityChange)
            })["ModelViewer.useEffect"];
        }
    }["ModelViewer.useEffect"], []);
    if (!modelUrl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full bg-gradient-to-b from-[#e8e4dc] to-[#d4d0c8] ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-[var(--ink-faint)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                        className: "w-16 h-16 mx-auto mb-4 opacity-30"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg font-medium",
                        children: "No model available"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mt-2",
                        children: "Generate a project to view the 3D model"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 134,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 131,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
            lineNumber: 130,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full h-full ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                camera: {
                    position: [
                        60,
                        40,
                        60
                    ],
                    fov: 45
                },
                style: {
                    background: "linear-gradient(to bottom, #e8e4dc, #d4d0c8)"
                },
                frameloop: isVisible ? "demand" : "never",
                dpr: [
                    1,
                    MAX_PIXEL_RATIO
                ],
                gl: {
                    antialias: false,
                    alpha: true,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true
                },
                performance: {
                    min: 0.5
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FrameLimiter, {}, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CameraController, {}, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                        intensity: 0.4
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            50,
                            50,
                            25
                        ],
                        intensity: 0.8,
                        castShadow: true,
                        "shadow-mapSize": [
                            1024,
                            1024
                        ]
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            -30,
                            30,
                            -25
                        ],
                        intensity: 0.3
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingFallback, {}, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                            lineNumber: 170,
                            columnNumber: 29
                        }, void 0),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Center"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Model, {
                                url: modelUrl,
                                onLoad: handleLoad,
                                onError: handleError
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                            lineNumber: 171,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"], {
                        args: [
                            100,
                            100
                        ],
                        position: [
                            0,
                            -0.1,
                            0
                        ],
                        cellSize: 10,
                        cellThickness: 0.5,
                        cellColor: "#c9c0b5",
                        sectionSize: 50,
                        sectionThickness: 1,
                        sectionColor: "#b5aa9d",
                        fadeDistance: 80,
                        fadeStrength: 1.5,
                        followCamera: false
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
                        ref: controlsRef,
                        enableDamping: true,
                        dampingFactor: 0.05,
                        minDistance: 10,
                        maxDistance: 300,
                        maxPolarAngle: Math.PI / 2,
                        target: [
                            0,
                            0,
                            0
                        ]
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 142,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-10 h-10 mx-auto mb-3 animate-spin text-[var(--accent)]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                            lineNumber: 207,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-[var(--ink-soft)]",
                            children: "Loading 3D model..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                            lineNumber: 208,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                    lineNumber: 206,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 205,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-red-600",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                    lineNumber: 216,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 215,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--surface)] rounded-full px-4 py-2 shadow-lg border border-[var(--line)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetCamera,
                        className: "p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors",
                        title: "Reset view",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                            lineNumber: 227,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-[var(--ink-faint)] px-2",
                        children: "Drag to rotate | Scroll to zoom"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 bg-[var(--surface)] rounded-[var(--radius-sm)] px-3 py-1.5 shadow border border-[var(--line)]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-[var(--ink-soft)] font-mono",
                    children: "glTF 2.0"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                    lineNumber: 236,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer.tsx",
        lineNumber: 141,
        columnNumber: 5
    }, this);
}
_s4(ModelViewer, "Q2m17gxrdQu76brq1PblaG5gFnI=");
_c4 = ModelViewer;
const __TURBOPACK__default__export__ = ModelViewer;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "Model");
__turbopack_context__.k.register(_c1, "CameraController");
__turbopack_context__.k.register(_c2, "FrameLimiter");
__turbopack_context__.k.register(_c3, "LoadingFallback");
__turbopack_context__.k.register(_c4, "ModelViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/viewer-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature();
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
const useViewerStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
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
const useActiveTool = ()=>{
    _s();
    return useViewerStore({
        "useActiveTool.useViewerStore": (state)=>state.activeTool
    }["useActiveTool.useViewerStore"]);
};
_s(useActiveTool, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useSelectedElements = ()=>{
    _s1();
    return useViewerStore({
        "useSelectedElements.useViewerStore": (state)=>state.selectedElementIds
    }["useSelectedElements.useViewerStore"]);
};
_s1(useSelectedElements, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useViewTransform = ()=>{
    _s2();
    return useViewerStore({
        "useViewTransform.useViewerStore": (state)=>state.viewTransform
    }["useViewTransform.useViewerStore"]);
};
_s2(useViewTransform, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useLayers = ()=>{
    _s3();
    return useViewerStore({
        "useLayers.useViewerStore": (state)=>state.layers
    }["useLayers.useViewerStore"]);
};
_s3(useLayers, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useBackgroundColor = ()=>{
    _s4();
    return useViewerStore({
        "useBackgroundColor.useViewerStore": (state)=>state.backgroundColor
    }["useBackgroundColor.useViewerStore"]);
};
_s4(useBackgroundColor, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useVisibleFloors = ()=>{
    _s5();
    return useViewerStore({
        "useVisibleFloors.useViewerStore": (state)=>state.visibleFloors
    }["useVisibleFloors.useViewerStore"]);
};
_s5(useVisibleFloors, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useClippingPlanes = ()=>{
    _s6();
    return useViewerStore({
        "useClippingPlanes.useViewerStore": (state)=>state.clippingPlanes
    }["useClippingPlanes.useViewerStore"]);
};
_s6(useClippingPlanes, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useCameraMode = ()=>{
    _s7();
    return useViewerStore({
        "useCameraMode.useViewerStore": (state)=>state.cameraMode
    }["useCameraMode.useViewerStore"]);
};
_s7(useCameraMode, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
const useSelectedObjects = ()=>{
    _s8();
    return useViewerStore({
        "useSelectedObjects.useViewerStore": (state)=>state.selectedObjectIds
    }["useSelectedObjects.useViewerStore"]);
};
_s8(useSelectedObjects, "z9FSrgkgEcfa7F9Uo26l+lTsC2g=", false, function() {
    return [
        useViewerStore
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/viewer/ModelViewer3D.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ModelViewer3D",
    ()=>ModelViewer3D,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export C as useThree>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export m as invalidate>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Grid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Gltf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Center.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$PointerLockControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/PointerLockControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Edges$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Edges.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$Html$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/web/Html.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// =============================================================================
// Constants
// =============================================================================
const TARGET_FPS = 60;
const RENDER_QUALITY_SETTINGS = {
    low: {
        shadowMapSize: 512,
        antialias: false,
        pixelRatio: 1
    },
    medium: {
        shadowMapSize: 1024,
        antialias: true,
        pixelRatio: 1.5
    },
    high: {
        shadowMapSize: 2048,
        antialias: true,
        pixelRatio: 2
    }
};
// =============================================================================
// Helper Components
// =============================================================================
function FrameLimiter() {
    _s();
    const lastFrameTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const frameInterval = 1000 / TARGET_FPS;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "FrameLimiter.useFrame": (state)=>{
            const currentTime = state.clock.elapsedTime * 1000;
            if (currentTime - lastFrameTime.current >= frameInterval) {
                lastFrameTime.current = currentTime;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__m__as__invalidate$3e$__["invalidate"])();
            }
        }
    }["FrameLimiter.useFrame"]);
    return null;
}
_s(FrameLimiter, "VFX+uTjvqr7bzccePdYBF4e0P1g=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = FrameLimiter;
// Loading spinner for 3D view
function LoadingSpinner() {
    _s1();
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "LoadingSpinner.useFrame": (state)=>{
            if (meshRef.current) {
                meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            }
        }
    }["LoadingSpinner.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
        ref: meshRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                args: [
                    8,
                    8,
                    8
                ]
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                color: "#c7b8a8",
                wireframe: true
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 84,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 82,
        columnNumber: 5
    }, this);
}
_s1(LoadingSpinner, "/vg1AmA8+P3+Fj0/y210JTVKtL0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c1 = LoadingSpinner;
function ClippingPlanesManager({ enabled }) {
    _s2();
    const { gl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const { clippingPlanes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const rendererRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClippingPlanesManager.useEffect": ()=>{
            rendererRef.current = gl;
        }
    }["ClippingPlanesManager.useEffect"], [
        gl
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClippingPlanesManager.useEffect": ()=>{
            const renderer = rendererRef.current;
            if (!renderer) return;
            if (!enabled || clippingPlanes.length === 0) {
                renderer.clippingPlanes = [];
                renderer.localClippingEnabled = false;
                return;
            }
            const planes = clippingPlanes.filter({
                "ClippingPlanesManager.useEffect.planes": (p)=>p.enabled
            }["ClippingPlanesManager.useEffect.planes"]).map({
                "ClippingPlanesManager.useEffect.planes": (p)=>{
                    const normal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](p.normal.x, p.normal.y, p.normal.z);
                    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Plane"](normal, p.constant);
                }
            }["ClippingPlanesManager.useEffect.planes"]);
            renderer.clippingPlanes = planes;
            renderer.localClippingEnabled = true;
            return ({
                "ClippingPlanesManager.useEffect": ()=>{
                    const current = rendererRef.current;
                    if (current) {
                        current.clippingPlanes = [];
                    }
                }
            })["ClippingPlanesManager.useEffect"];
        }
    }["ClippingPlanesManager.useEffect"], [
        clippingPlanes,
        enabled
    ]);
    return null;
}
_s2(ClippingPlanesManager, "pF2rgMczPUQLwmqMHso4kR9doL0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c2 = ClippingPlanesManager;
function SelectionOutline({ objects }) {
    if (objects.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: objects.map((obj, idx)=>{
            if (!(obj instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"])) return null;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                geometry: obj.geometry,
                position: obj.position,
                rotation: obj.rotation,
                scale: obj.scale,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#00aaff",
                        transparent: true,
                        opacity: 0.3,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 154,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Edges$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Edges"], {
                        threshold: 15,
                        color: "#00aaff",
                        lineWidth: 2
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 155,
                        columnNumber: 13
                    }, this)
                ]
            }, idx, true, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 153,
                columnNumber: 11
            }, this);
        })
    }, void 0, false);
}
_c3 = SelectionOutline;
function MeasurementLine3D({ points, unit }) {
    if (points.length < 2) return null;
    const linePoints = points.map((p)=>[
            p.x,
            p.y,
            p.z
        ]);
    // Calculate total distance
    let totalDistance = 0;
    for(let i = 0; i < points.length - 1; i++){
        totalDistance += points[i].distanceTo(points[i + 1]);
    }
    const midpoint = points.length >= 2 ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]().lerpVectors(points[0], points[points.length - 1], 0.5) : points[0];
    const formatDistance = (d)=>{
        switch(unit){
            case "mm":
                return `${(d * 1000).toFixed(0)} mm`;
            case "ft":
                return `${(d * 3.28084).toFixed(2)} ft`;
            default:
                return `${d.toFixed(2)} m`;
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                points: linePoints,
                color: "#ffaa00",
                lineWidth: 3
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            points.map((p, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    position: p,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                            args: [
                                0.2,
                                16,
                                16
                            ]
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                            color: "#ffaa00"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 205,
                            columnNumber: 11
                        }, this)
                    ]
                }, i, true, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$Html$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Html"], {
                position: [
                    midpoint.x,
                    midpoint.y + 1,
                    midpoint.z
                ],
                center: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-amber-500 text-white px-2 py-1 rounded text-sm font-mono shadow-lg whitespace-nowrap",
                    children: formatDistance(totalDistance)
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 210,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 199,
        columnNumber: 5
    }, this);
}
_c4 = MeasurementLine3D;
function FirstPersonMode({ enabled, speed = 0.5 }) {
    _s3();
    const { camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const controlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const moveState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FirstPersonMode.useEffect": ()=>{
            if (!enabled) return;
            const handleKeyDown = {
                "FirstPersonMode.useEffect.handleKeyDown": (e)=>{
                    switch(e.code){
                        case "KeyW":
                        case "ArrowUp":
                            moveState.current.forward = true;
                            break;
                        case "KeyS":
                        case "ArrowDown":
                            moveState.current.backward = true;
                            break;
                        case "KeyA":
                        case "ArrowLeft":
                            moveState.current.left = true;
                            break;
                        case "KeyD":
                        case "ArrowRight":
                            moveState.current.right = true;
                            break;
                        case "Space":
                            moveState.current.up = true;
                            break;
                        case "ShiftLeft":
                        case "ShiftRight":
                            moveState.current.down = true;
                            break;
                    }
                }
            }["FirstPersonMode.useEffect.handleKeyDown"];
            const handleKeyUp = {
                "FirstPersonMode.useEffect.handleKeyUp": (e)=>{
                    switch(e.code){
                        case "KeyW":
                        case "ArrowUp":
                            moveState.current.forward = false;
                            break;
                        case "KeyS":
                        case "ArrowDown":
                            moveState.current.backward = false;
                            break;
                        case "KeyA":
                        case "ArrowLeft":
                            moveState.current.left = false;
                            break;
                        case "KeyD":
                        case "ArrowRight":
                            moveState.current.right = false;
                            break;
                        case "Space":
                            moveState.current.up = false;
                            break;
                        case "ShiftLeft":
                        case "ShiftRight":
                            moveState.current.down = false;
                            break;
                    }
                }
            }["FirstPersonMode.useEffect.handleKeyUp"];
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);
            return ({
                "FirstPersonMode.useEffect": ()=>{
                    window.removeEventListener("keydown", handleKeyDown);
                    window.removeEventListener("keyup", handleKeyUp);
                    moveState.current = {
                        forward: false,
                        backward: false,
                        left: false,
                        right: false,
                        up: false,
                        down: false
                    };
                }
            })["FirstPersonMode.useEffect"];
        }
    }["FirstPersonMode.useEffect"], [
        enabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "FirstPersonMode.useFrame": (_, delta)=>{
            if (!enabled) return;
            const direction = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]();
            const frontVector = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
            const sideVector = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](Number(moveState.current.left) - Number(moveState.current.right), 0, 0);
            const upVector = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, Number(moveState.current.up) - Number(moveState.current.down), 0);
            direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed * delta * 60).applyEuler(camera.rotation);
            direction.add(upVector.multiplyScalar(speed * delta * 60));
            camera.position.add(direction);
        }
    }["FirstPersonMode.useFrame"]);
    if (!enabled) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$PointerLockControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PointerLockControls"], {
        ref: controlsRef
    }, void 0, false, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 336,
        columnNumber: 10
    }, this);
}
_s3(FirstPersonMode, "un6rifdPBnmH1ycFEcexb3CrHYE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c5 = FirstPersonMode;
function SceneContent({ modelUrl, onLoad, onError }) {
    _s4();
    const { scene: gltfScene } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"])(modelUrl, true, true, {
        "SceneContent.useGLTF": (loader)=>{
            loader.manager.onLoad = ({
                "SceneContent.useGLTF": ()=>onLoad?.()
            })["SceneContent.useGLTF"];
            loader.manager.onError = ({
                "SceneContent.useGLTF": (url)=>onError?.(new Error(`Failed to load: ${url}`))
            })["SceneContent.useGLTF"];
        }
    }["SceneContent.useGLTF"]);
    const { raycaster, pointer, camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const { visibleFloors, setTotalFloors, explodedView, explodeDistance, selectedObjectIds, selectObject, setHoveredObject, clearObjectSelection, measurement3DActive, measurement3DPoints, addMeasurement3DPoint, measurementUnit } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const floorDataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const visibleFloorsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(visibleFloors);
    const explodedViewRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(explodedView);
    const explodeDistanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(explodeDistance);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SceneContent.useEffect": ()=>{
            visibleFloorsRef.current = visibleFloors;
            explodedViewRef.current = explodedView;
            explodeDistanceRef.current = explodeDistance;
        }
    }["SceneContent.useEffect"], [
        visibleFloors,
        explodedView,
        explodeDistance
    ]);
    const applyFloorVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SceneContent.useCallback[applyFloorVisibility]": ()=>{
            const floorData = floorDataRef.current;
            if (!floorData.length) return;
            const activeFloors = visibleFloorsRef.current;
            const isExploded = explodedViewRef.current;
            const explodeDistanceValue = explodeDistanceRef.current;
            floorData.forEach({
                "SceneContent.useCallback[applyFloorVisibility]": (floor)=>{
                    const isVisible = activeFloors.includes(floor.index);
                    floor.meshes.forEach({
                        "SceneContent.useCallback[applyFloorVisibility]": (mesh)=>{
                            mesh.visible = isVisible;
                            if (isExploded && isVisible) {
                                mesh.position.y = mesh.userData.originalY ?? mesh.position.y;
                                if (mesh.userData.originalY === undefined) {
                                    mesh.userData.originalY = mesh.position.y;
                                }
                                mesh.position.y += floor.index * explodeDistanceValue;
                            } else if (mesh.userData.originalY !== undefined) {
                                mesh.position.y = mesh.userData.originalY;
                            }
                        }
                    }["SceneContent.useCallback[applyFloorVisibility]"]);
                }
            }["SceneContent.useCallback[applyFloorVisibility]"]);
        }
    }["SceneContent.useCallback[applyFloorVisibility]"], []);
    // Analyze model and detect floors
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SceneContent.useEffect": ()=>{
            if (!gltfScene) return;
            // Center and scale the model
            const box = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(gltfScene);
            const center = box.getCenter(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
            const size = box.getSize(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"]());
            gltfScene.position.sub(center);
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 50) {
                const scale = 50 / maxDim;
                gltfScene.scale.setScalar(scale);
            }
            // Detect floors based on Y position
            const meshes = [];
            gltfScene.traverse({
                "SceneContent.useEffect": (child)=>{
                    if (child instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"]) {
                        meshes.push(child);
                        // Enable clipping for each mesh
                        if (child.material instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Material"]) {
                            child.material.clippingPlanes = [];
                            child.material.clipShadows = true;
                        }
                        // Assign unique userData for selection
                        child.userData.selectableId = child.uuid;
                    }
                }
            }["SceneContent.useEffect"]);
            if (meshes.length === 0) return;
            // Calculate bounding boxes for floor detection
            const yPositions = meshes.map({
                "SceneContent.useEffect.yPositions": (m)=>{
                    const meshBox = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(m);
                    return {
                        mesh: m,
                        minY: meshBox.min.y,
                        maxY: meshBox.max.y
                    };
                }
            }["SceneContent.useEffect.yPositions"]);
            // Sort by Y position and group into floors
            yPositions.sort({
                "SceneContent.useEffect": (a, b)=>a.minY - b.minY
            }["SceneContent.useEffect"]);
            // Simple floor detection: divide height into equal sections
            const totalHeight = Math.max(...yPositions.map({
                "SceneContent.useEffect": (p)=>p.maxY
            }["SceneContent.useEffect"])) - Math.min(...yPositions.map({
                "SceneContent.useEffect": (p)=>p.minY
            }["SceneContent.useEffect"]));
            const estimatedFloorHeight = 3; // meters (scaled)
            const estimatedFloors = Math.max(1, Math.round(totalHeight / estimatedFloorHeight));
            const detectedFloors = [];
            const floorHeight = totalHeight / estimatedFloors;
            const baseY = Math.min(...yPositions.map({
                "SceneContent.useEffect.baseY": (p)=>p.minY
            }["SceneContent.useEffect.baseY"]));
            for(let i = 0; i < estimatedFloors; i++){
                const floorMinY = baseY + i * floorHeight;
                const floorMaxY = baseY + (i + 1) * floorHeight;
                const floorMeshes = meshes.filter({
                    "SceneContent.useEffect.floorMeshes": (m)=>{
                        const meshBox = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Box3"]().setFromObject(m);
                        const meshCenterY = (meshBox.min.y + meshBox.max.y) / 2;
                        return meshCenterY >= floorMinY && meshCenterY < floorMaxY;
                    }
                }["SceneContent.useEffect.floorMeshes"]);
                if (floorMeshes.length > 0) {
                    detectedFloors.push({
                        index: i,
                        meshes: floorMeshes,
                        minY: floorMinY,
                        maxY: floorMaxY
                    });
                }
            }
            floorDataRef.current = detectedFloors;
            setTotalFloors(detectedFloors.length || 1);
            applyFloorVisibility();
        }
    }["SceneContent.useEffect"], [
        gltfScene,
        setTotalFloors,
        applyFloorVisibility
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SceneContent.useEffect": ()=>{
            applyFloorVisibility();
        }
    }["SceneContent.useEffect"], [
        applyFloorVisibility,
        visibleFloors,
        explodedView,
        explodeDistance
    ]);
    const selectedMeshes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SceneContent.useMemo[selectedMeshes]": ()=>{
            if (!gltfScene) return [];
            const selected = [];
            gltfScene.traverse({
                "SceneContent.useMemo[selectedMeshes]": (child)=>{
                    if (child instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Mesh"] && selectedObjectIds.includes(child.userData.selectableId)) {
                        selected.push(child);
                    }
                }
            }["SceneContent.useMemo[selectedMeshes]"]);
            return selected;
        }
    }["SceneContent.useMemo[selectedMeshes]"], [
        gltfScene,
        selectedObjectIds
    ]);
    // Click handler for selection and measurement
    const handleClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SceneContent.useCallback[handleClick]": (event)=>{
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(gltfScene.children, true);
            if (intersects.length > 0) {
                const hit = intersects[0];
                if (measurement3DActive) {
                    // Add measurement point
                    addMeasurement3DPoint({
                        x: hit.point.x,
                        y: hit.point.y,
                        z: hit.point.z
                    });
                } else {
                    // Object selection
                    const mesh = hit.object;
                    if (mesh.userData.selectableId) {
                        selectObject(mesh.userData.selectableId, event.shiftKey ?? false);
                    }
                }
            } else if (!measurement3DActive) {
                clearObjectSelection();
            }
        }
    }["SceneContent.useCallback[handleClick]"], [
        raycaster,
        pointer,
        camera,
        gltfScene,
        measurement3DActive,
        addMeasurement3DPoint,
        selectObject,
        clearObjectSelection
    ]);
    // Pointer move for hover effect
    const handlePointerMove = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SceneContent.useCallback[handlePointerMove]": ()=>{
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(gltfScene.children, true);
            if (intersects.length > 0) {
                const mesh = intersects[0].object;
                if (mesh.userData.selectableId) {
                    setHoveredObject(mesh.userData.selectableId);
                }
            } else {
                setHoveredObject(null);
            }
        }
    }["SceneContent.useCallback[handlePointerMove]"], [
        raycaster,
        pointer,
        camera,
        gltfScene,
        setHoveredObject
    ]);
    // Measurement points as THREE.Vector3
    const measurementVector3Points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SceneContent.useMemo[measurementVector3Points]": ()=>{
            return measurement3DPoints.map({
                "SceneContent.useMemo[measurementVector3Points]": (p)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](p.x, p.y, p.z)
            }["SceneContent.useMemo[measurementVector3Points]"]);
        }
    }["SceneContent.useMemo[measurementVector3Points]"], [
        measurement3DPoints
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        onClick: handleClick,
        onPointerMove: handlePointerMove,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Center$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Center"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("primitive", {
                    object: gltfScene
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 552,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 551,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectionOutline, {
                objects: selectedMeshes
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 554,
                columnNumber: 7
            }, this),
            measurement3DActive && measurement3DPoints.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MeasurementLine3D, {
                points: measurementVector3Points,
                unit: measurementUnit
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 556,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 550,
        columnNumber: 5
    }, this);
}
_s4(SceneContent, "Gdxft/jXz6LEgF0KI1a1Kn2ReVg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Gltf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGLTF"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c6 = SceneContent;
function ControlsWrapper({ cameraMode, controlsRef }) {
    _s5();
    const { camera } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"])();
    const { cameraPosition, cameraTarget, setCameraPosition, setCameraTarget } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    // Apply camera position from store
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ControlsWrapper.useEffect": ()=>{
            const target = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](cameraTarget.x, cameraTarget.y, cameraTarget.z);
            const distance = Math.max(camera.position.distanceTo(target), 10);
            if (cameraMode === "firstPerson") {
                camera.up.set(0, 1, 0);
                return;
            }
            if (cameraMode === "orbit") {
                camera.up.set(0, 1, 0);
                camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            } else if (cameraMode === "plan") {
                camera.up.set(0, 0, -1);
                camera.position.set(target.x, target.y + distance, target.z);
            } else if (cameraMode === "elevation") {
                camera.up.set(0, 1, 0);
                camera.position.set(target.x, target.y + distance * 0.2, target.z + distance);
            }
            if (controlsRef.current) {
                controlsRef.current.target.set(target.x, target.y, target.z);
                controlsRef.current.update();
            }
            camera.lookAt(target);
            camera.updateProjectionMatrix();
        }
    }["ControlsWrapper.useEffect"], [
        camera,
        cameraMode,
        cameraPosition,
        cameraTarget,
        controlsRef
    ]);
    if (cameraMode === "firstPerson") return null;
    const lockRotation = cameraMode === "plan" || cameraMode === "elevation";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
        ref: controlsRef,
        enableDamping: true,
        dampingFactor: 0.05,
        minDistance: 5,
        maxDistance: 500,
        enableRotate: !lockRotation,
        minPolarAngle: cameraMode === "plan" ? Math.PI / 2 : 0,
        maxPolarAngle: cameraMode === "plan" ? Math.PI / 2 : Math.PI * 0.9,
        target: [
            cameraTarget.x,
            cameraTarget.y,
            cameraTarget.z
        ],
        onChange: ()=>{
            if (cameraMode !== "orbit") return;
            if (!controlsRef.current) return;
            const pos = camera.position;
            const target = controlsRef.current.target;
            setCameraPosition({
                x: pos.x,
                y: pos.y,
                z: pos.z
            });
            setCameraTarget({
                x: target.x,
                y: target.y,
                z: target.z
            });
        }
    }, void 0, false, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 610,
        columnNumber: 5
    }, this);
}
_s5(ControlsWrapper, "RPLN+9AstjcdjkcBZiH6uU9JxI8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__C__as__useThree$3e$__["useThree"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c7 = ControlsWrapper;
function ModelViewer3D({ modelUrl, className = "", onLoad, onError }) {
    _s6();
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const controlsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { cameraMode, renderQuality, showShadows, clippingPlanes, measurement3DActive, setCameraMode } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const qualitySettings = RENDER_QUALITY_SETTINGS[renderQuality];
    const handleLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ModelViewer3D.useCallback[handleLoad]": ()=>{
            setLoading(false);
            setError(null);
            onLoad?.();
        }
    }["ModelViewer3D.useCallback[handleLoad]"], [
        onLoad
    ]);
    const handleError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ModelViewer3D.useCallback[handleError]": (err)=>{
            setLoading(false);
            setError(err.message);
            onError?.(err);
        }
    }["ModelViewer3D.useCallback[handleError]"], [
        onError
    ]);
    // Pause rendering when tab is not visible
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelViewer3D.useEffect": ()=>{
            const handleVisibilityChange = {
                "ModelViewer3D.useEffect.handleVisibilityChange": ()=>{
                    setIsVisible(!document.hidden);
                }
            }["ModelViewer3D.useEffect.handleVisibilityChange"];
            document.addEventListener("visibilitychange", handleVisibilityChange);
            return ({
                "ModelViewer3D.useEffect": ()=>document.removeEventListener("visibilitychange", handleVisibilityChange)
            })["ModelViewer3D.useEffect"];
        }
    }["ModelViewer3D.useEffect"], []);
    // Handle escape key for first person mode
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelViewer3D.useEffect": ()=>{
            const handleKeyDown = {
                "ModelViewer3D.useEffect.handleKeyDown": (e)=>{
                    if (e.key === "Escape" && cameraMode === "firstPerson") {
                        setCameraMode("orbit");
                    }
                }
            }["ModelViewer3D.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "ModelViewer3D.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["ModelViewer3D.useEffect"];
        }
    }["ModelViewer3D.useEffect"], [
        cameraMode,
        setCameraMode
    ]);
    if (!modelUrl) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center justify-center h-full bg-gradient-to-b from-slate-900 to-slate-800 ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-slate-400",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 mx-auto mb-4 opacity-30 border-2 border-dashed border-slate-500 rounded-lg flex items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-2xl",
                            children: "3D"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 694,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 693,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg font-medium",
                        children: "No model available"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 696,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mt-2",
                        children: "Generate a project to view the 3D model"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 697,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 692,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
            lineNumber: 691,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative w-full h-full ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                ref: canvasRef,
                camera: {
                    position: [
                        60,
                        40,
                        60
                    ],
                    fov: 50
                },
                style: {
                    background: "linear-gradient(to bottom, #1a1a2e, #16213e)"
                },
                frameloop: isVisible ? "always" : "never",
                dpr: [
                    1,
                    qualitySettings.pixelRatio
                ],
                shadows: showShadows,
                gl: {
                    antialias: qualitySettings.antialias,
                    alpha: false,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true,
                    localClippingEnabled: true
                },
                performance: {
                    min: 0.5
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FrameLimiter, {}, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 722,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ClippingPlanesManager, {
                        enabled: clippingPlanes.length > 0
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 723,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                        intensity: 0.5
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 726,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            50,
                            100,
                            50
                        ],
                        intensity: 1,
                        castShadow: showShadows,
                        "shadow-mapSize": [
                            qualitySettings.shadowMapSize,
                            qualitySettings.shadowMapSize
                        ],
                        "shadow-camera-far": 200,
                        "shadow-camera-left": -50,
                        "shadow-camera-right": 50,
                        "shadow-camera-top": 50,
                        "shadow-camera-bottom": -50
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 727,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                        position: [
                            -30,
                            50,
                            -30
                        ],
                        intensity: 0.4
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 738,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hemisphereLight", {
                        intensity: 0.3,
                        groundColor: "#1a1a2e"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 739,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LoadingSpinner, {}, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 742,
                            columnNumber: 29
                        }, void 0),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SceneContent, {
                            modelUrl: modelUrl,
                            onLoad: handleLoad,
                            onError: handleError
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 743,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 742,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Grid"], {
                        args: [
                            200,
                            200
                        ],
                        position: [
                            0,
                            -0.1,
                            0
                        ],
                        cellSize: 5,
                        cellThickness: 0.5,
                        cellColor: "#334155",
                        sectionSize: 25,
                        sectionThickness: 1,
                        sectionColor: "#475569",
                        fadeDistance: 150,
                        fadeStrength: 1.5,
                        followCamera: false
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 747,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ControlsWrapper, {
                        cameraMode: cameraMode,
                        controlsRef: controlsRef
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 762,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FirstPersonMode, {
                        enabled: cameraMode === "firstPerson",
                        speed: 0.3
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 763,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 705,
                columnNumber: 7
            }, this),
            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-10 h-10 mx-auto mb-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 770,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-300",
                            children: "Loading 3D model..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                            lineNumber: 771,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 769,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 768,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 right-4 bg-red-900/80 border border-red-500 rounded-lg p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-red-200",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 779,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 778,
                columnNumber: 9
            }, this),
            cameraMode === "firstPerson" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-medium",
                        children: "Walkthrough Mode:"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                        lineNumber: 786,
                        columnNumber: 11
                    }, this),
                    " WASD to move, Mouse to look, Space/Shift for up/down, ESC to exit"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 785,
                columnNumber: 9
            }, this),
            measurement3DActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 bg-amber-500/90 backdrop-blur rounded-lg px-3 py-2 text-sm text-white font-medium",
                children: "Measurement Mode: Click points to measure distance"
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 792,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 bg-slate-800/80 backdrop-blur rounded px-3 py-1.5 shadow border border-slate-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-slate-300 font-mono",
                    children: "glTF 2.0"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                    lineNumber: 799,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
                lineNumber: 798,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/ModelViewer3D.tsx",
        lineNumber: 704,
        columnNumber: 5
    }, this);
}
_s6(ModelViewer3D, "3cAD6/H/2bGxF6oSjY0sTIDgxuk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c8 = ModelViewer3D;
const __TURBOPACK__default__export__ = ModelViewer3D;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "FrameLimiter");
__turbopack_context__.k.register(_c1, "LoadingSpinner");
__turbopack_context__.k.register(_c2, "ClippingPlanesManager");
__turbopack_context__.k.register(_c3, "SelectionOutline");
__turbopack_context__.k.register(_c4, "MeasurementLine3D");
__turbopack_context__.k.register(_c5, "FirstPersonMode");
__turbopack_context__.k.register(_c6, "SceneContent");
__turbopack_context__.k.register(_c7, "ControlsWrapper");
__turbopack_context__.k.register(_c8, "ModelViewer3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/viewer/FloorManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FloorManager",
    ()=>FloorManager,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$split$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SplitSquareVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-split-vertical.js [app-client] (ecmascript) <export default as SplitSquareVertical>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function FloorManager({ className = "", isRtl = false }) {
    _s();
    const { totalFloors, visibleFloors, explodedView, explodeDistance, toggleFloorVisibility, showAllFloors, hideAllFloors, isolateFloor, toggleExplodedView, setExplodeDistance } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    if (totalFloors <= 1) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `bg-slate-800/90 backdrop-blur rounded-lg p-2 ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-400 text-center px-2",
                children: isRtl ? "طابق واحد" : "Single floor"
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/viewer/FloorManager.tsx",
            lineNumber: 27,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-xl border border-slate-700 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2 px-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                className: "w-4 h-4 text-slate-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-slate-300",
                                children: isRtl ? "الطوابق" : "Floors"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: showAllFloors,
                                className: "p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors",
                                title: isRtl ? "عرض الكل" : "Show all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                    lineNumber: 51,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 46,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: hideAllFloors,
                                className: "p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors",
                                title: isRtl ? "إخفاء الكل" : "Hide all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1",
                children: Array.from({
                    length: totalFloors
                }, (_, i)=>{
                    const floorNum = totalFloors - 1 - i; // Display from top to bottom
                    const isVisible = visibleFloors.includes(floorNum);
                    const isIsolated = visibleFloors.length === 1 && visibleFloors[0] === floorNum;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isVisible ? "bg-slate-700/50" : "bg-transparent"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>toggleFloorVisibility(floorNum),
                                className: `w-6 h-6 rounded flex items-center justify-center transition-colors ${isVisible ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`,
                                children: isVisible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                    lineNumber: 87,
                                    columnNumber: 19
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                    lineNumber: 89,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 78,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `flex-1 text-sm font-medium ${isVisible ? "text-slate-200" : "text-slate-500"}`,
                                children: isRtl ? `طابق ${floorNum + 1}` : `Floor ${floorNum + 1}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 94,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>isolateFloor(floorNum),
                                className: `px-1.5 py-0.5 text-xs rounded transition-colors ${isIsolated ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700"}`,
                                title: isRtl ? "عزل" : "Solo",
                                children: "S"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 103,
                                columnNumber: 15
                            }, this)
                        ]
                    }, floorNum, true, {
                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                        lineNumber: 71,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 pt-2 border-t border-slate-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleExplodedView,
                        className: `w-full flex items-center justify-between px-2 py-1.5 rounded transition-colors ${explodedView ? "bg-blue-600/30 text-blue-300" : "hover:bg-slate-700 text-slate-400"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$split$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__SplitSquareVertical$3e$__["SplitSquareVertical"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-medium",
                                        children: isRtl ? "عرض منفصل" : "Exploded View"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                        lineNumber: 129,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-8 h-4 rounded-full transition-colors ${explodedView ? "bg-blue-600" : "bg-slate-600"}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${explodedView ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    explodedView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 px-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between text-xs text-slate-400 mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: isRtl ? "المسافة" : "Distance"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            explodeDistance.toFixed(1),
                                            "m"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "range",
                                min: "1",
                                max: "15",
                                step: "0.5",
                                value: explodeDistance,
                                onChange: (e)=>setExplodeDistance(parseFloat(e.target.value)),
                                className: "w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/FloorManager.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/FloorManager.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/FloorManager.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_s(FloorManager, "waFWJaseB4m/mvlHy305ZJCN/Dc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c = FloorManager;
const __TURBOPACK__default__export__ = FloorManager;
var _c;
__turbopack_context__.k.register(_c, "FloorManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/viewer/SectionPlanePanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SectionPlanePanel",
    ()=>SectionPlanePanel,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/scissors.js [app-client] (ecmascript) <export default as Scissors>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const PRESET_PLANES = [
    {
        name: "Top",
        normal: {
            x: 0,
            y: -1,
            z: 0
        },
        nameAr: "أعلى"
    },
    {
        name: "Bottom",
        normal: {
            x: 0,
            y: 1,
            z: 0
        },
        nameAr: "أسفل"
    },
    {
        name: "Front",
        normal: {
            x: 0,
            y: 0,
            z: -1
        },
        nameAr: "أمام"
    },
    {
        name: "Back",
        normal: {
            x: 0,
            y: 0,
            z: 1
        },
        nameAr: "خلف"
    },
    {
        name: "Left",
        normal: {
            x: 1,
            y: 0,
            z: 0
        },
        nameAr: "يسار"
    },
    {
        name: "Right",
        normal: {
            x: -1,
            y: 0,
            z: 0
        },
        nameAr: "يمين"
    }
];
function SectionPlanePanel({ className = "", isRtl = false }) {
    _s();
    const { clippingPlanes, activeClippingPlaneId, addClippingPlane, removeClippingPlane, toggleClippingPlane, setActiveClippingPlane, updateClippingPlane, clearAllClippingPlanes } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const [showPresets, setShowPresets] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const planeIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const handleAddPreset = (preset)=>{
        planeIdRef.current += 1;
        const id = `plane-${planeIdRef.current}`;
        const newPlane = {
            id,
            name: isRtl ? preset.nameAr : preset.name,
            normal: preset.normal,
            constant: 0,
            enabled: true
        };
        addClippingPlane(newPlane);
        setActiveClippingPlane(id);
        setShowPresets(false);
    };
    const handleDistanceChange = (id, constant)=>{
        updateClippingPlane(id, {
            constant
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `bg-slate-800/90 backdrop-blur rounded-lg p-2 shadow-xl border border-slate-700 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-2 px-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$scissors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Scissors$3e$__["Scissors"], {
                                className: "w-4 h-4 text-slate-400"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-medium text-slate-300",
                                children: isRtl ? "قطع المقاطع" : "Section Cuts"
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowPresets(!showPresets),
                                className: "p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-colors",
                                title: isRtl ? "إضافة قطع" : "Add section",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            clippingPlanes.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: clearAllClippingPlanes,
                                className: "p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors",
                                title: isRtl ? "مسح الكل" : "Clear all",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                    lineNumber: 80,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 75,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            showPresets && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-2 grid grid-cols-3 gap-1",
                children: PRESET_PLANES.map((preset)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>handleAddPreset(preset),
                        className: "px-2 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors",
                        children: isRtl ? preset.nameAr : preset.name
                    }, preset.name, false, {
                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                        lineNumber: 90,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this),
            clippingPlanes.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-500 text-center py-3",
                children: isRtl ? "لا توجد مقاطع" : "No section planes"
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                lineNumber: 103,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: clippingPlanes.map((plane)=>{
                    const isActive = activeClippingPlaneId === plane.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `rounded p-2 transition-colors ${isActive ? "bg-slate-700/70 ring-1 ring-blue-500" : "bg-slate-700/30"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveClippingPlane(isActive ? null : plane.id),
                                        className: `text-xs font-medium transition-colors ${plane.enabled ? "text-slate-200" : "text-slate-500"}`,
                                        children: plane.name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                        lineNumber: 120,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>toggleClippingPlane(plane.id),
                                                className: `p-1 rounded transition-colors ${plane.enabled ? "text-blue-400 hover:bg-slate-600" : "text-slate-500 hover:bg-slate-600"}`,
                                                title: plane.enabled ? isRtl ? "إخفاء" : "Hide" : isRtl ? "عرض" : "Show",
                                                children: plane.enabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 25
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                                lineNumber: 131,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>removeClippingPlane(plane.id),
                                                className: "p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-600 transition-colors",
                                                title: isRtl ? "حذف" : "Remove",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                                    lineNumber: 153,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                                lineNumber: 148,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                        lineNumber: 129,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 118,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "range",
                                        min: "-50",
                                        max: "50",
                                        step: "0.5",
                                        value: plane.constant,
                                        onChange: (e)=>handleDistanceChange(plane.id, parseFloat(e.target.value)),
                                        className: "flex-1 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer",
                                        disabled: !plane.enabled
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                        lineNumber: 160,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400 w-10 text-right font-mono",
                                        children: plane.constant.toFixed(1)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                        lineNumber: 170,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleDistanceChange(plane.id, 0),
                                        className: "p-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-600 transition-colors",
                                        title: isRtl ? "إعادة تعيين" : "Reset",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                            lineNumber: 178,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                        lineNumber: 173,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                                lineNumber: 159,
                                columnNumber: 17
                            }, this)
                        ]
                    }, plane.id, true, {
                        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                        lineNumber: 112,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/SectionPlanePanel.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_s(SectionPlanePanel, "0XLhpOiUT9HmE+WpeZ66Ma50PTQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c = SectionPlanePanel;
const __TURBOPACK__default__export__ = SectionPlanePanel;
var _c;
__turbopack_context__.k.register(_c, "SectionPlanePanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/viewer/Viewer3DControls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Viewer3DControls",
    ()=>Viewer3DControls,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sun.js [app-client] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/moon.js [app-client] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2d$3d$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move3D$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/move-3d.js [app-client] (ecmascript) <export default as Move3D>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Viewer3DControls({ onFullscreen, className = "", isRtl = false }) {
    _s();
    const { cameraMode, renderQuality, showShadows, measurement3DActive, setCameraMode, resetCamera, setRenderQuality, toggleShadows, startMeasurement3D, clearMeasurement3D } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const handleMeasureToggle = ()=>{
        if (measurement3DActive) {
            clearMeasurement3D();
        } else {
            startMeasurement3D();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-1 bg-slate-800/90 backdrop-blur rounded-full px-3 py-1.5 shadow-lg border border-slate-700 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center border-r border-slate-600 pr-2 mr-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setCameraMode("orbit"),
                        className: `p-1.5 rounded-full transition-colors ${cameraMode === "orbit" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`,
                        title: isRtl ? "وضع الدوران" : "Orbit Mode",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$move$2d$3d$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Move3D$3e$__["Move3D"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setCameraMode("firstPerson"),
                        className: `p-1.5 rounded-full transition-colors ${cameraMode === "firstPerson" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`,
                        title: isRtl ? "وضع التجول" : "Walk Mode",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 58,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setCameraMode("plan"),
                        className: `p-1.5 rounded-full transition-colors ${cameraMode === "plan" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`,
                        title: isRtl ? "منظور علوي" : "Plan View",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: resetCamera,
                className: "p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors",
                title: isRtl ? "إعادة تعيين الكاميرا" : "Reset Camera",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 83,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleMeasureToggle,
                className: `p-1.5 rounded-full transition-colors ${measurement3DActive ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"}`,
                title: isRtl ? "أداة القياس" : "Measure Tool",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-px h-5 bg-slate-600 mx-1"
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-0.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setRenderQuality("low"),
                        className: `px-2 py-1 text-xs rounded transition-colors ${renderQuality === "low" ? "bg-slate-600 text-slate-200" : "text-slate-500 hover:text-slate-300"}`,
                        title: isRtl ? "جودة منخفضة" : "Low Quality",
                        children: "L"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setRenderQuality("medium"),
                        className: `px-2 py-1 text-xs rounded transition-colors ${renderQuality === "medium" ? "bg-slate-600 text-slate-200" : "text-slate-500 hover:text-slate-300"}`,
                        title: isRtl ? "جودة متوسطة" : "Medium Quality",
                        children: "M"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setRenderQuality("high"),
                        className: `px-2 py-1 text-xs rounded transition-colors ${renderQuality === "high" ? "bg-slate-600 text-slate-200" : "text-slate-500 hover:text-slate-300"}`,
                        title: isRtl ? "جودة عالية" : "High Quality",
                        children: "H"
                    }, void 0, false, {
                        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: toggleShadows,
                className: `p-1.5 rounded-full transition-colors ${showShadows ? "text-yellow-400 bg-slate-700" : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"}`,
                title: isRtl ? "الظلال" : "Shadows",
                children: showShadows ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                    lineNumber: 154,
                    columnNumber: 24
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                    lineNumber: 154,
                    columnNumber: 54
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            onFullscreen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onFullscreen,
                className: "p-1.5 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors",
                title: isRtl ? "ملء الشاشة" : "Fullscreen",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                    lineNumber: 164,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 159,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden sm:block text-xs text-slate-500 px-2 border-l border-slate-600 ml-1",
                children: isRtl ? "اسحب للدوران | تمرير للتكبير" : "Drag to orbit | Scroll to zoom"
            }, void 0, false, {
                fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/viewer/Viewer3DControls.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(Viewer3DControls, "Xm4/DGlW79WUaXVhQuNseEMnohY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c = Viewer3DControls;
const __TURBOPACK__default__export__ = Viewer3DControls;
var _c;
__turbopack_context__.k.register(_c, "Viewer3DControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/viewer/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$ModelViewer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/ModelViewer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$ModelViewer3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/ModelViewer3D.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$FloorManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/FloorManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$SectionPlanePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/SectionPlanePanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$Viewer3DControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/Viewer3DControls.tsx [app-client] (ecmascript)");
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/project/[id]/3d-view/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThreeDViewPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.js [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize.js [app-client] (ecmascript) <export default as Maximize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minimize.js [app-client] (ecmascript) <export default as Minimize>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/ui/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/components/viewer/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$ModelViewer3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/ModelViewer3D.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$FloorManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/FloorManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$SectionPlanePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/SectionPlanePanel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$Viewer3DControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/viewer/Viewer3DControls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$ui$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/ui-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$project$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/project-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/viewer-store.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
// Feature flag for new viewer (can be controlled via env)
const USE_NEW_VIEWER = true;
function ThreeDViewPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const { language } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$ui$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"])();
    const { project, run, setProject, setRun } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$project$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProjectStore"])();
    const { setTotalFloors } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"])();
    const isRtl = language === "ar";
    const projectIdParam = Array.isArray(params.id) ? params.id[0] : params.id;
    const projectId = projectIdParam ?? "";
    const [modelUrl, setModelUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [backendStatus, setBackendStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        available: true,
        message: ""
    });
    const [isFullscreen, setIsFullscreen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showFloorPanel, setShowFloorPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showSectionPanel, setShowSectionPanel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const viewerContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load project and run data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThreeDViewPage.useEffect": ()=>{
            const loadProjectAndRun = {
                "ThreeDViewPage.useEffect.loadProjectAndRun": async ()=>{
                    // Check backend connection first
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].checkBackend();
                    const status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getBackendStatus();
                    setBackendStatus(status);
                    const found = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getProject(projectId);
                    if (found) {
                        setProject(found);
                        // Set total floors from project data
                        if (found.floors) {
                            setTotalFloors(found.floors);
                        }
                        // Load the latest run
                        const latestRun = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getLatestRunForProject(projectId);
                        if (latestRun) {
                            setRun(latestRun);
                        }
                    }
                }
            }["ThreeDViewPage.useEffect.loadProjectAndRun"];
            loadProjectAndRun();
        }
    }["ThreeDViewPage.useEffect"], [
        projectId,
        setProject,
        setRun,
        setTotalFloors
    ]);
    // Retry connection handler
    const handleRetryConnection = async ()=>{
        const connected = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].retryConnection();
        if (connected) {
            window.location.reload();
        } else {
            setBackendStatus(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getBackendStatus());
        }
    };
    // Load glTF model from artifacts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThreeDViewPage.useEffect": ()=>{
            const loadModel = {
                "ThreeDViewPage.useEffect.loadModel": async ()=>{
                    if (!run?.id || !project?.id) return;
                    try {
                        setModelUrl(null);
                        const artifacts = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getRunArtifacts(run.id);
                        const gltfArtifact = artifacts.find({
                            "ThreeDViewPage.useEffect.loadModel.gltfArtifact": (a)=>a.kind === "gltf" || a.file_name?.endsWith(".glb") || a.file_name?.endsWith(".gltf")
                        }["ThreeDViewPage.useEffect.loadModel.gltfArtifact"]);
                        if (gltfArtifact) {
                            const url = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getFileUrl(project.id, run.id, gltfArtifact.file_name);
                            setModelUrl(url);
                            return;
                        }
                        const state = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getState().catch({
                            "ThreeDViewPage.useEffect.loadModel": ()=>null
                        }["ThreeDViewPage.useEffect.loadModel"]);
                        const outputFile = state?.outputs?.gltf_file;
                        const stateRunId = state?.run?.id ? String(state.run.id) : "";
                        const stateProjectId = state?.project?.id ? String(state.project.id) : "";
                        if (outputFile && stateRunId && stateProjectId && stateRunId === String(run.id) && stateProjectId === String(project.id)) {
                            setModelUrl(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].getFileUrl(project.id, run.id, outputFile));
                        }
                    } catch (error) {
                        console.error("Failed to load model:", error);
                    }
                }
            }["ThreeDViewPage.useEffect.loadModel"];
            loadModel();
        }
    }["ThreeDViewPage.useEffect"], [
        run?.id,
        project?.id
    ]);
    // Fullscreen handler
    const handleFullscreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ThreeDViewPage.useCallback[handleFullscreen]": ()=>{
            if (!viewerContainerRef.current) return;
            if (!isFullscreen) {
                if (viewerContainerRef.current.requestFullscreen) {
                    viewerContainerRef.current.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    }["ThreeDViewPage.useCallback[handleFullscreen]"], [
        isFullscreen
    ]);
    // Track fullscreen changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThreeDViewPage.useEffect": ()=>{
            const handleFullscreenChange = {
                "ThreeDViewPage.useEffect.handleFullscreenChange": ()=>{
                    setIsFullscreen(!!document.fullscreenElement);
                }
            }["ThreeDViewPage.useEffect.handleFullscreenChange"];
            document.addEventListener("fullscreenchange", handleFullscreenChange);
            return ({
                "ThreeDViewPage.useEffect": ()=>document.removeEventListener("fullscreenchange", handleFullscreenChange)
            })["ThreeDViewPage.useEffect"];
        }
    }["ThreeDViewPage.useEffect"], []);
    // Keyboard shortcuts
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ThreeDViewPage.useEffect": ()=>{
            const handleKeyDown = {
                "ThreeDViewPage.useEffect.handleKeyDown": (e)=>{
                    // Ignore if user is typing in an input
                    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                        return;
                    }
                    switch(e.key.toLowerCase()){
                        case "f":
                            handleFullscreen();
                            break;
                        case "l":
                            setShowFloorPanel({
                                "ThreeDViewPage.useEffect.handleKeyDown": (prev)=>!prev
                            }["ThreeDViewPage.useEffect.handleKeyDown"]);
                            break;
                        case "s":
                            if (!e.ctrlKey && !e.metaKey) {
                                setShowSectionPanel({
                                    "ThreeDViewPage.useEffect.handleKeyDown": (prev)=>!prev
                                }["ThreeDViewPage.useEffect.handleKeyDown"]);
                            }
                            break;
                    }
                }
            }["ThreeDViewPage.useEffect.handleKeyDown"];
            window.addEventListener("keydown", handleKeyDown);
            return ({
                "ThreeDViewPage.useEffect": ()=>window.removeEventListener("keydown", handleKeyDown)
            })["ThreeDViewPage.useEffect"];
        }
    }["ThreeDViewPage.useEffect"], [
        handleFullscreen
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4 animate-fade-in",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold uppercase tracking-[3px] text-[var(--accent-2)] mb-1",
                                children: project?.name || (isRtl ? "المشروع" : "Project")
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-[var(--ink)]",
                                children: isRtl ? "العرض ثلاثي الأبعاد" : "3D View"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: showFloorPanel ? "primary" : "outline",
                                size: "sm",
                                onClick: ()=>setShowFloorPanel(!showFloorPanel),
                                title: "Toggle Floors (L)",
                                children: isRtl ? "الطوابق" : "Floors"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: showSectionPanel ? "primary" : "outline",
                                size: "sm",
                                onClick: ()=>setShowSectionPanel(!showSectionPanel),
                                title: "Toggle Sections (S)",
                                children: isRtl ? "المقاطع" : "Sections"
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: handleFullscreen,
                                title: "Fullscreen (F)",
                                children: [
                                    isFullscreen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize$3e$__["Minimize"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize$3e$__["Maximize"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: isRtl ? "mr-2" : "ml-2",
                                        children: isRtl ? "ملء الشاشة" : "Fullscreen"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                        lineNumber: 195,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-0 relative",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: viewerContainerRef,
                        className: `relative ${isFullscreen ? "fixed inset-0 z-50" : "min-h-[700px]"}`,
                        children: [
                            modelUrl ? ("TURBOPACK compile-time truthy", 1) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$ModelViewer3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ModelViewer3D"], {
                                modelUrl: modelUrl,
                                className: `w-full ${isFullscreen ? "h-full" : "h-[700px]"} rounded-[var(--radius-lg)]`
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 211,
                                columnNumber: 17
                            }, this) : // Fallback to old viewer if needed
                            /*#__PURE__*/ "TURBOPACK unreachable" : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-full ${isFullscreen ? "h-full" : "h-[700px]"} bg-gradient-to-b from-slate-900 to-slate-800 rounded-[var(--radius-lg)] flex items-center justify-center`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center text-slate-400 max-w-md px-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                            className: "w-20 h-20 mx-auto mb-4 opacity-30"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                            lineNumber: 228,
                                            columnNumber: 19
                                        }, this),
                                        !backendStatus.available ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-medium text-amber-500",
                                                    children: isRtl ? "الخادم غير متصل" : "Backend Not Connected"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm mt-2",
                                                    children: isRtl ? "قم بتشغيل الخادم لعرض النماذج ثلاثية الأبعاد" : "Start the backend server to view 3D models"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 234,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    size: "sm",
                                                    className: "mt-4",
                                                    onClick: handleRetryConnection,
                                                    children: isRtl ? "إعادة المحاولة" : "Retry Connection"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true) : !run?.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-medium",
                                                    children: isRtl ? "لا يوجد تشغيل نشط" : "No Active Run"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm mt-2",
                                                    children: isRtl ? "انتقل إلى المنظم لبدء التوليد" : "Go to Orchestrator to start generation"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-medium",
                                                    children: isRtl ? "جاري تحميل النموذج..." : "Loading model..."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 261,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm mt-2",
                                                    children: isRtl ? "يرجى الانتظار أثناء تحميل الملفات" : "Please wait while files are loading"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                                    lineNumber: 264,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                    lineNumber: 227,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 222,
                                columnNumber: 15
                            }, this),
                            showFloorPanel && modelUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute right-4 top-1/2 -translate-y-1/2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$FloorManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FloorManager"], {
                                    isRtl: isRtl
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                    lineNumber: 278,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 277,
                                columnNumber: 15
                            }, this),
                            showSectionPanel && modelUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute left-4 top-1/2 -translate-y-1/2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$SectionPlanePanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SectionPlanePanel"], {
                                    isRtl: isRtl
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                    lineNumber: 285,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 284,
                                columnNumber: 15
                            }, this),
                            modelUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-4 left-1/2 -translate-x-1/2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$viewer$2f$Viewer3DControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewer3DControls"], {
                                    isRtl: isRtl,
                                    onFullscreen: handleFullscreen
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                    lineNumber: 292,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 291,
                                columnNumber: 15
                            }, this),
                            modelUrl && !isFullscreen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute bottom-4 left-4 text-xs text-slate-500",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "bg-slate-800/80 px-2 py-1 rounded",
                                    children: isRtl ? "L: طوابق | S: مقاطع | F: ملء الشاشة" : "L: Floors | S: Sections | F: Fullscreen"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                    lineNumber: 302,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                                lineNumber: 301,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                    lineNumber: 204,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/project/[id]/3d-view/page.tsx",
        lineNumber: 156,
        columnNumber: 5
    }, this);
}
_s(ThreeDViewPage, "hBovjObrdpKLbs6YSjbjk7Rf+HY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$ui$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUIStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$project$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProjectStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$viewer$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useViewerStore"]
    ];
});
_c = ThreeDViewPage;
var _c;
__turbopack_context__.k.register(_c, "ThreeDViewPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_943bd5b6._.js.map