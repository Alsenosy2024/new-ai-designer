/**
 * AI Architect Designer - Background Service Worker
 */

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI Architect Designer installed');

    // Set default settings
    chrome.storage.local.set({
      settings: {
        apiUrl: 'http://localhost:8001',
        language: 'ar',
        autoSave: true,
        notifications: true
      }
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkServer') {
    checkServerStatus(request.apiUrl)
      .then(online => sendResponse({ online }))
      .catch(() => sendResponse({ online: false }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'runDesign') {
    runDesignPipeline(request.project, request.config)
      .then(results => sendResponse({ success: true, results }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Check server status
async function checkServerStatus(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/api/state`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Run design pipeline via API
async function runDesignPipeline(project, config) {
  const settings = await chrome.storage.local.get('settings');
  const apiUrl = settings.settings?.apiUrl || 'http://localhost:8001';

  // Create/update project
  const stateResponse = await fetch(`${apiUrl}/api/state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ project })
  });

  if (!stateResponse.ok) {
    throw new Error('Failed to save project');
  }

  // Start design run
  const runResponse = await fetch(`${apiUrl}/api/runs/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(config)
  });

  if (!runResponse.ok) {
    throw new Error('Failed to start design run');
  }

  const runData = await runResponse.json();
  return runData;
}

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openDesigner',
    title: 'Open AI Architect Designer',
    contexts: ['action']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openDesigner') {
    chrome.action.openPopup();
  }
});
