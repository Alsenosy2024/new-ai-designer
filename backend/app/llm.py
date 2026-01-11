import json
import re
from typing import Any, Dict, Optional

import httpx

from app.config import (
    GEMINI_API_KEY,
    GEMINI_AUTH_MODE,
    GEMINI_BASE_URL,
    GEMINI_MODEL,
    LLM_MAX_TOKENS,
    LLM_TEMPERATURE,
    LLM_TIMEOUT,
)


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    if not text:
        return None

    fenced = re.findall(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        text = fenced[0]

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _gemini_request(prompt: str) -> Optional[str]:
    if not GEMINI_API_KEY:
        return None

    url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": LLM_TEMPERATURE,
            "maxOutputTokens": LLM_MAX_TOKENS,
        },
    }

    headers = {}
    params = None
    auth_mode = GEMINI_AUTH_MODE.strip().lower()
    if auth_mode == "auto":
        if GEMINI_API_KEY.startswith("AIza"):
            auth_mode = "api_key"
        else:
            auth_mode = "oauth"

    if auth_mode == "oauth":
        headers["Authorization"] = f"Bearer {GEMINI_API_KEY}"
    else:
        params = {"key": GEMINI_API_KEY}

    try:
        response = httpx.post(
            url,
            params=params,
            headers=headers,
            json=payload,
            timeout=LLM_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, json.JSONDecodeError):
        return None

    candidates = data.get("candidates") or []
    if not candidates:
        return None

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        return None

    return parts[0].get("text")


def generate_design_plan(context: Dict[str, Any]) -> Dict[str, Any]:
    prompt = (
        "You are the AI orchestrator for a BIM design platform. "
        "Return JSON only with the following schema:\n"
        "{\n"
        "  \"massing\": {\"width\": number, \"depth\": number, \"floors\": number, \"core_ratio\": number, \"module\": number},\n"
        "  \"structure\": {\"system\": string, \"grid_x\": number, \"grid_y\": number},\n"
        "  \"mep\": {\"strategy\": string, \"risers\": number, \"zones\": number},\n"
        "  \"performance\": {\"energy_target\": string, \"daylight\": string},\n"
        "  \"decisions\": [string, string, string],\n"
        "  \"risks\": [string, string]\n"
        "}\n"
        "Use numeric values for width, depth, floors, core_ratio (0-1), module, grid_x, grid_y. "
        "Keep decisions concise and actionable.\n\n"
        f"Project context:\n{json.dumps(context, ensure_ascii=True, indent=2)}\n"
    )

    response = _gemini_request(prompt)
    data = _extract_json(response or "")
    if not isinstance(data, dict):
        return {}
    return data


def generate_run_summary(context: Dict[str, Any]) -> Optional[str]:
    prompt = (
        "Summarize the BIM run results in 4 short bullet sentences. "
        "Keep it executive and specific to the project inputs.\n\n"
        f"Context:\n{json.dumps(context, ensure_ascii=True, indent=2)}\n"
    )
    return _gemini_request(prompt)
