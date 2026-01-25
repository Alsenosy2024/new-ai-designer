"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface SvgCanvasProps {
  projectId: string | number;
  runId: string | number;
  fileName: string;
  className?: string;
}

export function SvgCanvas({ projectId, runId, fileName, className = "" }: SvgCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // RAF throttling refs for smooth panning
  const rafRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Load SVG content from backend
  useEffect(() => {
    const loadSvg = async () => {
      if (!fileName || !projectId || !runId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const url = apiClient.getFileUrl(projectId, runId, fileName);
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
      } finally {
        setLoading(false);
      }
    };

    loadSvg();
  }, [projectId, runId, fileName]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(10, prev * delta)));
  }, []);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  // Handle pan move with RAF throttling for smooth performance
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    // Store pending position
    pendingPositionRef.current = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };

    // Throttle with RAF - only update on animation frame
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingPositionRef.current) {
        setPosition(pendingPositionRef.current);
      }
    });
  }, [isDragging, dragStart]);

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Memoize transform style for GPU acceleration
  const transformStyle = useMemo(() => ({
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: "center",
    transition: isDragging ? "none" : "transform 0.1s ease-out",
    willChange: isDragging ? "transform" : "auto", // GPU hint during drag
  }), [position.x, position.y, scale, isDragging]);

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(10, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.1, prev / 1.2));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full bg-[#f8f6f1] ${className}`}>
        <div className="text-center text-[var(--ink-soft)]">
          <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin opacity-50" />
          <p className="text-sm">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-[#f8f6f1] ${className}`}>
        <div className="text-center text-[var(--ink-soft)]">
          <p className="text-sm text-red-500">{error}</p>
          <p className="text-xs mt-2">Check that the project has been generated.</p>
        </div>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className={`flex items-center justify-center h-full bg-[#f8f6f1] ${className}`}>
        <div className="text-center text-[var(--ink-soft)]">
          <Move className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No plan available</p>
          <p className="text-xs mt-1">Generate a project to view the floor plan</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full bg-[#f8f6f1] cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: `
            linear-gradient(0deg, rgba(100,110,125,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,110,125,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={transformStyle}
        >
          <div
            className="svg-container"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--surface)] rounded-full px-3 py-2 shadow-lg border border-[var(--line)]">
        <button
          onClick={zoomOut}
          className="p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm text-[var(--ink-soft)] min-w-[48px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-[var(--line)]" />
        <button
          onClick={resetView}
          className="p-2 rounded-full hover:bg-[var(--bg-2)] text-[var(--ink-soft)] transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 right-4 bg-[var(--surface)] rounded-[var(--radius-sm)] px-3 py-1.5 shadow border border-[var(--line)]">
        <span className="text-xs text-[var(--ink-soft)] font-mono">
          Scale: {scale.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}

export default SvgCanvas;
