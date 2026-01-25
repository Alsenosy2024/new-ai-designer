---
name: Extension Testing
description: Skills for testing and verifying the AI Architect Designer Chrome extension.
---

# Extension Testing Skill

This skill provides procedures for verifying the Chrome extension's frontend and its communication with the backend.

## Manual Testing Steps

1.  **Load Extension**:
    - Open `chrome://extensions/`.
    - Enable **Developer mode**.
    - Click **Load unpacked** and select the `chrome-extension` directory.
2.  **Verify Popup**:
    - Click the extension icon in the toolbar.
    - Check if "Project", "Design", and "Results" tabs render correctly.
3.  **Check Connection**:
    - The status dot should be green ("متصل") if `start_server.sh` is running.
    - If disconnected, check the "Options" page (`options.html`) and verify the API URL (usually `http://localhost:8001`).

## UI Simulation (Headless/Browser Agent)
To test without a full extension context:
- Open `chrome-extension/popup.html` directly.
- Note: Some `chrome.*` APIs must be mocked if testing via a standard URL.
- Use `localStorage` as a mock for `chrome.storage.local`.

## Key Files
- `manifest.json`: Extension permissions and background worker.
- `js/popup.js`: Main UI logic and API calls.
- `js/background.js`: Service worker for background tasks.
