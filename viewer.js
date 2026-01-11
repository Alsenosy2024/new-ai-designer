const planContainer = document.getElementById("plan-view");
const modelCanvas = document.getElementById("model-view");

let scene;
let camera;
let renderer;
let modelMesh;
let gltfModel;
let gltfLoader;
let animationId;
let lastPlanUrl = "";
let lastGltfUrl = "";

function parseNumber(value, fallback) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/[\d.]+/);
  return match ? Number(match[0]) : fallback;
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

function resolveFileUrl(state, fileName) {
  if (!fileName || !state?.project?.id || !state?.run?.id) return null;
  const base =
    window.aiDesignerFilesBase ||
    (window.location.origin === "null" ? "" : window.location.origin);
  if (!base) return null;
  return `${base}/files/${state.project.id}/${state.run.id}/${fileName}`;
}

async function renderPlan(state) {
  if (!planContainer) return;
  const planUrl = resolveFileUrl(state, state?.outputs?.planSvgFile);
  if (planUrl && planUrl !== lastPlanUrl) {
    try {
      const response = await fetch(planUrl);
      if (response.ok) {
        const svg = await response.text();
        planContainer.innerHTML = svg;
        lastPlanUrl = planUrl;
        return;
      }
    } catch (error) {
      // Fall back to generated SVG.
    }
  }
  const { width, depth } = computeMassing(state);
  const coreWidth = width * 0.3;
  const coreDepth = depth * 0.4;
  const coreX = (width - coreWidth) / 2;
  const coreY = (depth - coreDepth) / 2;

  planContainer.innerHTML = `
    <svg viewBox="0 0 ${width} ${depth}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${width - 1}" height="${depth - 1}" fill="#fbf6ef" stroke="#c7b8a8" stroke-width="0.6" />
      <rect x="${coreX}" y="${coreY}" width="${coreWidth}" height="${coreDepth}" fill="#e6d9cb" stroke="#b8a897" stroke-width="0.5" />
      <line x1="${width * 0.25}" y1="1" x2="${width * 0.25}" y2="${depth - 1}" stroke="#e0d2c2" stroke-width="0.4" />
      <line x1="${width * 0.5}" y1="1" x2="${width * 0.5}" y2="${depth - 1}" stroke="#e0d2c2" stroke-width="0.4" />
      <line x1="${width * 0.75}" y1="1" x2="${width * 0.75}" y2="${depth - 1}" stroke="#e0d2c2" stroke-width="0.4" />
    </svg>
  `;
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
  renderer.setPixelRatio(window.devicePixelRatio || 1);
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

  animate();
}

async function loadGltfModel(state) {
  if (!window.THREE || !window.THREE.GLTFLoader) return false;
  const gltfUrl = resolveFileUrl(state, state?.outputs?.gltfFile);
  if (!gltfUrl || gltfUrl === lastGltfUrl) return Boolean(gltfModel);
  if (!gltfLoader) {
    gltfLoader = new THREE.GLTFLoader();
  }
  return new Promise((resolve) => {
    gltfLoader.load(
      gltfUrl,
      (gltf) => {
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
      undefined,
      () => resolve(false)
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

function animate() {
  animationId = window.requestAnimationFrame(animate);
  if (gltfModel) {
    gltfModel.rotation.y += 0.003;
  } else if (modelMesh) {
    modelMesh.rotation.y += 0.003;
  }
  renderer.render(scene, camera);
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
  renderer.setSize(modelCanvas.clientWidth, modelCanvas.clientHeight, false);
}

function renderAll(state) {
  renderPlan(state);
  updateModel(state);
}

window.addEventListener("ai-designer:state", (event) => {
  renderAll(event.detail);
});

window.addEventListener("resize", handleResize);

if (window.aiDesignerState) {
  renderAll(window.aiDesignerState);
} else {
  renderAll({});
}
