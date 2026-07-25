# ==========================================
# AI SERVICE (Groq - OpenAI-compatible, free tier)
# ==========================================
import requests

from app.core.config import (
    GROQ_API_KEY,
    GROQ_MODEL
)


GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


def _require_api_key():
    if not GROQ_API_KEY:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env "
            "to enable AI-powered responses. Get a free key at "
            "https://console.groq.com/keys"
        )


def _call_groq_raw(messages, max_tokens=500):
    _require_api_key()

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens
    }

    try:
        response = requests.post(GROQ_ENDPOINT, json=payload, headers=headers, timeout=30)
    except requests.RequestException:
        raise RuntimeError(
            "Could not reach the AI service. Please try again in a moment."
        )

    if response.status_code != 200:
        try:
            error_detail = response.json().get("error", {}).get("message", response.text)
        except ValueError:
            error_detail = response.text
        raise RuntimeError(
            f"The AI service returned an error: {error_detail}"
        )

    data = response.json()

    try:
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError):
        raise RuntimeError(
            "The AI service didn't return a usable response."
        )


def call_ai(system_prompt, user_message, max_tokens=500):
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
    return _call_groq_raw(messages, max_tokens)


def call_ai_conversation(system_prompt, history, max_tokens=500):
    if not history:
        return ""
    messages = [{"role": "system", "content": system_prompt}]
    for m in history:
        messages.append({"role": m["role"], "content": m["content"]})
    return _call_groq_raw(messages, max_tokens)