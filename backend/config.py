"""
config.py — loads all keys + runtime settings from .env

WHERE TO PUT YOUR KEYS
───────────────────────
1. Copy  backend/.env.example  →  backend/.env
2. Replace every  YOUR_GEMINI_KEY_xx_HERE  with your real key.
3. Restart the server.  That's it.

The module exposes two objects:
  • settings          – scalar config values
  • key_pool          – KeyPool instance for round-robin key dispatch
"""

from __future__ import annotations

import itertools
import os
import threading
from dataclasses import dataclass, field
from typing import List

from dotenv import load_dotenv

load_dotenv()                          # reads backend/.env automatically


# ──────────────────────────────────────────────────────────────
#  Helper to check if a key is a placeholder
# ──────────────────────────────────────────────────────────────
def is_valid_key(key: str | None) -> bool:
    if not key:
        return False
    k = key.strip()
    # A valid Groq API key must start with 'gsk_'
    return k.startswith("gsk_")


# ──────────────────────────────────────────────────────────────
#  Stage-2 / Stage-3 round-robin pool  (keys 02-13)
# ──────────────────────────────────────────────────────────────
_POOL_ENV_NAMES = [f"GROQ_KEY_{i:02d}" for i in range(2, 14)]   # 02 … 13

_RAW_POOL_KEYS: List[str] = [
    os.getenv(name, f"PLACEHOLDER_{name}")
    for name in _POOL_ENV_NAMES
]

# Filter out placeholder keys so they are not cycled
POOL_KEYS: List[str] = [k.strip() for k in _RAW_POOL_KEYS if is_valid_key(k)]

if not POOL_KEYS:
    # If no keys are valid, keep the raw placeholders to avoid division/cycle errors
    POOL_KEYS = _RAW_POOL_KEYS


# ──────────────────────────────────────────────────────────────
#  Stage-1 dedicated key  (source-check call)
# ──────────────────────────────────────────────────────────────
STAGE1_KEY: str = os.getenv("GROQ_KEY_01", "")
if not is_valid_key(STAGE1_KEY):
    # Fallback to the first valid key in the pool if Stage 1 is not configured
    if POOL_KEYS and is_valid_key(POOL_KEYS[0]):
        STAGE1_KEY = POOL_KEYS[0]
    else:
        STAGE1_KEY = "PLACEHOLDER_KEY_01"


# ──────────────────────────────────────────────────────────────
#  Thread-safe round-robin dispatcher
# ──────────────────────────────────────────────────────────────
class KeyPool:
    """
    Hands out API keys in strict round-robin order.
    Thread-safe: safe to call from concurrent asyncio tasks.

    Usage:
        key = key_pool.next()
    """

    def __init__(self, keys: List[str]) -> None:
        self._keys = keys
        self._cycle = itertools.cycle(keys)
        self._lock  = threading.Lock()

    def next(self) -> str:
        with self._lock:
            return next(self._cycle)

    def __len__(self) -> int:
        return len(self._keys)


key_pool = KeyPool(POOL_KEYS)


# ──────────────────────────────────────────────────────────────
#  General settings
# ──────────────────────────────────────────────────────────────
@dataclass
class Settings:
    host: str       = field(default_factory=lambda: os.getenv("HOST",      "0.0.0.0"))
    port: int       = field(default_factory=lambda: int(os.getenv("PORT",  "8000")))
    log_level: str  = field(default_factory=lambda: os.getenv("LOG_LEVEL", "info"))
    # Timeout for each individual LLM call (seconds)
    llm_timeout: float = 12.0
    # If a live call takes longer than this, serve cached fallback
    fallback_timeout: float = 8.0


settings = Settings()
