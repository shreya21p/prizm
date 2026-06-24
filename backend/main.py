"""
main.py — FastAPI application entry point

ENDPOINTS
─────────
POST /analyze          → runs the full 3-stage pipeline
GET  /health           → liveness probe
GET  /cached-headlines → lists the 3 pre-baked demo headlines

HOW TO RUN
──────────
  cd backend
  pip install -r requirements.txt
  cp .env.example .env   # fill in your keys
  uvicorn main:app --reload
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from cache import get_cached, list_cached_headlines
from pipeline import context_collapse_map, safe_rewrite, source_check

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("prizm.main")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Prizm API",
    version="0.1.0",
    description=(
        "Three-stage pipeline: (1) Source check → (2) 12-persona context collapse → "
        "(3) Variance-reducing safe rewrite."
    ),
)

# Allow the React frontend (any localhost port during dev) to call this API.
# In production, lock this down to your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response schemas ────────────────────────────────────────────────

class CognitiveProfile(BaseModel):
    origin: Optional[str] = None
    language: Optional[str] = None
    profession: Optional[str] = None
    audience: Optional[str] = None


class AnalyzeRequest(BaseModel):
    headline: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="The news headline or message to analyse.",
        examples=["Govt announces new farm loan waiver scheme"],
    )
    use_cache: bool = Field(
        default=True,
        description=(
            "If true (default), serve pre-baked cached response for known demo headlines "
            "rather than making live API calls.  Set to false to always hit the live API."
        ),
    )
    cognitive_profile: Optional[CognitiveProfile] = None
    intended_meaning: Optional[str] = Field(
        default=None,
        description="The author's intended meaning behind the statement."
    )


class PersonaReaction(BaseModel):
    id: str
    label: str
    emoji: str
    reaction: str


class EmpathyPersonaResult(BaseModel):
    id: str
    zone: str
    distance: float
    similarity: float
    reached: bool


class EmpathyResult(BaseModel):
    empathy_reach: int
    profile_benchmark: float
    reach_sentence: str
    benchmark_sentence: str
    personas: list[EmpathyPersonaResult]


class MeaningHalfLifeResult(BaseModel):
    original_meaning: str
    emergent_meanings: list[str]
    meaning_retention_score: int
    meaning_half_life: str
    final_interpretation: str


class AnalyzeResponse(BaseModel):
    headline: str
    # Stage 1
    source_signal: str
    # Stage 2
    persona_reactions: list[PersonaReaction]
    # Stage 3
    safe_rewrite: str
    # Meta
    served_from_cache: bool
    any_stage_used_fallback: bool
    elapsed_ms: int
    empathy_result: Optional[EmpathyResult] = None
    meaning_half_life: Optional[MeaningHalfLifeResult] = None


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    persona_id: str = Field(..., description="ID of the persona to chat with")
    headline: str = Field(..., description="The original headline context")
    initial_reaction: str = Field(..., description="The persona's initial reaction from Stage 2")
    messages: list[ChatMessage] = Field(default_factory=list, description="Prior conversation turns")
    user_message: str = Field(..., description="The new user message")


class ChatResponse(BaseModel):
    reply: str
    persona_id: str


# ── Helper ────────────────────────────────────────────────────────────────────

def _build_persona_reactions(
    reactions: Dict[str, str],
) -> list[PersonaReaction]:
    """Merges pipeline output with persona metadata for the response."""
    from personas import PERSONAS

    id_to_meta = {p["id"]: p for p in PERSONAS}
    out: list[PersonaReaction] = []
    for persona_id, reaction_text in reactions.items():
        meta = id_to_meta.get(persona_id, {"label": persona_id, "emoji": "👤"})
        out.append(PersonaReaction(
            id=persona_id,
            label=meta["label"],
            emoji=meta["emoji"],
            reaction=reaction_text,
        ))
    return out


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def playground() -> HTMLResponse:
    """Mounts the developer interactive playground cockpit."""
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prizm - Developer Cockpit</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0c10;
            --card-bg: rgba(255, 255, 255, 0.03);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-color: #f3f4f6;
            --text-muted: #9ca3af;
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --green: #10b981;
            --amber: #f59e0b;
            --red: #ef4444;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(239, 68, 68, 0.08) 0%, transparent 40%);
            color: var(--text-color);
            min-height: 100vh;
            padding: 2rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .container {
            max-width: 1200px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        header {
            text-align: center;
            margin-bottom: 1rem;
        }
        
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #a5b4fc, #6366f1, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }
        
        .subtitle {
            color: var(--text-muted);
            font-size: 1rem;
            font-weight: 400;
        }
        
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 1.5rem;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }
        
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        textarea {
            width: 100%;
            min-height: 100px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 1rem;
            color: var(--text-color);
            font-family: inherit;
            font-size: 1rem;
            line-height: 1.5;
            resize: vertical;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        textarea:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
        }
        
        .controls {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .preset-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .btn-preset {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            color: var(--text-color);
            padding: 0.5rem 0.875rem;
            border-radius: 8px;
            font-size: 0.8125rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-preset:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
        }
        
        .options {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .checkbox-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            user-select: none;
            font-size: 0.875rem;
            color: var(--text-muted);
        }
        
        .btn-submit {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-size: 0.9375rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-left: auto;
        }
        
        .btn-submit:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
        }
        
        .btn-submit:active {
            transform: translateY(1px);
        }
        
        .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .loading-spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .results-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .results-section.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .meta-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;
        }
        
        .badge {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            padding: 0.375rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .stage1-signal {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            border: 1px solid transparent;
        }
        
        .signal-well-supported {
            background: rgba(16, 185, 129, 0.1);
            border-color: rgba(16, 185, 129, 0.2);
            color: #34d399;
        }
        
        .signal-contested {
            background: rgba(245, 158, 11, 0.1);
            border-color: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }
        
        .signal-no-source {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
            color: #f87171;
        }
        
        .signal-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            box-shadow: 0 0 10px currentColor;
        }
        
        .stage3-rewrite {
            background: rgba(99, 102, 241, 0.05);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 14px;
            padding: 1.25rem;
            position: relative;
        }
        
        .stage3-rewrite p {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #e5e7eb;
        }
        
        .copy-btn {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            color: var(--text-color);
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .stage2-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1rem;
        }
        
        .persona-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 1rem;
            transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .persona-card:hover {
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        .persona-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 0.5rem;
        }
        
        .persona-emoji {
            font-size: 1.25rem;
        }
        
        .persona-label {
            font-weight: 600;
            font-size: 0.9375rem;
            color: #ffffff;
        }
        
        .persona-description {
            font-size: 0.75rem;
            color: var(--text-muted);
            line-height: 1.4;
            background: rgba(0, 0, 0, 0.15);
            padding: 0.5rem;
            border-radius: 6px;
            display: none;
        }
        
        .persona-reaction {
            font-size: 0.875rem;
            line-height: 1.5;
            color: #d1d5db;
            font-style: italic;
        }
        
        .card-header-toggle {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .toggle-desc-btn {
            background: transparent;
            border: none;
            color: var(--primary);
            font-size: 0.75rem;
            cursor: pointer;
            font-weight: 500;
        }
        
        .toggle-desc-btn:hover {
            text-decoration: underline;
        }
        
        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #f87171;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.9375rem;
            display: none;
        }

        /* skeleton loader styling */
        .skeleton {
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.03) 25%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 75%);
            background-size: 200% 100%;
            animation: loading-pulse 1.5s infinite ease-in-out;
        }

        @keyframes loading-pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .skeleton-text {
            height: 12px;
            width: 100%;
            border-radius: 4px;
            margin-bottom: 0.5rem;
        }

        .skeleton-text.short {
            width: 60%;
        }

        .pulse {
            animation: text-pulse 1.2s infinite ease-in-out;
        }

        @keyframes text-pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        .persona-card.loading {
            border-color: rgba(99, 102, 241, 0.2);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.05);
        }

        .persona-card.loading .persona-reaction {
            color: var(--text-muted);
            font-style: normal;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>PRIZM</h1>
            <p class="subtitle">Interactive Backend Verification Playground & Cockpit</p>
        </header>
        
        <div class="card">
            <div class="input-group">
                <label for="headline-input">News Headline or Statement</label>
                <textarea id="headline-input" placeholder="Type or paste a headline here..."></textarea>
            </div>
            
            <div class="controls">
                <div class="preset-buttons">
                    <button class="btn-preset" onclick="fillPreset(0)">Waiver Scheme</button>
                    <button class="btn-preset" onclick="fillPreset(1)">Lathi-charge</button>
                    <button class="btn-preset" onclick="fillPreset(2)">GDP slips</button>
                </div>
                
                <div class="options">
                    <label class="checkbox-container">
                        <input type="checkbox" id="cache-toggle" checked>
                        Use Cached fallbacks
                    </label>
                    
                    <button class="btn-submit" id="submit-btn" onclick="runPipeline()">
                        <span class="loading-spinner" id="spinner"></span>
                        <span id="btn-text">Run Pipeline</span>
                    </button>
                </div>
            </div>
        </div>
        
        <div class="error-message" id="error-box"></div>
        
        <div class="results-section" id="results-box">
            <div class="meta-bar">
                <span class="badge" id="meta-time">Time: -</span>
                <span class="badge" id="meta-cache">Source: -</span>
                <span class="badge" id="meta-fallback">Fallback: -</span>
            </div>
            
            <div class="card input-group">
                <label>Stage 1 — Sourcing Credibility Signal</label>
                <div class="stage1-signal" id="signal-card">
                    <span class="signal-indicator" id="signal-dot"></span>
                    <span id="signal-text">-</span>
                </div>
            </div>
            
            <div class="card input-group">
                <label>Stage 3 — Safe Rewrite Suggestion</label>
                <div class="stage3-rewrite">
                    <button class="copy-btn" onclick="copyRewrite()">Copy</button>
                    <p id="rewrite-text">-</p>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header-toggle">
                    <label>Stage 2 — 12-Persona Context Collapse Map</label>
                    <button class="toggle-desc-btn" onclick="toggleDescriptions()">Show Persona Contexts</button>
                </div>
                <div class="stage2-grid" id="persona-grid">
                    <!-- Cards will be populated dynamically -->
                </div>
            </div>
        </div>
    </div>

    <script>
        const PRESETS = [
            "Govt announces new farm loan waiver scheme",
            "Police lathi-charge protesters near Parliament",
            "India's GDP growth slips to 6.2% in Q2"
        ];
        
        let showDescriptions = false;
        
        function fillPreset(index) {
            document.getElementById('headline-input').value = PRESETS[index];
            document.getElementById('cache-toggle').checked = true;
        }
        
        function toggleDescriptions() {
            showDescriptions = !showDescriptions;
            const descs = document.querySelectorAll('.persona-description');
            descs.forEach(el => {
                el.style.display = showDescriptions ? 'block' : 'none';
            });
            document.querySelector('.toggle-desc-btn').textContent = 
                showDescriptions ? 'Hide Persona Contexts' : 'Show Persona Contexts';
        }
        
        function copyRewrite() {
            const text = document.getElementById('rewrite-text').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        }
        
        const statusPhrases = [
            "Analyzing local perspectives...",
            "Reviewing demographic factors...",
            "Simulating political alignment...",
            "Checking local context data...",
            "Drafting reaction text...",
            "Assessing daily budget impact...",
            "Aligning with local sentiment...",
            "Predicting community response..."
        ];

        async function runPipeline() {
            const headline = document.getElementById('headline-input').value.trim();
            if (!headline) {
                alert('Please enter a headline first');
                return;
            }
            
            const submitBtn = document.getElementById('submit-btn');
            const spinner = document.getElementById('spinner');
            const btnText = document.getElementById('btn-text');
            const resultsBox = document.getElementById('results-box');
            const errorBox = document.getElementById('error-box');
            
            submitBtn.disabled = true;
            spinner.style.display = 'block';
            btnText.textContent = 'Running...';
            errorBox.style.display = 'none';
            
            // Clear metadata and display status
            document.getElementById('meta-time').textContent = 'Time: Running Stage 1 & 2...';
            document.getElementById('meta-cache').textContent = 'Source: Pending...';
            document.getElementById('meta-fallback').textContent = 'Fallback: Pending...';
            
            // Show Stage 1 & 3 in skeleton state
            const signalCard = document.getElementById('signal-card');
            signalCard.className = 'stage1-signal skeleton';
            document.getElementById('signal-text').textContent = 'EXAMINING SOURCE CREDIBILITY ALLOWLIST...';
            
            document.getElementById('rewrite-text').innerHTML = `
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
            `;
            
            // Generate loading persona cards
            const grid = document.getElementById('persona-grid');
            grid.innerHTML = '';
            
            const personas = [
                { id: "startup_founder_pune", label: "Startup Founder (Pune)", emoji: "🚀" },
                { id: "urban_student_vadodara", label: "Urban Student (Vadodara)", emoji: "🎓" },
                { id: "corporate_employee_chennai", label: "Corporate Employee (Chennai)", emoji: "💻" },
                { id: "homemaker_thanjavur", label: "Homemaker (Thanjavur rural)", emoji: "👩‍🍳" },
                { id: "homemaker_hoshiarpur", label: "Homemaker (Hoshiarpur district)", emoji: "🏠" },
                { id: "business_owner_surat", label: "Small Business Owner (Surat)", emoji: "👔" },
                { id: "farmer_kannur", label: "Rural Farmer (Kannur rural)", emoji: "🌴" },
                { id: "farmer_anantapur", label: "Rural Farmer (Anantapur district)", emoji: "🌾" },
                { id: "business_owner_aligarh", label: "Small Business Owner (Aligarh)", emoji: "🔑" },
                { id: "aspirant_sangli", label: "Regional Language Aspirant (Sangli)", emoji: "📚" },
                { id: "retired_officer_ujjain", label: "Retired Government Officer (Ujjain)", emoji: "👴" },
                { id: "retired_officer_guntur", label: "Retired Government Officer (Guntur)", emoji: "📋" }
            ];
            
            const intervals = [];
            
            personas.forEach(p => {
                const card = document.createElement('div');
                card.className = 'persona-card loading skeleton';
                card.id = `card-${p.id}`;
                card.innerHTML = `
                    <div class="persona-header">
                        <span class="persona-emoji">${p.emoji}</span>
                        <span class="persona-label">${p.label}</span>
                    </div>
                    <div class="persona-reaction pulse" id="status-${p.id}">
                        Connecting to simulation...
                    </div>
                `;
                grid.appendChild(card);
                
                let phraseIdx = 0;
                const interval = setInterval(() => {
                    phraseIdx = (phraseIdx + 1) % statusPhrases.length;
                    const el = document.getElementById(`status-${p.id}`);
                    if (el) {
                        el.textContent = statusPhrases[phraseIdx];
                    }
                }, 1000 + Math.random() * 800);
                intervals.push(interval);
            });
            
            // Show results block immediately in loading mode
            resultsBox.classList.add('visible');
            
            try {
                const useCache = document.getElementById('cache-toggle').checked;
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        headline: headline,
                        use_cache: useCache
                    })
                });
                
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to analyze headline');
                }
                
                const data = await response.json();
                
                // Clear active loading intervals
                intervals.forEach(clearInterval);
                
                document.getElementById('meta-time').textContent = `Time: ${data.elapsed_ms}ms`;
                document.getElementById('meta-cache').textContent = `Source: ${data.served_from_cache ? 'Cached Fallback' : 'Live Groq'}`;
                document.getElementById('meta-fallback').textContent = `Fallback triggered: ${data.any_stage_used_fallback ? 'Yes' : 'No'}`;
                
                signalCard.className = 'stage1-signal';
                if (data.source_signal === 'well-supported by credible sources') {
                    signalCard.classList.add('signal-well-supported');
                } else if (data.source_signal === 'contested across sources') {
                    signalCard.classList.add('signal-contested');
                } else {
                    signalCard.classList.add('signal-no-source');
                }
                document.getElementById('signal-text').textContent = data.source_signal.toUpperCase();
                
                document.getElementById('rewrite-text').textContent = data.safe_rewrite;
                
                grid.innerHTML = '';
                
                const descriptions = {
                    "startup_founder_pune": "A tech startup founder based in Pune, raising capital in a 2026 funding climate that rewards fewer, larger AI and deeptech bets over growth-at-all-costs...",
                    "urban_student_vadodara": "A university student in Vadodara, Gujarat, entering a job market where IT hiring has stayed flat with AI-linked layoffs...",
                    "corporate_employee_chennai": "A mid-level software engineer or corporate professional in Chennai, watching IT services firms cut thousands of jobs even as AI, cloud, and GCC roles expand...",
                    "homemaker_thanjavur": "A homemaker living in rural Thanjavur, Tamil Nadu, managing household budgets around cooking gas costs and welfare-scheme promises...",
                    "homemaker_hoshiarpur": "A homemaker in Hoshiarpur, Punjab, managing a household dependent on agricultural income and remittances, highly sensitive to inflation...",
                    "business_owner_surat": "A textile business owner in Surat, Gujarat, dealing with GST rates, credit cycles, raw material costs, and export markets...",
                    "farmer_kannur": "A smallholder cash-crop farmer in rural Kannur, Kerala, focused on global commodity prices (coconut, rubber), crop diseases, and co-operative credit...",
                    "farmer_anantapur": "A dryland farmer in the drought-prone Anantapur district, Andhra Pradesh, relying on borewells, groundnuts, and crop insurance...",
                    "business_owner_aligarh": "A lock manufacturer or local metalware shop owner in Aligarh, UP, navigating raw material prices, power supply, and informal credit...",
                    "aspirant_sangli": "A youth from Sangli, Maharashtra, preparing for state recruitment exams conducted in Marathi, highly concerned with public job availability and paper leaks...",
                    "retired_officer_ujjain": "A retired state government employee living in Ujjain, MP, dependent on pension income, senior citizen health benefits, and local civic amenities...",
                    "retired_officer_guntur": "A retired central government officer living in Guntur, Andhra Pradesh, following national politics, tax policies on savings, and healthcare schemes..."
                };
                
                data.persona_reactions.forEach(p => {
                    const card = document.createElement('div');
                    card.className = 'persona-card';
                    const desc = descriptions[p.id] || "Audience segment representative.";
                    card.innerHTML = `
                        <div class="persona-header">
                            <span class="persona-emoji">${p.emoji}</span>
                            <span class="persona-label">${p.label}</span>
                        </div>
                        <div class="persona-description" style="display: ${showDescriptions ? 'block' : 'none'}">
                            ${desc}
                        </div>
                        <div class="persona-reaction">
                            "${p.reaction}"
                        </div>
                    `;
                    grid.appendChild(card);
                });
                
            } catch (err) {
                intervals.forEach(clearInterval);
                grid.innerHTML = '';
                errorBox.textContent = err.message;
                errorBox.style.display = 'block';
                resultsBox.classList.remove('visible');
            } finally {
                submitBtn.disabled = false;
                spinner.style.display = 'none';
                btnText.textContent = 'Run Pipeline';
            }
        }
    </script>
</body>
</html>"""
    return HTMLResponse(content=html_content)


@app.get("/health")
async def health() -> Dict[str, str]:
    """Simple liveness probe."""
    return {"status": "ok", "service": "prizm-backend"}


@app.get("/cached-headlines")
async def cached_headlines() -> Dict[str, Any]:
    """Returns the list of headlines for which a pre-baked fallback cache exists."""
    return {"cached_headlines": list_cached_headlines()}


@app.post("/chat", response_model=ChatResponse)
async def chat_with_persona(req: ChatRequest) -> ChatResponse:
    """
    Multi-turn in-character chat with a specific persona.

    The persona stays in character based on their description and the original
    headline context, using their initial reaction as the conversation seed.
    """
    from personas import PERSONAS
    from config import key_pool
    from llm_client import call_groq_with_fallback

    id_to_persona = {p["id"]: p for p in PERSONAS}
    persona = id_to_persona.get(req.persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona '{req.persona_id}' not found.")

    # Build conversation history for multi-turn context
    history_text = ""
    for msg in req.messages[-10:]:  # cap at last 10 turns
        speaker = "User" if msg.role == "user" else persona["label"]
        history_text += f"{speaker}: {msg.content}\n"

    prompt = f"""\
You are {persona['label']}.

Your background: {persona['description']}

Original headline you were asked to react to:
"{req.headline}"

Your initial reaction was:
"{req.initial_reaction}"

You are now having a direct conversation with the person who wrote that headline. Stay completely in character. Respond as this specific person would — use their economic reality, their concerns, their cultural lens.

Rules:
- Stay in character at all times. You ARE this person.
- Be direct, specific, and authentic. Reference your daily life, income, worries.
- Do NOT be a spokesperson or lecture. React like a real person would in conversation.
- Keep responses to 2–4 sentences unless the question demands more.
- Do NOT break character or add meta-commentary.
- You may be skeptical, hopeful, worried, or indifferent — whatever is authentic.

{f"Previous conversation:{chr(10)}{history_text}" if history_text else ""}
User: {req.user_message}
{persona['label']}:"""

    api_key = key_pool.next()
    reply, _ = await call_groq_with_fallback(
        prompt=prompt,
        api_key=api_key,
        fallback_text="I'm not sure what to say to that. Can you explain more?",
        temperature=0.85,
        max_tokens=300,
    )

    # Clean up any accidental persona label prefix the model might add
    label_prefix = f"{persona['label']}:"
    if reply.startswith(label_prefix):
        reply = reply[len(label_prefix):].strip()

    return ChatResponse(reply=reply.strip(), persona_id=req.persona_id)


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    """
    Full Prizm pipeline.

    1. If `use_cache=true` and the headline matches a demo cache entry,
       return the cached response immediately (zero LLM calls).
    2. Otherwise, run all three stages.  Stages 1 and 2 run concurrently;
       Stage 3 runs after Stage 2 (it needs Stage 2's output).
    """
    t0 = time.monotonic()
    headline = req.headline.strip()

    # ── Cache hit ─────────────────────────────────────────────────────────────
    if req.use_cache:
        cached = get_cached(headline)
        if cached:
            logger.info("Cache hit for headline: %s", headline)
            try:
                from writing_vector import extract_writing_vector
                from persona_vectors import PERSONA_VECTORS
                from empathy_engine import compute_empathy_distances
                w_vec = extract_writing_vector(cached["headline"])
                cog_prof = req.cognitive_profile.model_dump() if req.cognitive_profile else {}
                empathy_res = compute_empathy_distances(w_vec, cog_prof, PERSONA_VECTORS)
            except Exception as e:
                logger.error("Failed to compute empathy for cached response: %s", e)
                empathy_res = None

            # Compute meaning half-life if intended_meaning is provided
            half_life_res = None
            if req.intended_meaning:
                try:
                    from pipeline import compute_meaning_half_life
                    cached_reactions = cached.get("stage2", {})
                    half_life_res, _ = await compute_meaning_half_life(
                        headline=cached["headline"],
                        intended_meaning=req.intended_meaning,
                        reactions=cached_reactions
                    )
                except Exception as e:
                    logger.error("Failed to compute meaning half life for cached response: %s", e)

            elapsed = int((time.monotonic() - t0) * 1000)
            return AnalyzeResponse(
                headline=cached["headline"],
                source_signal=cached["stage1"],
                persona_reactions=_build_persona_reactions(cached["stage2"]),
                safe_rewrite=cached["stage3"],
                served_from_cache=True,
                any_stage_used_fallback=False,
                elapsed_ms=elapsed,
                empathy_result=empathy_res,
                meaning_half_life=half_life_res,
            )

    # ── Live pipeline ─────────────────────────────────────────────────────────
    logger.info("Running live pipeline for: %s", headline)

    # Grab per-stage fallbacks from cache if available (partial safety net)
    partial_cache = get_cached(headline) or {}

    # Stage 1 + Stage 2 fire CONCURRENTLY (they're independent)
    (signal, s1_fallback), (reactions, s2_fallback) = await asyncio.gather(
        source_check(
            headline=headline,
            fallback_signal=partial_cache.get("stage1", "contested across sources"),
        ),
        context_collapse_map(
            headline=headline,
            fallback_reactions=partial_cache.get("stage2"),
        ),
    )

    # Stage 3 needs Stage 2's output
    rewrite, s3_fallback = await safe_rewrite(
        headline=headline,
        reactions=reactions,
        fallback_rewrite=partial_cache.get("stage3", ""),
    )

    # Compute empathy result dynamically
    try:
        from writing_vector import extract_writing_vector
        from persona_vectors import PERSONA_VECTORS
        from empathy_engine import compute_empathy_distances
        w_vec = extract_writing_vector(headline)
        cog_prof = req.cognitive_profile.model_dump() if req.cognitive_profile else {}
        empathy_res = compute_empathy_distances(w_vec, cog_prof, PERSONA_VECTORS)
    except Exception as e:
        logger.error("Failed to compute empathy for live response: %s", e)
        empathy_res = None

    # Compute meaning half-life if intended_meaning is provided
    half_life_res = None
    if req.intended_meaning:
        try:
            from pipeline import compute_meaning_half_life
            half_life_res, _ = await compute_meaning_half_life(
                headline=headline,
                intended_meaning=req.intended_meaning,
                reactions=reactions
            )
        except Exception as e:
            logger.error("Failed to compute meaning half life for live response: %s", e)

    elapsed = int((time.monotonic() - t0) * 1000)
    logger.info("Pipeline complete | elapsed=%d ms", elapsed)

    return AnalyzeResponse(
        headline=headline,
        source_signal=signal,
        persona_reactions=_build_persona_reactions(reactions),
        safe_rewrite=rewrite,
        served_from_cache=False,
        any_stage_used_fallback=s1_fallback or s2_fallback or s3_fallback,
        elapsed_ms=elapsed,
        empathy_result=empathy_res,
        meaning_half_life=half_life_res,
    )


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    from config import settings

    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
