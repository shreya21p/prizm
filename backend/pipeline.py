"""
pipeline.py — the three-stage Prizm pipeline

STAGE 1  source_check(headline)            → signal string
STAGE 2  context_collapse_map(headline)    → {persona_id: reaction_text}
STAGE 3  safe_rewrite(headline, reactions) → rewrite string

Stages are DISCRETE functions.  They share no state.  The orchestrator
in main.py calls them and stitches the result together.

Stage 2 fires all 12 persona calls in parallel via asyncio.gather().
"""

from __future__ import annotations

import asyncio
import logging
from typing import Dict, Literal

from config import STAGE1_KEY, key_pool, settings
from llm_client import call_groq_with_fallback
from personas import PERSONAS
from sources import SOURCE_NAMES

logger = logging.getLogger("prizm.pipeline")

# ── Type alias ───────────────────────────────────────────────────────────────
SourceSignal = Literal[
    "well-supported by credible sources",
    "contested across sources",
    "no credible source found",
]

VALID_SIGNALS: tuple[str, ...] = (
    "well-supported by credible sources",
    "contested across sources",
    "no credible source found",
)

# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 1 — Source Check
# ─────────────────────────────────────────────────────────────────────────────

_STAGE1_PROMPT_TEMPLATE = """\
You are a fact-checking assistant for an Indian news verification tool called Prizm.

Your task is to evaluate whether the following headline is supported by credible Indian news sources.

HEADLINE: "{headline}"

The credible Indian news sources you should consider are:
{sources}

Based on your knowledge of these sources and the headline, determine which of the following THREE signals best describes the sourcing status:

1. "well-supported by credible sources"  — Multiple outlets from the list above would clearly cover and corroborate this claim.
2. "contested across sources"            — Some sources would report it but framing or facts would differ significantly, OR the claim is partially verifiable.
3. "no credible source found"            — This claim appears unverifiable, fabricated, or outside the scope of these outlets.

IMPORTANT RULES:
- Return ONLY one of those three exact strings. No explanation. No punctuation. No quotes around your answer.
- Never return a percentage, score, or probability.
- Never invent source names or URLs.

Your answer:"""


async def source_check(headline: str, fallback_signal: str = "contested across sources") -> tuple[str, bool]:
    """
    Stage 1: Returns (signal, used_fallback).

    Uses STAGE1_KEY (dedicated, never shared with persona pool).
    Falls back to `fallback_signal` if the API call fails.
    """
    sources_list = "\n".join(f"- {s}" for s in SOURCE_NAMES)
    prompt = _STAGE1_PROMPT_TEMPLATE.format(
        headline=headline,
        sources=sources_list,
    )

    raw, used_fallback = await call_groq_with_fallback(
        prompt=prompt,
        api_key=STAGE1_KEY,
        fallback_text=fallback_signal,
        temperature=0.1,   # Low temperature: we want a deterministic signal
        max_tokens=32,
    )

    # Normalise the response — model sometimes wraps in quotes or adds punctuation
    cleaned = raw.strip().strip('"').strip("'").rstrip(".").lower()

    # Map to canonical signal
    if "well-supported" in cleaned or "well supported" in cleaned:
        signal: str = "well-supported by credible sources"
    elif "contested" in cleaned:
        signal = "contested across sources"
    else:
        signal = "no credible source found"

    logger.info("Stage 1 | signal=%s | fallback=%s", signal, used_fallback)
    return signal, used_fallback


# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 2 — Context Collapse Map (12 parallel persona calls)
# ─────────────────────────────────────────────────────────────────────────────

_PERSONA_PROMPT_TEMPLATE = """\
You are simulating how a specific person in India would instinctively react to a news headline.

PERSONA: {label}
PERSONA DESCRIPTION: {description}

HEADLINE: "{headline}"

Write a single, natural first-person reaction (1–3 sentences) as this person would think or say when they first read this headline.

Rules:
- Stay in character. Use the person's economic, political, and cultural lens.
- Be specific and concrete. Avoid generic reactions.
- Do NOT evaluate whether the headline is true or false.
- Do NOT break character or add meta-commentary.
- Write in plain English (not Hinglish, not formal prose).
- 1–3 sentences only. No bullet points.

Reaction:"""


async def _single_persona_call(
    persona_id: str,
    label: str,
    description: str,
    headline: str,
    fallback_text: str,
) -> tuple[str, str, bool]:
    """
    Fires a single persona LLM call.  Draws the next key from the round-robin pool.

    Returns: (persona_id, reaction_text, used_fallback)
    """
    api_key = key_pool.next()          # round-robin: each of the 12 calls gets a different key
    prompt = _PERSONA_PROMPT_TEMPLATE.format(
        label=label,
        description=description,
        headline=headline,
    )

    text, used_fallback = await call_groq_with_fallback(
        prompt=prompt,
        api_key=api_key,
        fallback_text=fallback_text,
        temperature=0.85,   # Higher variance: we WANT divergent reactions
        max_tokens=200,
    )

    logger.debug("Stage 2 | persona=%s | fallback=%s", persona_id, used_fallback)
    return persona_id, text, used_fallback


async def context_collapse_map(
    headline: str,
    fallback_reactions: Dict[str, str] | None = None,
) -> tuple[Dict[str, str], bool]:
    """
    Stage 2: fires all 12 persona calls IN PARALLEL via asyncio.gather().

    Returns:
        ({persona_id: reaction_text}, any_used_fallback)

    If `fallback_reactions` is provided, individual failed persona calls
    will draw from it.  If a persona is missing from the fallback dict,
    a generic string is used.
    """
    fallback_reactions = fallback_reactions or {}
    reactions: Dict[str, str] = {}
    any_fallback = False

    # Split the 12 personas into batches of 3 to avoid concurrency rate limits.
    # If we only have 1 valid key in the pool, reduce batch size to 2 to minimize concurrent pressure.
    batch_size = 3
    if len(key_pool) == 1:
        batch_size = 2

    for i in range(0, len(PERSONAS), batch_size):
        batch = PERSONAS[i:i + batch_size]

        async def _staggered_call(p_dict, delay: float):
            if delay > 0:
                await asyncio.sleep(delay)
            return await _single_persona_call(
                persona_id=p_dict["id"],
                label=p_dict["label"],
                description=p_dict["description"],
                headline=headline,
                fallback_text=fallback_reactions.get(
                    p_dict["id"],
                    f"[Fallback] As a {p_dict['label']}, this headline makes me reflect on how it affects my daily reality.",
                ),
            )

        tasks = [
            _staggered_call(p, idx * 0.15)
            for idx, p in enumerate(batch)
        ]

        # Run the current batch in parallel
        results = await asyncio.gather(*tasks, return_exceptions=False)

        for persona_id, text, used_fallback in results:
            reactions[persona_id] = text
            if used_fallback:
                any_fallback = True

        # Sleep briefly between batches if there are more personas to process
        if i + batch_size < len(PERSONAS):
            await asyncio.sleep(1.2)

    logger.info("Stage 2 | %d personas completed | any_fallback=%s", len(reactions), any_fallback)
    return reactions, any_fallback


# ─────────────────────────────────────────────────────────────────────────────
#  STAGE 3 — Safe Rewrite
# ─────────────────────────────────────────────────────────────────────────────

_STAGE3_PROMPT_TEMPLATE = """\
You are a communication expert helping to reduce misinterpretation of a public message.

ORIGINAL HEADLINE: "{headline}"

Below are 12 different real-world audience segments and how they each interpreted this headline:

{reactions_block}

Your task: rewrite the original headline (or expand it into a 2–3 sentence statement) so that:
1. The core factual message is preserved.
2. The number of wildly divergent interpretations is minimised.
3. Language that triggers strong partisan, caste-based, or class-based reactions is replaced with precise, neutral phrasing.
4. It does NOT become bland or evasive — it should still be direct and informative.

Output ONLY the rewritten text. No explanation. No bullet points. No "Rewrite:" prefix.

Rewritten statement:"""


async def safe_rewrite(
    headline: str,
    reactions: Dict[str, str],
    fallback_rewrite: str = "",
) -> tuple[str, bool]:
    """
    Stage 3: generates a variance-reducing rewrite.

    Draws the next key from the round-robin pool (continues the cycle).
    Falls back to `fallback_rewrite` if the call fails.
    """
    # Build a readable reactions block for the prompt
    persona_map = {p["id"]: p["label"] for p in PERSONAS}
    reactions_block = "\n".join(
        f"- {persona_map.get(pid, pid)}: {text}"
        for pid, text in reactions.items()
    )

    prompt = _STAGE3_PROMPT_TEMPLATE.format(
        headline=headline,
        reactions_block=reactions_block,
    )

    api_key = key_pool.next()   # continues round-robin from where Stage 2 left off

    default_fallback = (
        f"[Rewrite unavailable] Original: {headline} "
        "(Please try again — the rewrite service is temporarily overloaded.)"
    )

    text, used_fallback = await call_groq_with_fallback(
        prompt=prompt,
        api_key=api_key,
        fallback_text=fallback_rewrite or default_fallback,
        temperature=0.4,   # Lower variance: we want a polished, deliberate rewrite
        max_tokens=300,
    )

    logger.info("Stage 3 | rewrite_len=%d | fallback=%s", len(text), used_fallback)
    return text, used_fallback
