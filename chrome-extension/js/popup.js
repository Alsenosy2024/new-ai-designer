/**
 * AI Architect Designer - Popup Script
 */

// API Configuration
const API_BASE = 'http://localhost:8001';
const API_ENDPOINTS = {
  state: '/api/state',
  runs: '/api/runs/start',
  events: '/api/runs/{id}/events'
};

// State
let currentProject = null;
let currentRun = null;
let designResults = null;

// DOM Elements
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),

  // Server Status
  serverStatus: document.getElementById('serverStatus'),

  // Project Form
  projectForm: document.getElementById('projectForm'),
  projectName: document.getElementById('projectName'),
  region: document.getElementById('region'),
  buildingType: document.getElementById('buildingType'),
  gfa: document.getElementById('gfa'),
  floors: document.getElementById('floors'),
  coreRatio: document.getElementById('coreRatio'),
  budget: document.getElementById('budget'),
  brief: document.getElementById('brief'),

  // Design Tab
  agentArch: document.getElementById('agentArch'),
  agentStruct: document.getElementById('agentStruct'),
  agentMep: document.getElementById('agentMep'),
  agentInterior: document.getElementById('agentInterior'),
  maxIterations: document.getElementById('maxIterations'),
  autoResolve: document.getElementById('autoResolve'),
  startDesign: document.getElementById('startDesign'),

  // Progress
  progressSection: document.getElementById('progressSection'),
  progressFill: document.getElementById('progressFill'),
  progressStatus: document.getElementById('progressStatus'),
  agentStatusList: document.getElementById('agentStatusList'),

  // Results
  noResults: document.getElementById('noResults'),
  resultsContent: document.getElementById('resultsContent'),
  buildingDims: document.getElementById('buildingDims'),
  efficiency: document.getElementById('efficiency'),
  energyLoad: document.getElementById('energyLoad'),
  conflictsResolved: document.getElementById('conflictsResolved'),

  archResults: document.getElementById('archResults'),
  structResults: document.getElementById('structResults'),
  mepResults: document.getElementById('mepResults'),
  interiorResults: document.getElementById('interiorResults'),
  conflictsResults: document.getElementById('conflictsResults'),

  exportResults: document.getElementById('exportResults'),
  openViewer: document.getElementById('openViewer')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAccordion();
  loadSavedData();
  checkServerStatus();
  bindEvents();
});

// Tab Navigation
function initTabs() {
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      elements.tabs.forEach(t => t.classList.remove('active'));
      elements.tabContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`${targetTab}Tab`).classList.add('active');
    });
  });
}

// Accordion
function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('open');
    });
  });
}

// Load Saved Data
function loadSavedData() {
  chrome.storage.local.get(['project', 'results'], (data) => {
    if (data.project) {
      currentProject = data.project;
      populateForm(data.project);
    }
    if (data.results) {
      designResults = data.results;
      displayResults(data.results);
    }
  });
}

// Populate Form
function populateForm(project) {
  elements.projectName.value = project.name || '';
  elements.region.value = project.region || 'saudi';
  elements.buildingType.value = project.building_type || 'office';
  elements.gfa.value = project.gfa || 10000;
  elements.floors.value = project.floors || 10;
  elements.coreRatio.value = (project.core_ratio || 0.15) * 100;
  elements.budget.value = project.budget || 'standard';
  elements.brief.value = project.brief || '';
}

// Check Server Status
async function checkServerStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/state`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      setServerStatus(true);
    } else {
      setServerStatus(false);
    }
  } catch (error) {
    setServerStatus(false);
  }
}

function setServerStatus(online) {
  const dot = elements.serverStatus.querySelector('.status-dot');
  const text = elements.serverStatus.querySelector('.status-text');

  if (online) {
    dot.classList.add('online');
    dot.classList.remove('offline');
    text.textContent = 'متصل';
  } else {
    dot.classList.remove('online');
    dot.classList.add('offline');
    text.textContent = 'غير متصل';
  }
}

// Bind Events
function bindEvents() {
  // Save Project
  elements.projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProject();
  });

  // Start Design
  elements.startDesign.addEventListener('click', startDesign);

  // Export Results
  elements.exportResults.addEventListener('click', exportResults);

  // Open Viewer
  elements.openViewer.addEventListener('click', openViewer);
}

// Save Project
function saveProject() {
  currentProject = {
    name: elements.projectName.value,
    region: elements.region.value,
    building_type: elements.buildingType.value,
    gfa: parseInt(elements.gfa.value),
    floors: parseInt(elements.floors.value),
    core_ratio: parseInt(elements.coreRatio.value) / 100,
    budget: elements.budget.value,
    brief: elements.brief.value
  };

  chrome.storage.local.set({ project: currentProject }, () => {
    showNotification('تم حفظ المشروع بنجاح');

    // Switch to design tab
    document.querySelector('[data-tab="design"]').click();
  });
}

// Start Design
async function startDesign() {
  if (!currentProject) {
    showNotification('يرجى حفظ المشروع أولاً', 'error');
    return;
  }

  // Get selected agents
  const agents = {
    architectural: elements.agentArch.checked,
    structural: elements.agentStruct.checked,
    mep: elements.agentMep.checked,
    interior: elements.agentInterior.checked
  };

  const config = {
    max_iterations: parseInt(elements.maxIterations.value),
    auto_resolve: elements.autoResolve.checked
  };

  // Show progress
  showProgress();

  try {
    // Run design locally (simulation for extension)
    const results = await runDesignSimulation(currentProject, agents, config);

    // Save and display results
    designResults = results;
    chrome.storage.local.set({ results: results });

    hideProgress();
    displayResults(results);

    // Switch to results tab
    document.querySelector('[data-tab="results"]').click();

  } catch (error) {
    hideProgress();
    showNotification('حدث خطأ أثناء التصميم: ' + error.message, 'error');
  }
}

// Run Design Simulation
async function runDesignSimulation(project, agents, config) {
  // Update progress stages
  const stages = [];
  if (agents.architectural) stages.push({ name: 'architectural', label: 'التصميم المعماري' });
  if (agents.structural) stages.push({ name: 'structural', label: 'الهيكل الإنشائي' });
  if (agents.mep) stages.push({ name: 'mep', label: 'أنظمة MEP' });
  if (agents.interior) stages.push({ name: 'interior', label: 'التصميم الداخلي' });
  stages.push({ name: 'coordination', label: 'التنسيق وحل التعارضات' });

  // Initialize agent status
  updateAgentStatus(stages.map(s => ({ name: s.name, label: s.label, status: 'pending' })));

  // Simulate each stage
  const results = {
    project: project,
    components: {},
    metrics: {},
    conflicts: { resolved: [], unresolved: [] }
  };

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];

    // Update status
    updateAgentStatus(stages.map((s, idx) => ({
      name: s.name,
      label: s.label,
      status: idx < i ? 'done' : idx === i ? 'running' : 'pending'
    })));

    updateProgress((i / stages.length) * 100, `جاري ${stage.label}...`);

    // Simulate processing time
    await delay(800 + Math.random() * 400);

    // Generate mock results based on stage
    if (stage.name === 'architectural') {
      results.components.architectural = generateArchResults(project);
    } else if (stage.name === 'structural') {
      results.components.structural = generateStructResults(project);
    } else if (stage.name === 'mep') {
      results.components.mep = generateMepResults(project);
    } else if (stage.name === 'interior') {
      results.components.interior = generateInteriorResults(project);
    } else if (stage.name === 'coordination') {
      results.conflicts = generateConflicts(project);
    }
  }

  // Final metrics
  results.metrics = calculateMetrics(results);

  // Mark all done
  updateAgentStatus(stages.map(s => ({ name: s.name, label: s.label, status: 'done' })));
  updateProgress(100, 'اكتمل التصميم!');

  await delay(500);

  return results;
}

// Generate Mock Results
function generateArchResults(project) {
  const floorArea = project.gfa / project.floors;
  const aspectRatio = 1.3;
  const width = Math.sqrt(floorArea * aspectRatio);
  const depth = floorArea / width;
  const height = project.floors * 3.6;

  return {
    massing: {
      width: Math.round(width * 10) / 10,
      depth: Math.round(depth * 10) / 10,
      height: Math.round(height * 10) / 10,
      floors: project.floors,
      floor_height: 3.6,
      form_type: 'rectangular'
    },
    metrics: {
      gross_floor_area: project.gfa,
      net_floor_area: project.gfa * (1 - project.core_ratio),
      efficiency_ratio: (1 - project.core_ratio) * 100,
      facade_area: 2 * (width + depth) * height
    },
    floor_plans_count: project.floors
  };
}

function generateStructResults(project) {
  const floorArea = project.gfa / project.floors;
  const gridModule = 8.4;
  const columnsX = Math.ceil(Math.sqrt(floorArea / 1.3) / gridModule) + 1;
  const columnsY = Math.ceil(Math.sqrt(floorArea * 1.3) / gridModule) + 1;

  return {
    system: project.floors > 25 ? 'core_outrigger' : 'moment_frame',
    material: project.floors > 30 ? 'composite' : 'concrete',
    columns_count: columnsX * columnsY,
    beams_count: (columnsX - 1) * columnsY + columnsX * (columnsY - 1),
    analysis: {
      max_drift_ratio: 0.008 + Math.random() * 0.004,
      fundamental_period: 0.05 * project.floors + Math.random() * 0.5
    },
    metrics: {
      concrete_volume: project.gfa * 0.25,
      avg_column_utilization: 0.65 + Math.random() * 0.2
    }
  };
}

function generateMepResults(project) {
  const coolingLoad = project.gfa * 100; // W

  return {
    hvac: {
      system_type: project.gfa > 20000 ? 'variable_air_volume' : 'vrf',
      cooling_capacity_kw: Math.round(coolingLoad / 1000),
      ahus_count: Math.ceil(project.floors / 3)
    },
    electrical: {
      transformer_size_kva: Math.ceil(project.gfa * 0.08 / 100) * 100,
      total_demand_kw: Math.round(project.gfa * 0.06)
    },
    plumbing: {
      risers_count: 4,
      fixtures_count: Math.round(project.gfa / 15)
    },
    metrics: {
      cooling_w_per_m2: 100,
      electrical_w_per_m2: 60,
      estimated_eui: 150 + Math.random() * 50
    }
  };
}

function generateInteriorResults(project) {
  return {
    style: 'modern',
    grade: project.budget,
    furniture_items: Math.round(project.gfa / 12),
    lighting_fixtures: Math.round(project.gfa / 5),
    finish_schedule: {
      floor: 'porcelain_tile',
      wall: 'painted_drywall',
      ceiling: 'acoustic_panel'
    },
    ffe_budget: {
      total: project.gfa * (project.budget === 'luxury' ? 500 : project.budget === 'premium' ? 300 : 150),
      currency: 'USD'
    }
  };
}

function generateConflicts(project) {
  const resolvedCount = Math.round(10 + project.floors * 5 + Math.random() * 20);
  const unresolvedCount = Math.round(Math.random() * 10);

  return {
    resolved: Array(resolvedCount).fill(null).map((_, i) => ({
      id: `conflict_${i}`,
      type: ['spatial', 'mep_clearance', 'structural'][Math.floor(Math.random() * 3)],
      description: 'تم حل التعارض تلقائياً'
    })),
    unresolved: Array(unresolvedCount).fill(null).map((_, i) => ({
      id: `unresolved_${i}`,
      type: 'review_needed',
      description: 'يحتاج مراجعة يدوية'
    }))
  };
}

function calculateMetrics(results) {
  return {
    total_iterations: 3,
    execution_time: 2.5 + Math.random() * 2,
    convergence_achieved: true,
    resolved_conflicts: results.conflicts.resolved.length,
    unresolved_conflicts: results.conflicts.unresolved.length
  };
}

// Progress UI
function showProgress() {
  document.querySelector('.design-options').classList.add('hidden');
  elements.progressSection.classList.remove('hidden');
}

function hideProgress() {
  elements.progressSection.classList.add('hidden');
  document.querySelector('.design-options').classList.remove('hidden');
}

function updateProgress(percent, status) {
  elements.progressFill.style.width = `${percent}%`;
  elements.progressStatus.textContent = status;
}

function updateAgentStatus(agents) {
  elements.agentStatusList.innerHTML = agents.map(agent => {
    const icons = {
      pending: '⏳',
      running: '🔄',
      done: '✅',
      error: '❌'
    };

    return `
      <div class="agent-status-item ${agent.status}">
        <span class="status-icon">${icons[agent.status]}</span>
        <span>${agent.label}</span>
      </div>
    `;
  }).join('');
}

// Display Results
function displayResults(results) {
  if (!results) return;

  elements.noResults.classList.add('hidden');
  elements.resultsContent.classList.remove('hidden');

  // Summary cards
  const arch = results.components?.architectural;
  const mep = results.components?.mep;

  if (arch) {
    elements.buildingDims.textContent =
      `${arch.massing?.width}×${arch.massing?.depth}×${arch.massing?.height}م`;
    elements.efficiency.textContent =
      `${Math.round(arch.metrics?.efficiency_ratio)}%`;
  }

  if (mep) {
    elements.energyLoad.textContent =
      `${mep.metrics?.estimated_eui?.toFixed(0)} kWh/م²`;
  }

  elements.conflictsResolved.textContent =
    `${results.conflicts?.resolved?.length || 0}`;

  // Detailed results
  if (arch) {
    elements.archResults.innerHTML = `
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">الأبعاد</span>
          <span class="detail-value">${arch.massing?.width}×${arch.massing?.depth}م</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الارتفاع</span>
          <span class="detail-value">${arch.massing?.height}م</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المساحة الصافية</span>
          <span class="detail-value">${Math.round(arch.metrics?.net_floor_area).toLocaleString()} م²</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">مساحة الواجهات</span>
          <span class="detail-value">${Math.round(arch.metrics?.facade_area).toLocaleString()} م²</span>
        </div>
      </div>
    `;
  }

  const struct = results.components?.structural;
  if (struct) {
    elements.structResults.innerHTML = `
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">النظام الإنشائي</span>
          <span class="detail-value">${struct.system}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المادة</span>
          <span class="detail-value">${struct.material}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الأعمدة</span>
          <span class="detail-value">${struct.columns_count}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الكمرات</span>
          <span class="detail-value">${struct.beams_count}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">نسبة الانحراف</span>
          <span class="detail-value">${(struct.analysis?.max_drift_ratio * 100).toFixed(2)}%</span>
        </div>
      </div>
    `;
  }

  if (mep) {
    elements.mepResults.innerHTML = `
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">نظام التكييف</span>
          <span class="detail-value">${mep.hvac?.system_type}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">قدرة التبريد</span>
          <span class="detail-value">${mep.hvac?.cooling_capacity_kw} kW</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">المحولات</span>
          <span class="detail-value">${mep.electrical?.transformer_size_kva} kVA</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">EUI المتوقع</span>
          <span class="detail-value">${mep.metrics?.estimated_eui?.toFixed(0)} kWh/م²/سنة</span>
        </div>
      </div>
    `;
  }

  const interior = results.components?.interior;
  if (interior) {
    elements.interiorResults.innerHTML = `
      <div class="detail-list">
        <div class="detail-item">
          <span class="detail-label">الطراز</span>
          <span class="detail-value">${interior.style}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الأثاث</span>
          <span class="detail-value">${interior.furniture_items} قطعة</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">الإضاءة</span>
          <span class="detail-value">${interior.lighting_fixtures} وحدة</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">ميزانية FF&E</span>
          <span class="detail-value">$${interior.ffe_budget?.total?.toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  // Conflicts
  elements.conflictsResults.innerHTML = `
    <div class="detail-list">
      <div class="detail-item">
        <span class="detail-label">تعارضات محلولة</span>
        <span class="detail-value" style="color: var(--success)">${results.conflicts?.resolved?.length || 0}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">تعارضات معلقة</span>
        <span class="detail-value" style="color: var(--warning)">${results.conflicts?.unresolved?.length || 0}</span>
      </div>
    </div>
  `;
}

// Export Results
function exportResults() {
  if (!designResults) {
    showNotification('لا توجد نتائج للتصدير', 'error');
    return;
  }

  const blob = new Blob([JSON.stringify(designResults, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: `design_report_${Date.now()}.json`
  });

  showNotification('تم تصدير التقرير');
}

// Open 3D Viewer
function openViewer() {
  chrome.tabs.create({ url: `${API_BASE}/outputs.html` });
}

// Utilities
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'success') {
  // Simple alert for now
  alert(message);
}
