"""
llm_client.py — thin async wrapper around the Groq REST API

Uses standard OpenAI-compatible completions format to interface with Groq,
maintaining the thread-safe round-robin API key rotation.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger("prizm.llm")

# Llama 3.1 8B Instant — blazingly fast (usually > 200 tps) and lightweight
# You can also use "llama-3.3-70b-versatile" for more reasoning-heavy results.
MODEL = "llama-3.1-8b-instant"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


async def call_groq(
    prompt: str,
    api_key: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 512,
    timeout: float | None = None,
) -> str:
    """
    Fire a single Groq ChatCompletions call and return the text response.

    Raises:
        httpx.TimeoutException  – if the call exceeds `timeout` seconds
        RuntimeError            – if the API returns a non-200 status
        ValueError              – if the response has no usable text part
    """
    timeout = timeout or settings.llm_timeout

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    max_retries = 3
    retry_delay = 1.5

    for attempt in range(max_retries):
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(GROQ_API_URL, headers=headers, json=payload)

        if resp.status_code == 200:
            data = resp.json()
            try:
                return data["choices"][0]["message"]["content"].strip()
            except (KeyError, IndexError) as exc:
                raise ValueError(f"Unexpected Groq response shape: {json.dumps(data)[:300]}") from exc

        # If rate limited (429), sleep and retry
        if resp.status_code == 429 and attempt < max_retries - 1:
            sleep_time = retry_delay
            try:
                # Try to get reset time from standard HTTP Retry-After header
                retry_after = resp.headers.get("retry-after")
                if retry_after:
                    sleep_time = float(retry_after)
                else:
                    # Try parsing from Groq's custom error message ("Please try again in X.XXs")
                    err_json = resp.json()
                    err_msg = err_json.get("error", {}).get("message", "")
                    import re
                    match = re.search(r"try again in (\d+(?:\.\d+)?)s", err_msg)
                    if match:
                        sleep_time = float(match.group(1)) + 0.1  # Add a tiny safety buffer
            except Exception:
                pass

            logger.warning(
                "Groq rate limited (429). Retrying in %.2f seconds (attempt %d/%d)...",
                sleep_time, attempt + 1, max_retries
            )
            await asyncio.sleep(sleep_time)
            retry_delay = max(retry_delay * 1.5, sleep_time * 1.5)
            continue

        # For other status codes, log and raise immediately
        logger.error("Groq error %d: %s", resp.status_code, resp.text[:300])
        raise RuntimeError(f"Groq API returned {resp.status_code}: {resp.text[:200]}")


async def call_groq_with_fallback(
    prompt: str,
    api_key: str,
    fallback_text: str,
    *,
    temperature: float = 0.7,
    max_tokens: int = 512,
) -> tuple[str, bool]:
    """
    Attempts a live Groq call. If it times out or errors, returns
    `fallback_text` instead.

    Returns:
        (text, used_fallback)
    """
    try:
        text = await call_groq(
            prompt, api_key,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=settings.fallback_timeout,
        )
        return text, False
    except Exception as exc:  # noqa: BLE001
        logger.warning("Groq call failed (%s: %s); serving cached fallback.", type(exc).__name__, exc, exc_info=True)
        return fallback_text, True
