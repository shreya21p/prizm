"""
sources.py — curated allowlist of credible Indian news sources

Used by Stage 1 (source check) so the LLM is anchored to a known,
demo-reliable set of outlets rather than hallucinating URLs.

The list is intentionally cross-ideological — we are checking SOURCE
CREDIBILITY, not editorial stance.  The LLM is given these names and
asked which of them would publish/corroborate the headline, then returns
one of three signals.

Adding a source: append a dict with name + url + type.
"""

from typing import List, TypedDict


class NewsSource(TypedDict):
    name: str
    url: str
    type: str          # 'national_english' | 'national_hindi' | 'regional' | 'wire' | 'public_broadcaster'


CREDIBLE_SOURCES: List[NewsSource] = [
    # ── Wire services ────────────────────────────────────────────
    {"name": "PTI (Press Trust of India)", "url": "ptinews.com",         "type": "wire"},
    {"name": "ANI (Asian News International)", "url": "aninews.in",       "type": "wire"},
    {"name": "The Wire",                   "url": "thewire.in",           "type": "wire"},

    # ── National English dailies ──────────────────────────────────
    {"name": "The Hindu",                  "url": "thehindu.com",         "type": "national_english"},
    {"name": "Hindustan Times",            "url": "hindustantimes.com",   "type": "national_english"},
    {"name": "The Indian Express",         "url": "indianexpress.com",    "type": "national_english"},
    {"name": "Times of India",             "url": "timesofindia.com",     "type": "national_english"},
    {"name": "Business Standard",          "url": "business-standard.com","type": "national_english"},
    {"name": "The Economic Times",         "url": "economictimes.com",    "type": "national_english"},
    {"name": "Mint",                       "url": "livemint.com",         "type": "national_english"},
    {"name": "The Print",                  "url": "theprint.in",          "type": "national_english"},
    {"name": "Scroll.in",                  "url": "scroll.in",            "type": "national_english"},

    # ── Hindi / vernacular ────────────────────────────────────────
    {"name": "Dainik Bhaskar",             "url": "bhaskar.com",          "type": "national_hindi"},
    {"name": "Amar Ujala",                 "url": "amarujala.com",        "type": "national_hindi"},
    {"name": "NDTV India",                 "url": "ndtv.com/india",       "type": "national_hindi"},

    # ── Public broadcaster ────────────────────────────────────────
    {"name": "DD News",                    "url": "ddnews.gov.in",        "type": "public_broadcaster"},
    {"name": "All India Radio (AIR)",      "url": "newsonair.gov.in",     "type": "public_broadcaster"},
]

# Flat list of source names — used inside LLM prompts
SOURCE_NAMES: List[str] = [s["name"] for s in CREDIBLE_SOURCES]
