// Netlify Serverless Function for AI Architect Designer API

// In-memory storage (resets on cold start)
let storage = {
  project: null,
  run: null,
  outputs: null
};

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '') || '/';
  const method = event.httpMethod;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Health check
    if (path === '/health' || path === '/health/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() })
      };
    }

    // Root
    if (path === '/' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'AI Architect Designer API', version: '1.0.0' })
      };
    }

    // GET /state
    if (path === '/state' && method === 'GET') {
      if (!storage.project) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ detail: 'No project found' })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          project: storage.project,
          run: storage.run,
          outputs: storage.outputs
        })
      };
    }

    // POST /state
    if (path === '/state' && method === 'POST') {
      const payload = JSON.parse(event.body);
      const projectId = payload.project?.id || crypto.randomUUID();

      storage.project = {
        id: projectId,
        name: payload.project?.name || 'Untitled',
        region: payload.project?.region || '',
        building_type: payload.project?.type || 'office',
        phase: payload.project?.phase || '',
        gfa: payload.project?.gfa || '',
        floors: payload.project?.floors || '',
        status: payload.project?.status || 'active',
        brief: payload.project?.brief || '',
        core_ratio: payload.project?.core_ratio || '',
        parking: payload.project?.parking || '',
        budget: payload.project?.budget || '',
        structural_system: payload.project?.structural_system || '',
        mep_strategy: payload.project?.mep_strategy || ''
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          project: storage.project,
          run: storage.run,
          outputs: storage.outputs
        })
      };
    }

    // POST /runs/start
    if ((path === '/runs/start' || path.startsWith('/runs/start')) && method === 'POST') {
      if (!storage.project) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ detail: 'No project found' })
        };
      }

      const runId = crypto.randomUUID();
      storage.run = {
        id: runId,
        status: 'Complete',
        conflicts: '0 conflicts',
        updated_at: new Date().toISOString()
      };

      storage.project.status = 'Review';
      storage.project.next_run = 'Client review';

      const projectName = storage.project.name.replace(/\s/g, '');
      const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      storage.outputs = {
        id: crypto.randomUUID(),
        clash_density: `${randomFloat(1, 5)}%`,
        structural_variance: `${randomFloat(70, 85)}%`,
        compliance: `${randomInt(92, 98)}%`,
        energy: `EUI ${randomInt(95, 115)}`,
        clash_free: parseFloat(randomFloat(95, 99)),
        energy_score: parseFloat(randomFloat(88, 95)),
        structural_score: parseFloat(randomFloat(87, 94)),
        ifc_file: `${projectName}_v10.ifc`,
        mep_schedule_file: `${projectName}_MEP_Schedule.xlsx`,
        energy_report_file: `${projectName}_Energy_Report.pdf`,
        plan_svg_file: `${projectName}_plan.svg`,
        gltf_file: `${projectName}_massing.gltf`,
        generated_at: 'Generated moments ago'
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          project: storage.project,
          run: storage.run,
          outputs: storage.outputs
        })
      };
    }

    // GET /runs/:id/events
    if (path.match(/\/runs\/[\w-]+\/events/) && method === 'GET') {
      const runId = path.split('/')[2];
      const events = [
        { id: crypto.randomUUID(), run_id: runId, message: 'Starting architectural analysis', level: 'info', step: 'architecture' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Floor plans generated', level: 'success', step: 'architecture' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Starting structural analysis', level: 'info', step: 'structural' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Structural system selected', level: 'success', step: 'structural' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Starting MEP design', level: 'info', step: 'mep' },
        { id: crypto.randomUUID(), run_id: runId, message: 'HVAC system designed', level: 'success', step: 'mep' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Resolving conflicts', level: 'info', step: 'coordination' },
        { id: crypto.randomUUID(), run_id: runId, message: 'Design complete', level: 'success', step: 'finalization' }
      ];
      return { statusCode: 200, headers, body: JSON.stringify(events) };
    }

    // GET /agents/status
    if (path === '/agents/status' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          agents: [
            { name: 'architectural', status: 'ready', domain: 'architecture' },
            { name: 'structural', status: 'ready', domain: 'structure' },
            { name: 'mep', status: 'ready', domain: 'mep' },
            { name: 'interior', status: 'ready', domain: 'interior' }
          ]
        })
      };
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ detail: 'Not found', path, method })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
