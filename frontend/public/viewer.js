// DOM elements are resolved lazily or at module scope if verified
const getPlanContainer = () => document.getElementById("plan-view");
const planContainer = getPlanContainer(); // Keep checking this variable usage

const planCanvas = document.querySelector("[data-plan-canvas]") || planContainer;
const planScaleLabel = document.querySelector("[data-plan-scale]");
const planZoomIn = document.querySelector("[data-plan-zoom='in']");
const planZoomOut = document.querySelector("[data-plan-zoom='out']");
const planFit = document.querySelector("[data-plan-fit]");
const planReset = document.querySelector("[data-plan-reset]");
const planFullscreen = document.querySelector("[data-plan-fullscreen]");
const planUndo = document.querySelector("[data-plan-undo]");
const planRedo = document.querySelector("[data-plan-redo]");
const planSnapToggle = document.querySelector("[data-plan-snap]");
const planGridToggle = document.querySelector("[data-plan-grid]");
const planSave = document.querySelector("[data-plan-save]");
const toolButtons = Array.from(document.querySelectorAll("[data-tool]"));
const layerToggles = Array.from(document.querySelectorAll("[data-layer-toggle]"));
const planToolLabel = document.querySelector("[data-plan-tool]");
const planLayerLabel = document.querySelector("[data-plan-layer]");
const planSnapLabel = document.querySelector("[data-plan-snap-state]");
const planCoordsLabel = document.querySelector("[data-cad-coords]");
const modelCanvas = document.getElementById("model-view");

const SVG_NS = "http://www.w3.org/2000/svg";
const apiBaseMeta = document.querySelector('meta[name="ai-designer-api-base"]');
const apiBaseOverride =
  window.aiDesignerApiBase ||
  (apiBaseMeta ? apiBaseMeta.getAttribute("content") : "");
const API_BASES = [apiBaseOverride, "", "http://localhost:8001"].filter(Boolean);
let activeApiBase = apiBaseOverride || "";

if (apiBaseOverride) {
  window.aiDesignerApiBase = apiBaseOverride;
}
const MAX_PIXEL_RATIO = 1.5;
const TARGET_FPS = 30;
const ROTATION_SPEED = 0.002;
const SNAP_EPSILON = 0.01;

let scene;
let camera;
let renderer;
let modelMesh;
let gltfModel;
let gltfLoader;
let animationId;
let lastPlanUrl = "";
let lastGltfUrl = "";
let planControlsBound = false;
let latestState = {};
let planEditsLoadedFor = "";
let saveTimer = null;
let animationEnabled = true;
let lastFrameTime = 0;
let renderQueued = false;
let pointerFrame = null;
let pendingPointer = null;
const snapState = { x: [], y: [], threshold: 0.35 };

const planState = {
  base: null,
  viewBox: null,
  isPanning: false,
  start: null,
  startViewBox: null,
  grid: { x: [], y: [], step: 0.5 },
};

const editState = {
  tool: "select",
  isDrawing: false,
  isDragging: false,
  start: null,
  current: null,
  selectedId: null,
  elements: [],
  snap: true,
  grid: true,
  history: [],
  historyIndex: -1,
  dragSnapshot: null,
};

function parseNumber(value, fallback) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/[\d.]+/);
  return match ? Number(match[0]) : fallback;
}

function parseNumberList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => Number(item))
    .filter((num) => Number.isFinite(num));
}

function medianStep(values) {
  if (!values || values.length < 2) return null;
  const diffs = [];
  for (let i = 1; i < values.length; i += 1) {
    diffs.push(values[i] - values[i - 1]);
  }
  diffs.sort((a, b) => a - b);
  return diffs[Math.floor(diffs.length / 2)] || null;
}

function dedupeSorted(values, epsilon = SNAP_EPSILON) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((value) => {
    if (!result.length || Math.abs(value - result[result.length - 1]) > epsilon) {
      result.push(value);
    }
  });
  return result;
}

function computeSnapThreshold() {
  if (!planState.base) return 0.35;
  const span = Math.min(planState.base.w, planState.base.h);
  return Math.min(0.8, Math.max(0.2, span * 0.01));
}

function updateSnapCache() {
  const snapX = [];
  const snapY = [];
  if (planState.grid?.x?.length) {
    snapX.push(...planState.grid.x);
  }
  if (planState.grid?.y?.length) {
    snapY.push(...planState.grid.y);
  }

  editState.elements.forEach((element) => {
    if (element.start) {
      snapX.push(element.start.x);
      snapY.push(element.start.y);
    }
    if (element.end) {
      snapX.push(element.end.x);
      snapY.push(element.end.y);
    }
    if (element.position) {
      snapX.push(element.position.x);
      snapY.push(element.position.y);
    }
  });

  snapState.x = dedupeSorted(snapX);
  snapState.y = dedupeSorted(snapY);
  snapState.threshold = computeSnapThreshold();
}

function snapCoordinate(value, candidates, threshold) {
  if (!candidates.length) return null;
  let snapped = null;
  let best = threshold;
  candidates.forEach((candidate) => {
    const dist = Math.abs(candidate - value);
    if (dist <= best) {
      best = dist;
      snapped = candidate;
    }
  });
  return snapped;
}

function computeMassing(state) {
  const floors = parseNumber(state?.project?.floors, 12);
  const gfa = parseNumber(state?.project?.gfa, 20000);
  const floorArea = gfa / Math.max(floors, 1);
  const width = Math.max(Math.sqrt(floorArea) * 0.75, 18);
  const depth = Math.max(Math.sqrt(floorArea) * 1.2, 14);
  const height = Math.max(floors * 3.3, 18);

  return { width, depth, height };
}

function getFileBase() {
  if (window.aiDesignerFilesBase) return window.aiDesignerFilesBase;
  if (window.aiDesignerApiBase) return window.aiDesignerApiBase;
  if (activeApiBase) return activeApiBase;
  if (window.location.origin && window.location.origin !== "null") {
    return window.location.origin;
  }
  const fallback = API_BASES.find((base) => base);
  return fallback || "";
}

function resolveFileUrl(state, fileName) {
  if (!fileName || !state?.project?.id || !state?.run?.id) return null;
  const base = getFileBase();
  if (!base) return null;
  return `${base}/files/${state.project.id}/${state.run.id}/${fileName}`;
}

function parseViewBox(svg) {
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const [x, y, w, h] = viewBox.split(/\s+/).map((value) => Number(value));
    if ([x, y, w, h].every((value) => Number.isFinite(value))) {
      return { x, y, w, h };
    }
  }
  const width = parseNumber(svg.getAttribute("width"), 100);
  const height = parseNumber(svg.getAttribute("height"), 100);
  return { x: 0, y: 0, w: width, h: height };
}

function applyViewBox(svg, viewBox) {
  svg.setAttribute(
    "viewBox",
    `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
  );
}

function updatePlanScale() {
  if (!planScaleLabel || !planState.base || !planState.viewBox) return;
  const scale = planState.base.w / planState.viewBox.w;
  planScaleLabel.textContent = `${Math.round(scale * 100)}%`;
}

function getPlanSvg() {
  const container = getPlanContainer();
  return container ? container.querySelector("svg") : null;
}

function setLayerVisibility(layer, isVisible) {
  const svg = getPlanSvg();
  if (!svg) return;
  const mappings = {
    arch: ["layer-arch"],
    struct: ["layer-struct"],
    mep: ["layer-mep"],
    annotations: ["layer-axes", "layer-dims", "layer-legend"],
  };
  const targets = mappings[layer] || [];
  targets.forEach((className) => {
    svg.querySelectorAll(`.${className}`).forEach((node) => {
      node.style.display = isVisible ? "inline" : "none";
    });
  });
}

function syncLayerToggles() {
  if (!layerToggles.length) return;
  layerToggles.forEach((toggle) => {
    setLayerVisibility(toggle.dataset.layerToggle, toggle.checked);
  });
}

function ensureUserLayer(svg) {
  let layer = svg.querySelector(".layer-user");
  if (!layer) {
    layer = document.createElementNS(SVG_NS, "g");
    layer.classList.add("layer-user");
    svg.appendChild(layer);
  }
  let preview = layer.querySelector(".layer-user-preview");
  if (!preview) {
    preview = document.createElementNS(SVG_NS, "g");
    preview.classList.add("layer-user-preview");
    layer.appendChild(preview);
  }
  return { layer, preview };
}

function createSvgElement(type, attrs = {}) {
  const el = document.createElementNS(SVG_NS, type);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    el.setAttribute(key, String(value));
  });
  return el;
}

function registerPlanSvg() {
  const svg = getPlanSvg();
  if (!svg) return;
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  const viewBox = parseViewBox(svg);
  planState.base = { ...viewBox };
  planState.viewBox = { ...viewBox };
  const gridX = parseNumberList(svg.dataset.gridX);
  const gridY = parseNumberList(svg.dataset.gridY);
  planState.grid = {
    x: gridX,
    y: gridY,
    step: medianStep(gridX) || medianStep(gridY) || 0.5,
  };
  applyViewBox(svg, viewBox);
  updatePlanScale();
  syncLayerToggles();
  ensureUserLayer(svg);
  renderPlanEdits();
}

function zoomPlan(factor, clientX = null, clientY = null) {
  const svg = getPlanSvg();
  if (!svg || !planState.viewBox || !planState.base) return;
  const rect = svg.getBoundingClientRect();
  const viewBox = planState.viewBox;
  let focusX = viewBox.x + viewBox.w / 2;
  let focusY = viewBox.y + viewBox.h / 2;
  if (clientX !== null && clientY !== null && rect.width && rect.height) {
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    focusX = viewBox.x + relX * viewBox.w;
    focusY = viewBox.y + relY * viewBox.h;
  }

  const minW = planState.base.w * 0.2;
  const maxW = planState.base.w * 6;
  const minH = planState.base.h * 0.2;
  const maxH = planState.base.h * 6;
  const nextW = Math.min(Math.max(viewBox.w * factor, minW), maxW);
  const nextH = Math.min(Math.max(viewBox.h * factor, minH), maxH);
  const ratioX = (focusX - viewBox.x) / viewBox.w;
  const ratioY = (focusY - viewBox.y) / viewBox.h;
  const nextX = focusX - ratioX * nextW;
  const nextY = focusY - ratioY * nextH;
  planState.viewBox = { x: nextX, y: nextY, w: nextW, h: nextH };
  applyViewBox(svg, planState.viewBox);
  updatePlanScale();
}

function resetPlanView() {
  const svg = getPlanSvg();
  if (!svg || !planState.base) return;
  planState.viewBox = { ...planState.base };
  applyViewBox(svg, planState.viewBox);
  updatePlanScale();
}

function clientToSvg(clientX, clientY) {
  const svg = getPlanSvg();
  if (!svg || !planState.viewBox) return null;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const relX = (clientX - rect.left) / rect.width;
  const relY = (clientY - rect.top) / rect.height;
  return {
    x: planState.viewBox.x + relX * planState.viewBox.w,
    y: planState.viewBox.y + relY * planState.viewBox.h,
  };
}

function snapValue(value, step) {
  if (!step) return value;
  return Math.round(value / step) * step;
}

function applySnap(point) {
  if (!editState.snap) return point;
  const threshold = snapState.threshold || 0.35;
  const step = planState.grid?.step || 0.5;
  if (snapState.x.length || snapState.y.length) {
    const snappedX = snapCoordinate(point.x, snapState.x, threshold);
    const snappedY = snapCoordinate(point.y, snapState.y, threshold);
    return {
      x: snappedX === null ? snapValue(point.x, step) : snappedX,
      y: snappedY === null ? snapValue(point.y, step) : snappedY,
    };
  }
  return { x: snapValue(point.x, step), y: snapValue(point.y, step) };
}

function setActiveTool(tool) {
  editState.tool = tool;
  toolButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === tool);
    if (button.dataset.tool === tool) {
      button.setAttribute("aria-pressed", "true");
    } else {
      button.removeAttribute("aria-pressed");
    }
  });
  if (!editState.history.length) {
    pushHistory();
  }
  updatePropertiesPanel();
}

function updatePropertiesPanel() {
  if (planToolLabel) {
    planToolLabel.textContent = editState.tool;
  }
  if (planLayerLabel) {
    planLayerLabel.textContent = editState.selectedId ? "Edited" : "Architectural";
  }
  if (planSnapLabel) {
    planSnapLabel.textContent = editState.snap ? "On" : "Off";
  }
  if (planSnapToggle) {
    planSnapToggle.classList.toggle("is-active", editState.snap);
  }
  if (planGridToggle) {
    planGridToggle.classList.toggle("is-active", editState.grid);
  }
}

function scheduleRenderPlanEdits() {
  if (renderQueued) return;
  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    renderPlanEdits();
  });
}

function renderPlanEdits() {
  const svg = getPlanSvg();
  if (!svg) return;
  const { layer, preview } = ensureUserLayer(svg);
  layer.querySelectorAll(".plan-edit-item").forEach((node) => node.remove());

  editState.elements.forEach((element) => {
    const isSelected = element.id === editState.selectedId;
    const group = createSvgElement("g", {
      "data-edit-id": element.id,
      "data-edit-type": element.type,
      class: "plan-edit-item",
    });

    if (element.type === "wall") {
      const line = createSvgElement("line", {
        x1: element.start.x,
        y1: element.start.y,
        x2: element.end.x,
        y2: element.end.y,
      });
      line.classList.add("plan-edit", "plan-edit-wall");
      if (isSelected) line.classList.add("plan-edit-selected");
      group.appendChild(line);
    }

    if (element.type === "window") {
      const line = createSvgElement("line", {
        x1: element.start.x,
        y1: element.start.y,
        x2: element.end.x,
        y2: element.end.y,
      });
      line.classList.add("plan-edit", "plan-edit-window");
      if (isSelected) line.classList.add("plan-edit-selected");
      group.appendChild(line);

      const dx = element.end.x - element.start.x;
      const dy = element.end.y - element.start.y;
      const length = Math.hypot(dx, dy) || 1;
      const offset = 0.18;
      const ox = (-dy / length) * offset;
      const oy = (dx / length) * offset;
      const line2 = createSvgElement("line", {
        x1: element.start.x + ox,
        y1: element.start.y + oy,
        x2: element.end.x + ox,
        y2: element.end.y + oy,
      });
      line2.classList.add("plan-edit", "plan-edit-window");
      if (isSelected) line2.classList.add("plan-edit-selected");
      group.appendChild(line2);
    }

    if (element.type === "door") {
      const doorGroup = createDoorSymbol(element, isSelected);
      if (doorGroup) group.appendChild(doorGroup);
    }

    if (element.type === "dimension") {
      const dimGroup = createDimensionSymbol(element, isSelected);
      if (dimGroup) group.appendChild(dimGroup);
    }

    if (element.type === "text") {
      const label = createSvgElement("text", {
        x: element.position.x,
        y: element.position.y,
      });
      label.textContent = element.text || "Note";
      label.setAttribute("font-size", "0.9");
      label.setAttribute("fill", "#1c1e24");
      if (isSelected) label.classList.add("plan-edit-selected");
      group.appendChild(label);
    }

    layer.insertBefore(group, preview);
  });
  updateSnapCache();
}

function createDoorSymbol(element, isSelected) {
  const width = element.width || 1;
  const x = element.position.x;
  const y = element.position.y;
  const orientation = element.orientation || "E";
  const group = document.createElementNS(SVG_NS, "g");

  let arcPath = "";
  let leafLine = null;
  if (orientation === "N") {
    arcPath = `M${x} ${y} L${x + width} ${y} A${width} ${width} 0 0 0 ${x} ${y - width}`;
    leafLine = { x1: x, y1: y, x2: x + width, y2: y };
  } else if (orientation === "S") {
    arcPath = `M${x} ${y} L${x + width} ${y} A${width} ${width} 0 0 1 ${x} ${y + width}`;
    leafLine = { x1: x, y1: y, x2: x + width, y2: y };
  } else if (orientation === "W") {
    arcPath = `M${x} ${y} L${x} ${y + width} A${width} ${width} 0 0 0 ${x - width} ${y}`;
    leafLine = { x1: x, y1: y, x2: x, y2: y + width };
  } else {
    arcPath = `M${x} ${y} L${x} ${y + width} A${width} ${width} 0 0 1 ${x + width} ${y}`;
    leafLine = { x1: x, y1: y, x2: x, y2: y + width };
  }

  const arc = createSvgElement("path", { d: arcPath });
  arc.classList.add("plan-edit", "plan-edit-door");
  if (isSelected) arc.classList.add("plan-edit-selected");
  group.appendChild(arc);

  if (leafLine) {
    const leaf = createSvgElement("line", leafLine);
    leaf.classList.add("plan-edit", "plan-edit-door");
    if (isSelected) leaf.classList.add("plan-edit-selected");
    group.appendChild(leaf);
  }

  return group;
}

function createDimensionSymbol(element, isSelected) {
  const start = element.start;
  const end = element.end;
  if (!start || !end) return null;
  const group = document.createElementNS(SVG_NS, "g");

  const line = createSvgElement("line", {
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
  });
  line.classList.add("plan-edit", "plan-edit-window");
  if (isSelected) line.classList.add("plan-edit-selected");
  group.appendChild(line);

  const tickSize = 0.3;
  const ticks = [
    { x1: start.x, y1: start.y - tickSize, x2: start.x, y2: start.y + tickSize },
    { x1: end.x, y1: end.y - tickSize, x2: end.x, y2: end.y + tickSize },
  ];
  ticks.forEach((tick) => {
    const tickLine = createSvgElement("line", tick);
    tickLine.classList.add("plan-edit", "plan-edit-window");
    if (isSelected) tickLine.classList.add("plan-edit-selected");
    group.appendChild(tickLine);
  });

  const length = Math.hypot(end.x - start.x, end.y - start.y);
  const label = createSvgElement("text", {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2 - 0.4,
  });
  label.textContent = `${length.toFixed(1)}m`;
  label.setAttribute("font-size", "0.8");
  label.setAttribute("fill", "#1c1e24");
  group.appendChild(label);

  return group;
}

function pushHistory() {
  const snapshot = JSON.parse(JSON.stringify(editState.elements));
  editState.history = editState.history.slice(0, editState.historyIndex + 1);
  editState.history.push(snapshot);
  editState.historyIndex = editState.history.length - 1;
}

function scheduleSave() {
  if (saveTimer) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    savePlanEdits();
  }, 700);
}

async function requestApi(path, options = {}) {
  if (window.aiDesignerApiBase && window.aiDesignerApiBase !== activeApiBase) {
    activeApiBase = window.aiDesignerApiBase;
  }
  const bases = activeApiBase ? [activeApiBase] : API_BASES;
  let lastError = null;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      activeApiBase = base;
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("API unavailable");
}

function getRunId(state = latestState) {
  return state?.run?.id || "";
}

async function savePlanEdits() {
  const runId = getRunId();
  const payload = { elements: editState.elements };
  if (!runId) {
    localStorage.setItem("aiDesignerPlanEdits:local", JSON.stringify(payload));
    return;
  }
  try {
    await requestApi(`/api/runs/${runId}/plan`, {
      method: "POST",
      body: JSON.stringify({ payload }),
    });
  } catch (error) {
    localStorage.setItem(`aiDesignerPlanEdits:${runId}`, JSON.stringify(payload));
  }
}

async function loadPlanEdits(state) {
  const runId = getRunId(state);
  if (!runId || planEditsLoadedFor === runId) return;
  planEditsLoadedFor = runId;
  let payload = null;
  try {
    const response = await requestApi(`/api/runs/${runId}/plan`);
    payload = response?.payload || null;
  } catch (error) {
    const local = localStorage.getItem(`aiDesignerPlanEdits:${runId}`);
    payload = local ? JSON.parse(local) : null;
  }

  if (payload?.elements) {
    editState.elements = payload.elements;
  }
  editState.history = [];
  editState.historyIndex = -1;
  pushHistory();
  renderPlanEdits();
}

function updateCoordsLabel(point) {
  if (!planCoordsLabel || !point) return;
  planCoordsLabel.textContent = `${point.x.toFixed(2)}, ${point.y.toFixed(2)}`;
}

function startPan(event) {
  const svg = getPlanSvg();
  if (!svg || !planState.viewBox) return;
  planState.isPanning = true;
  planState.start = { x: event.clientX, y: event.clientY };
  planState.startViewBox = { ...planState.viewBox };
  planCanvas?.classList.add("is-panning");
  if (planCanvas?.setPointerCapture) {
    planCanvas.setPointerCapture(event.pointerId);
  }
}

function movePan(event) {
  if (!planState.isPanning || !planState.startViewBox) return;
  const svg = getPlanSvg();
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dx = (planState.start.x - event.clientX) * (planState.startViewBox.w / rect.width);
  const dy = (planState.start.y - event.clientY) * (planState.startViewBox.h / rect.height);
  planState.viewBox = {
    x: planState.startViewBox.x + dx,
    y: planState.startViewBox.y + dy,
    w: planState.startViewBox.w,
    h: planState.startViewBox.h,
  };
  applyViewBox(svg, planState.viewBox);
}

function endPan() {
  if (!planState.isPanning) return;
  planState.isPanning = false;
  planState.start = null;
  planState.startViewBox = null;
  planCanvas?.classList.remove("is-panning");
}

function selectElement(target, point) {
  if (!target || !target.closest) {
    editState.selectedId = null;
    editState.isDragging = false;
    editState.dragSnapshot = null;
    renderPlanEdits();
    updatePropertiesPanel();
    return;
  }
  const hit = target.closest("[data-edit-id]");
  if (hit) {
    editState.selectedId = hit.dataset.editId;
    editState.isDragging = true;
    editState.start = point;
    const element = editState.elements.find((item) => item.id === editState.selectedId);
    editState.dragSnapshot = element ? JSON.parse(JSON.stringify(element)) : null;
  } else {
    editState.selectedId = null;
    editState.isDragging = false;
    editState.dragSnapshot = null;
  }
  renderPlanEdits();
  updatePropertiesPanel();
}

function eraseElement(target) {
  if (!target || !target.closest) return;
  const hit = target.closest("[data-edit-id]");
  if (!hit) return;
  const id = hit.dataset.editId;
  editState.elements = editState.elements.filter((item) => item.id !== id);
  editState.selectedId = null;
  renderPlanEdits();
  pushHistory();
  scheduleSave();
}

function startDrawing(point) {
  editState.isDrawing = true;
  editState.start = point;
  editState.current = point;
}

function updateDrawing(point) {
  editState.current = point;
  const svg = getPlanSvg();
  if (!svg) return;
  const { preview } = ensureUserLayer(svg);
  preview.replaceChildren();

  if (editState.tool === "wall" || editState.tool === "window") {
    const line = createSvgElement("line", {
      x1: editState.start.x,
      y1: editState.start.y,
      x2: editState.current.x,
      y2: editState.current.y,
    });
    line.classList.add("plan-edit", editState.tool === "wall" ? "plan-edit-wall" : "plan-edit-window");
    preview.appendChild(line);
  }

  if (editState.tool === "door") {
    const orientation = inferOrientation(editState.start, editState.current);
    const width = Math.min(1.4, Math.max(0.8, distance(editState.start, editState.current)));
    const door = createDoorSymbol(
      {
        position: editState.start,
        width,
        orientation,
      },
      false
    );
    if (door) preview.appendChild(door);
  }

  if (editState.tool === "dimension") {
    const dim = createDimensionSymbol(
      {
        start: editState.start,
        end: editState.current,
      },
      false
    );
    if (dim) preview.appendChild(dim);
  }
}

function finishDrawing() {
  const svg = getPlanSvg();
  if (svg) {
    const { preview } = ensureUserLayer(svg);
    preview.replaceChildren();
  }

  const start = editState.start;
  const end = editState.current;
  if (!start || !end) {
    editState.isDrawing = false;
    return;
  }

  const elementId = crypto.randomUUID ? crypto.randomUUID() : `edit_${Date.now()}`;
  if (editState.tool === "wall" || editState.tool === "window") {
    editState.elements.push({
      id: elementId,
      type: editState.tool,
      start,
      end,
    });
  }

  if (editState.tool === "door") {
    const orientation = inferOrientation(start, end);
    const width = Math.min(1.4, Math.max(0.8, distance(start, end)));
    editState.elements.push({
      id: elementId,
      type: "door",
      position: start,
      width,
      orientation,
    });
  }

  if (editState.tool === "dimension") {
    editState.elements.push({
      id: elementId,
      type: "dimension",
      start,
      end,
    });
  }

  if (editState.tool === "text") {
    editState.elements.push({
      id: elementId,
      type: "text",
      position: start,
      text: "Note",
    });
  }

  editState.isDrawing = false;
  editState.start = null;
  editState.current = null;
  renderPlanEdits();
  pushHistory();
  scheduleSave();
}

function dragSelected(point) {
  if (!editState.isDragging || !editState.dragSnapshot || !editState.selectedId) return;
  const dx = point.x - editState.start.x;
  const dy = point.y - editState.start.y;
  editState.elements = editState.elements.map((item) => {
    if (item.id !== editState.selectedId) return item;
    const original = editState.dragSnapshot;
    if (item.type === "wall" || item.type === "window" || item.type === "dimension") {
      return {
        ...item,
        start: { x: original.start.x + dx, y: original.start.y + dy },
        end: { x: original.end.x + dx, y: original.end.y + dy },
      };
    }
    if (item.type === "door") {
      return {
        ...item,
        position: { x: original.position.x + dx, y: original.position.y + dy },
      };
    }
    if (item.type === "text") {
      return {
        ...item,
        position: { x: original.position.x + dx, y: original.position.y + dy },
      };
    }
    return item;
  });
  scheduleRenderPlanEdits();
}

function finishDrag() {
  if (!editState.isDragging) return;
  editState.isDragging = false;
  editState.dragSnapshot = null;
  pushHistory();
  scheduleSave();
}

function inferOrientation(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "E" : "W";
  }
  return dy > 0 ? "S" : "N";
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function processPointerMove(payload) {
  if (!planCanvas) return;
  const isActive = planState.isPanning || editState.isDragging || editState.isDrawing;
  const isOverPlan = payload.target && planCanvas.contains(payload.target);
  if (!isActive && !isOverPlan) return;

  const svgPoint = clientToSvg(payload.clientX, payload.clientY);
  if (svgPoint) {
    updateCoordsLabel(svgPoint);
  }

  if (planState.isPanning) {
    movePan(payload);
    return;
  }

  if (editState.isDragging && svgPoint) {
    dragSelected(svgPoint);
    return;
  }

  if (editState.isDrawing && svgPoint) {
    updateDrawing(applySnap(svgPoint));
  }
}

function handlePointerMove(event) {
  pendingPointer = {
    clientX: event.clientX,
    clientY: event.clientY,
    target: event.target,
  };
  if (pointerFrame) return;
  pointerFrame = window.requestAnimationFrame(() => {
    pointerFrame = null;
    if (!pendingPointer) return;
    processPointerMove(pendingPointer);
    pendingPointer = null;
  });
}

function bindPlanControls() {
  if (planControlsBound) return;
  planControlsBound = true;

  if (planZoomIn) {
    planZoomIn.addEventListener("click", () => zoomPlan(0.85));
  }
  if (planZoomOut) {
    planZoomOut.addEventListener("click", () => zoomPlan(1.15));
  }
  if (planFit) {
    planFit.addEventListener("click", resetPlanView);
  }
  if (planReset) {
    planReset.addEventListener("click", resetPlanView);
  }
  if (planFullscreen && planCanvas && planCanvas.requestFullscreen) {
    planFullscreen.addEventListener("click", () => {
      planCanvas.requestFullscreen();
    });
  }

  if (planUndo) {
    planUndo.addEventListener("click", () => {
      if (editState.historyIndex > 0) {
        editState.historyIndex -= 1;
        editState.elements = JSON.parse(
          JSON.stringify(editState.history[editState.historyIndex])
        );
        renderPlanEdits();
        scheduleSave();
      }
    });
  }

  if (planRedo) {
    planRedo.addEventListener("click", () => {
      if (editState.historyIndex < editState.history.length - 1) {
        editState.historyIndex += 1;
        editState.elements = JSON.parse(
          JSON.stringify(editState.history[editState.historyIndex])
        );
        renderPlanEdits();
        scheduleSave();
      }
    });
  }

  if (planSnapToggle) {
    planSnapToggle.addEventListener("click", () => {
      editState.snap = !editState.snap;
      updatePropertiesPanel();
    });
  }

  if (planGridToggle && planCanvas) {
    planGridToggle.addEventListener("click", () => {
      editState.grid = !editState.grid;
      planCanvas.classList.toggle("grid-hidden", !editState.grid);
      updatePropertiesPanel();
    });
  }

  if (planSave) {
    planSave.addEventListener("click", () => {
      savePlanEdits();
    });
  }

  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTool(button.dataset.tool);
    });
  });

  layerToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      setLayerVisibility(toggle.dataset.layerToggle, toggle.checked);
    });
  });

  if (planCanvas) {
    planCanvas.addEventListener(
      "wheel",
      (event) => {
        if (!planState.viewBox) return;
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 1.12 : 0.9;
        zoomPlan(zoomFactor, event.clientX, event.clientY);
      },
      { passive: false }
    );

    planCanvas.addEventListener("pointerdown", (event) => {
      const svgPoint = clientToSvg(event.clientX, event.clientY);
      if (!svgPoint) return;
      const snapped = applySnap(svgPoint);
      updateCoordsLabel(snapped);

      if (editState.tool === "pan") {
        startPan(event);
        return;
      }

      if (editState.tool === "select") {
        selectElement(event.target, snapped);
        return;
      }

      if (editState.tool === "erase") {
        eraseElement(event.target);
        return;
      }

      startDrawing(snapped);
    });
  }

  window.addEventListener("pointermove", handlePointerMove);

  window.addEventListener("pointerup", () => {
    if (planState.isPanning) {
      endPan();
      return;
    }

    if (editState.isDragging) {
      finishDrag();
      return;
    }

    if (editState.isDrawing) {
      finishDrawing();
    }
  });

  updatePropertiesPanel();
}

async function renderPlan(state) {
  const container = getPlanContainer();
  console.log("renderPlan running. Container:", !!container, "State:", state ? "Present" : "Missing");

  if (!container) return;

  const planUrl = resolveFileUrl(state, state?.outputs?.planSvgFile);
  console.log("Plan URL:", planUrl, "Last:", lastPlanUrl);

  if (planUrl && planUrl !== lastPlanUrl) {
    try {
      console.log("Fetching plan...", planUrl);
      const response = await fetch(planUrl);
      if (response.ok) {
        const svg = await response.text();
        console.log("Plan fetched. Updating innerHTML.");
        container.innerHTML = svg;
        lastPlanUrl = planUrl;
        registerPlanSvg();
        await loadPlanEdits(state);
        return;
      } else {
        console.error("Fetch failed:", response.status);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Fall back to generated SVG.
    }
  }
  const { width, depth } = computeMassing(state);
  console.log("Fallback to detailed plan generation.");

  // Padding for grid and dimensions
  const padding = 4;
  const viewWidth = width + padding * 2;
  const viewHeight = depth + padding * 2;
  const originX = padding;
  const originY = padding;

  const coreWidth = width * 0.25;
  const coreDepth = depth * 0.3;
  const coreX = originX + (width - coreWidth) / 2;
  const coreY = originY + (depth - coreDepth) / 2;

  // Grid lines
  let gridSvg = "";
  const gridStep = 8;
  const cols = Math.floor(width / gridStep);
  const rows = Math.floor(depth / gridStep);

  // Vertical Grid (A, B, C...)
  for (let i = 0; i <= cols; i++) {
    const x = originX + (i * width) / cols;
    const label = String.fromCharCode(65 + i);
    gridSvg += `<line x1="${x}" y1="${originY - 1.5}" x2="${x}" y2="${originY + depth + 1.5}" stroke="#b0bec5" stroke-dasharray="0.3 0.2" stroke-width="0.05" />`;
    gridSvg += `<circle cx="${x}" cy="${originY - 2}" r="0.6" fill="none" stroke="#546e7a" stroke-width="0.1" />`;
    gridSvg += `<text x="${x}" y="${originY - 1.8}" font-size="0.6" text-anchor="middle" fill="#546e7a">${label}</text>`;
  }

  // Horizontal Grid (1, 2, 3...)
  for (let i = 0; i <= rows; i++) {
    const y = originY + (i * depth) / rows;
    const label = i + 1;
    gridSvg += `<line x1="${originX - 1.5}" y1="${y}" x2="${originX + width + 1.5}" y2="${y}" stroke="#b0bec5" stroke-dasharray="0.3 0.2" stroke-width="0.05" />`;
    gridSvg += `<circle cx="${originX - 2}" cy="${y}" r="0.6" fill="none" stroke="#546e7a" stroke-width="0.1" />`;
    gridSvg += `<text x="${originX - 2}" y="${y + 0.2}" font-size="0.6" text-anchor="middle" fill="#546e7a">${label}</text>`;
  }

  // Dimensions
  let dimSvg = "";
  // Top Width
  dimSvg += `<line x1="${originX}" y1="${originY - 1}" x2="${originX + width}" y2="${originY - 1}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<line x1="${originX}" y1="${originY - 0.8}" x2="${originX}" y2="${originY - 1.2}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<line x1="${originX + width}" y1="${originY - 0.8}" x2="${originX + width}" y2="${originY - 1.2}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<text x="${originX + width / 2}" y="${originY - 1.2}" font-size="0.6" text-anchor="middle" fill="#546e7a">${width.toFixed(1)}m</text>`;

  // Left Depth
  dimSvg += `<line x1="${originX - 1}" y1="${originY}" x2="${originX - 1}" y2="${originY + depth}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<line x1="${originX - 0.8}" y1="${originY}" x2="${originX - 1.2}" y2="${originY}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<line x1="${originX - 0.8}" y1="${originY + depth}" x2="${originX - 1.2}" y2="${originY + depth}" stroke="#546e7a" stroke-width="0.05" />`;
  dimSvg += `<text x="${originX - 1.2}" y="${originY + depth / 2}" font-size="0.6" text-anchor="end" fill="#546e7a">${depth.toFixed(1)}m</text>`;

  // Rooms and Layout
  const mainWalls = `<rect x="${originX}" y="${originY}" width="${width}" height="${depth}" fill="#fcfbf9" stroke="#37474f" stroke-width="0.4" />`;
  const core = `<rect x="${coreX}" y="${coreY}" width="${coreWidth}" height="${coreDepth}" fill="#eceff1" stroke="#546e7a" stroke-width="0.2" />`;

  // Internal partitions (simplified)
  let partitions = "";
  // Vertical split
  partitions += `<line x1="${originX + width * 0.3}" y1="${originY}" x2="${originX + width * 0.3}" y2="${originY + depth}" stroke="#78909c" stroke-width="0.15" />`;
  partitions += `<line x1="${originX + width * 0.7}" y1="${originY}" x2="${originX + width * 0.7}" y2="${originY + depth}" stroke="#78909c" stroke-width="0.15" />`;
  // Horizontal split
  partitions += `<line x1="${originX}" y1="${originY + depth * 0.5}" x2="${originX + width}" y2="${originY + depth * 0.5}" stroke="#78909c" stroke-width="0.15" />`;

  // Doors
  let doors = "";
  // Main Entrance
  doors += `<path d="M${originX + width / 2 - 0.8} ${originY + depth} L${originX + width / 2 - 0.8} ${originY + depth + 0.8} A0.8 0.8 0 0 1 ${originX + width / 2} ${originY + depth}" fill="none" stroke="#37474f" stroke-width="0.1" />`;
  doors += `<line x1="${originX + width / 2 - 0.8}" y1="${originY + depth}" x2="${originX + width / 2 - 0.8}" y2="${originY + depth + 0.8}" stroke="#37474f" stroke-width="0.1" />`;

  // Core Door
  doors += `<path d="M${coreX + coreWidth / 2} ${coreY + coreDepth} L${coreX + coreWidth / 2} ${coreY + coreDepth + 0.6} A0.6 0.6 0 0 1 ${coreX + coreWidth / 2 + 0.6} ${coreY + coreDepth}" fill="none" stroke="#546e7a" stroke-width="0.1" />`;

  // Windows
  let windows = "";
  const winW = 1.5;
  const numWinsX = Math.floor(width / 4);
  for (let i = 1; i < numWinsX; i++) {
    const wx = originX + i * (width / numWinsX) - winW / 2;
    windows += `<rect x="${wx}" y="${originY - 0.2}" width="${winW}" height="0.4" fill="#ffffff" stroke="#90a4ae" stroke-width="0.1" />`; // Top
    windows += `<line x1="${wx}" y1="${originY}" x2="${wx + winW}" y2="${originY}" stroke="#cfd8dc" stroke-width="0.15" />`;

    windows += `<rect x="${wx}" y="${originY + depth - 0.2}" width="${winW}" height="0.4" fill="#ffffff" stroke="#90a4ae" stroke-width="0.1" />`; // Bottom
    windows += `<line x1="${wx}" y1="${originY + depth}" x2="${wx + winW}" y2="${originY + depth}" stroke="#cfd8dc" stroke-width="0.15" />`;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${viewWidth} ${viewHeight}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <!-- Grid -->
      <g class="layer-axes">${gridSvg}</g>
      
      <!-- Dimensions -->
      <g class="layer-dims">${dimSvg}</g>
      
      <!-- Walls & Core -->
      <g class="layer-arch">
        ${mainWalls}
        ${partitions}
        ${core}
        ${windows}
        ${doors}
      </g>
      
      <!-- Labels -->
      <g class="layer-legend">
        <text x="${coreX + coreWidth / 2}" y="${coreY + coreDepth / 2}" font-size="0.8" text-anchor="middle" fill="#546e7a">CORE</text>
      </g>
    </svg>
  `;
  registerPlanSvg();
  await loadPlanEdits(state);
}

function setupModelViewer(state) {
  if (!modelCanvas || !window.THREE) return;
  const { width, depth, height } = computeMassing(state);

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#fbf6ef");

  const aspect = modelCanvas.clientWidth / modelCanvas.clientHeight || 1;
  camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 2000);
  camera.position.set(width * 1.2, height * 0.8, depth * 1.4);

  renderer = new THREE.WebGLRenderer({ canvas: modelCanvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setSize(modelCanvas.clientWidth, modelCanvas.clientHeight, false);

  const grid = new THREE.GridHelper(200, 20, "#cbb7a5", "#e0d2c2");
  scene.add(grid);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.7);
  directional.position.set(60, 100, 80);
  scene.add(directional);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: "#f97316",
    roughness: 0.4,
    metalness: 0.1,
  });
  modelMesh = new THREE.Mesh(geometry, material);
  modelMesh.scale.set(width, height, depth);
  modelMesh.position.set(0, height / 2, 0);
  scene.add(modelMesh);

  startAnimation();
}

async function loadGltfModel(state) {
  console.log("[3D] loadGltfModel called. THREE:", !!window.THREE, "GLTFLoader:", !!window.THREE?.GLTFLoader);
  if (!window.THREE || !window.THREE.GLTFLoader) {
    console.warn("[3D] GLTFLoader not available");
    return false;
  }
  const gltfUrl = resolveFileUrl(state, state?.outputs?.gltfFile);
  console.log("[3D] GLTF URL:", gltfUrl, "Last URL:", lastGltfUrl);
  if (!gltfUrl || gltfUrl === lastGltfUrl) return Boolean(gltfModel);
  if (!gltfLoader) {
    gltfLoader = new THREE.GLTFLoader();
  }
  return new Promise((resolve) => {
    console.log("[3D] Starting GLTF load:", gltfUrl);
    gltfLoader.load(
      gltfUrl,
      (gltf) => {
        console.log("[3D] GLTF loaded successfully");
        if (gltfModel) {
          scene.remove(gltfModel);
        }
        gltfModel = gltf.scene;
        lastGltfUrl = gltfUrl;
        scene.add(gltfModel);
        if (modelMesh) {
          modelMesh.visible = false;
        }
        resolve(true);
      },
      (progress) => {
        console.log("[3D] Loading progress:", progress.loaded, "/", progress.total);
      },
      (error) => {
        console.error("[3D] GLTF load error:", error);
        resolve(false);
      }
    );
  });
}

function scaleGltfModel(state) {
  if (!gltfModel) return;
  const { width, depth, height } = computeMassing(state);
  const box = new THREE.Box3().setFromObject(gltfModel);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (!size.x || !size.y || !size.z) return;

  const scaleX = width / size.x;
  const scaleY = height / size.y;
  const scaleZ = depth / size.z;
  const scale = Math.min(scaleX, scaleY, scaleZ);
  gltfModel.scale.set(scale, scale, scale);

  const newBox = new THREE.Box3().setFromObject(gltfModel);
  const center = new THREE.Vector3();
  newBox.getCenter(center);
  gltfModel.position.sub(center);
  gltfModel.position.y += height / 2;
}

function animate(time = 0) {
  if (!animationEnabled) return;
  animationId = window.requestAnimationFrame(animate);
  if (time - lastFrameTime < 1000 / TARGET_FPS) return;
  lastFrameTime = time;
  if (gltfModel) {
    gltfModel.rotation.y += ROTATION_SPEED;
  } else if (modelMesh) {
    modelMesh.rotation.y += ROTATION_SPEED;
  }
  renderer.render(scene, camera);
}

function startAnimation() {
  if (!renderer || !scene || !camera) return;
  if (animationEnabled && animationId) return;
  animationEnabled = true;
  lastFrameTime = 0;
  animationId = window.requestAnimationFrame(animate);
}

function stopAnimation() {
  animationEnabled = false;
  if (animationId) {
    window.cancelAnimationFrame(animationId);
    animationId = null;
  }
}

async function updateModel(state) {
  if (!modelMesh || !camera || !renderer) {
    setupModelViewer(state);
    if (scene) {
      await loadGltfModel(state);
      scaleGltfModel(state);
    }
    return;
  }

  const { width, depth, height } = computeMassing(state);
  if (modelMesh && modelMesh.visible) {
    modelMesh.scale.set(width, height, depth);
    modelMesh.position.set(0, height / 2, 0);
  }
  await loadGltfModel(state);
  scaleGltfModel(state);
  camera.position.set(width * 1.2, height * 0.8, depth * 1.4);
}

function handleResize() {
  if (!renderer || !camera || !modelCanvas) return;
  const aspect = modelCanvas.clientWidth / modelCanvas.clientHeight || 1;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setSize(modelCanvas.clientWidth, modelCanvas.clientHeight, false);
}

function renderAll(state) {
  latestState = state || {};
  bindPlanControls();
  renderPlan(state || {});
  updateModel(state || {});
}

window.addEventListener("ai-designer:state", (event) => {
  renderAll(event.detail);
});

window.addEventListener("resize", handleResize);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

if (window.aiDesignerState) {
  renderAll(window.aiDesignerState);
} else {
  renderAll({});
}
