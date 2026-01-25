import json
import re
from typing import Any, Dict, Optional

import httpx

from app.config import (
    GEMINI_API_KEY,
    GEMINI_AUTH_MODE,
    GEMINI_MODEL,
    GEMINI_BASE_URL,
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_MODEL,
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


def _llm_request(prompt: str) -> Optional[str]:
    if not OPENAI_API_KEY:
        return None

    url = f"{OPENAI_BASE_URL}/chat/completions"
    payload = {
        "model": OPENAI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": LLM_TEMPERATURE,
        "max_tokens": LLM_MAX_TOKENS,
    }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = httpx.post(
            url,
            headers=headers,
            json=payload,
            timeout=LLM_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, json.JSONDecodeError):
        return None

    choices = data.get("choices") or []
    if not choices:
        return None

    return choices[0].get("message", {}).get("content")


def _resolve_gemini_url(model: Optional[str] = None) -> str:
    base = (GEMINI_BASE_URL or "").rstrip("/")
    if not base:
        base = "https://generativelanguage.googleapis.com/v1beta"
    model_name = model or GEMINI_MODEL
    if base.endswith("/models"):
        return f"{base}/{model_name}:generateContent"
    return f"{base}/models/{model_name}:generateContent"


def _resolve_gemini_auth_mode(api_key: str) -> str:
    mode = (GEMINI_AUTH_MODE or "auto").strip().lower()
    if mode == "auto":
        return "api_key" if (api_key or "").startswith("AIza") else "oauth"
    return mode


def _gemini_request(
    prompt: str,
    model: Optional[str] = None,
    api_key: Optional[str] = None,
) -> Optional[str]:
    api_key = api_key or GEMINI_API_KEY
    if not api_key:
        return None

    url = _resolve_gemini_url(model)
    headers = {"Content-Type": "application/json"}
    params = {}
    auth_mode = _resolve_gemini_auth_mode(api_key)
    if auth_mode == "api_key":
        params["key"] = api_key
    else:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": LLM_TEMPERATURE,
            "maxOutputTokens": LLM_MAX_TOKENS,
        },
    }

    try:
        response = httpx.post(
            url,
            headers=headers,
            params=params,
            json=payload,
            timeout=LLM_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, json.JSONDecodeError):
        return None

    candidates = data.get("candidates") or []
    for candidate in candidates:
        content = candidate.get("content") or {}
        parts = content.get("parts") or []
        texts = [part.get("text") for part in parts if part.get("text")]
        if texts:
            return "".join(texts)
    return None


def _request_llm(prompt: str) -> Optional[str]:
    response = _gemini_request(prompt) if GEMINI_API_KEY else None
    if response:
        return response
    return _llm_request(prompt)


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

    response = _request_llm(prompt)
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
    return _request_llm(prompt)
