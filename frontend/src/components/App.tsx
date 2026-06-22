import { useState, useEffect, useCallback, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { motion, AnimatePresence } from "motion/react"
import {
  AlertTriangle, HelpCircle, CheckCircle, Eye,
  ArrowRight, Shield, Zap, RefreshCw, RotateCcw,
  Loader2, ChevronDown,
} from "lucide-react"
import { ShaderPlane, EnergyRing, FloatingParticles, GridLines } from "./ShaderScene"

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage     = "idle" | "checking" | "revealing" | "complete" | "error"
type Sentiment = "alarm" | "confusion" | "agreement" | "skepticism"

interface PersonaReaction {
  id:       string
  label:    string
  emoji:    string
  reaction: string
}

interface AnalyzeResponse {
  headline:              string
  source_signal:         string
  persona_reactions:     PersonaReaction[]
  safe_rewrite:          string
  served_from_cache:     boolean
  any_stage_used_fallback: boolean
  elapsed_ms:            number
}

// ─── Sentiment detection ──────────────────────────────────────────────────────
const ALARM_WORDS    = ["worried", "afraid", "fear", "alarmed", "dangerous", "threat", "problem", "concern", "hurt", "suffer", "crisis", "disaster", "terrible", "awful", "riot", "violence", "won't", "can't", "impossible"]
const CONFUSION_WORDS= ["unclear", "unsure", "confused", "don't understand", "what does", "what is", "which", "ambiguous", "vague", "mean", "means", "genuinely", "wonder", "wondering", "what about", "how will"]
const AGREEMENT_WORDS= ["agree", "yes", "finally", "good", "great", "hope", "support", "benefit", "right", "correct", "absolutely", "exactly", "welcome", "positive", "helpful", "happy", "glad"]

function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase()
  const a = ALARM_WORDS.filter(w => t.includes(w)).length
  const c = CONFUSION_WORDS.filter(w => t.includes(w)).length
  const g = AGREEMENT_WORDS.filter(w => t.includes(w)).length
  if (a > c && a > g) return "alarm"
  if (c > a && c > g) return "confusion"
  if (g > a && g > c) return "agreement"
  return "skepticism"
}

// ─── Reaction style map ───────────────────────────────────────────────────────
const REACTION_STYLES = {
  alarm: {
    label: "ALARM", Icon: AlertTriangle,
    textColor: "text-red-400", cardBg: "bg-[#110509]",
    border: "border border-red-900/40",
    badge: "bg-red-900/25 text-red-400", dot: "bg-red-500",
  },
  confusion: {
    label: "CONFUSION", Icon: HelpCircle,
    textColor: "text-amber-400", cardBg: "bg-[#120f04]",
    border: "border border-amber-900/40",
    badge: "bg-amber-900/25 text-amber-400", dot: "bg-amber-500",
  },
  agreement: {
    label: "AGREEMENT", Icon: CheckCircle,
    textColor: "text-cyan-400", cardBg: "bg-[#021318]",
    border: "border border-cyan-900/40",
    badge: "bg-cyan-900/25 text-cyan-400", dot: "bg-cyan-500",
  },
  skepticism: {
    label: "SKEPTICISM", Icon: Eye,
    textColor: "text-slate-400", cardBg: "bg-[#07101e]",
    border: "border border-white/[0.08]",
    badge: "bg-white/5 text-slate-400", dot: "bg-slate-500",
  },
} as const

// ─── Signal styles ────────────────────────────────────────────────────────────
function signalStyle(signal: string) {
  if (signal.includes("well-supported"))
    return { dot: "bg-cyan-400", text: "text-cyan-400", border: "border-cyan-900/50", bg: "bg-[#021318]", label: "WELL-SUPPORTED" }
  if (signal.includes("contested"))
    return { dot: "bg-amber-500", text: "text-amber-400", border: "border-amber-900/50", bg: "bg-[#120f04]", label: "CONTESTED" }
  return { dot: "bg-red-500", text: "text-red-400", border: "border-red-900/50", bg: "bg-[#110509]", label: "NO CREDIBLE SOURCE" }
}

// ─── SAMPLE_TEXT ─────────────────────────────────────────────────────────────
const SAMPLE_TEXT = "We need to protect our culture from outside influence."

// ─── Shader background ────────────────────────────────────────────────────────
function ShaderBackground() {
  return (
    <div className="shader-canvas-wrapper">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <FloatingParticles count={100} />
        <GridLines />
        <ShaderPlane position={[-3.5,  1.5, -2]} color1="#001a33" color2="#004466" />
        <ShaderPlane position={[ 3.5, -1.5, -2]} color1="#001a2e" color2="#003355" />
        <EnergyRing radius={1.4} position={[-4, -1.5, -1]} color="#00cfff" />
        <EnergyRing radius={0.9} position={[ 4,  1.5, -1]} color="#0088bb" />
      </Canvas>
    </div>
  )
}

// ─── Pulsing dots loader ──────────────────────────────────────────────────────
function PulsingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground pulse-dot"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [text, setText]               = useState("")
  const [stage, setStage]             = useState<Stage>("idle")
  const [visibleCount, setVisibleCount] = useState(0)
  const [data, setData]               = useState<AnalyzeResponse | null>(null)
  const [errorMsg, setErrorMsg]       = useState("")
  const [useCache, setUseCache]       = useState(true)
  const [showRewrite, setShowRewrite] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Stagger persona cards
  useEffect(() => {
    if (stage !== "revealing" || !data) return
    if (visibleCount >= data.persona_reactions.length) {
      const t = setTimeout(() => { setStage("complete"); setShowRewrite(true) }, 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleCount(n => n + 1), visibleCount === 0 ? 80 : 220)
    return () => clearTimeout(t)
  }, [stage, visibleCount, data])

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setStage("checking")
    setVisibleCount(0)
    setData(null)
    setErrorMsg("")
    setShowRewrite(false)

    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: text.trim(), use_cache: useCache }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const json: AnalyzeResponse = await res.json()
      setData(json)
      setStage("revealing")
    } catch (e: unknown) {
      if ((e as Error).name === "AbortError") return
      setErrorMsg((e as Error).message || "Pipeline failed.")
      setStage("error")
    }
  }, [text, useCache])

  const handleReset = useCallback(() => {
    abortRef.current?.abort()
    setStage("idle")
    setVisibleCount(0)
    setData(null)
    setErrorMsg("")
    setShowRewrite(false)
    setText("")
  }, [])

  const isAnalyzing = stage !== "idle" && stage !== "error"
  const personas    = data?.persona_reactions ?? []

  // Count sentiments
  const sentimentCounts: Record<string, number> = { alarm: 0, confusion: 0, agreement: 0, skepticism: 0 }
  personas.forEach(p => {
    const s = detectSentiment(p.reaction)
    sentimentCounts[s]++
  })

  return (
    <>
      {/* ── WebGL background ─────────────────────────────────── */}
      <ShaderBackground />
      <div className="scanlines" />
      <div className="vignette" />

      {/* ── App shell ────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen text-foreground font-sans">

        {/* HEADER */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md px-5 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-black tracking-tight">PRIZM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest hidden md:block">
              Context Collapse Visualizer
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="hidden sm:block">12 AUDIENCE SEGMENTS</span>
            <span className="hidden sm:block">·</span>
            <span>3-IN-1 PIPELINE</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── HERO / IDLE INPUT ─────────────────────────────── */}
          <AnimatePresence>
            {!isAnalyzing && stage !== "error" && (
              <motion.section
                key="idle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mb-12 max-w-2xl"
              >
                <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">
                  84% of harmful sharing is unintentional
                </p>
                <h1 className="font-display font-black text-5xl sm:text-6xl leading-none tracking-tight mb-4">
                  HOW DO YOUR<br />
                  <span className="text-primary">WORDS LAND</span><br />
                  OUT THERE?
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-lg">
                  Paste any text — a headline, tweet, policy statement. See how 12
                  different audience segments read it simultaneously, and get a
                  variance-reducing rewrite.
                </p>

                {/* Input box */}
                <div className="border border-border focus-within:border-primary/30 transition-colors bg-card/40 backdrop-blur-sm">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Paste a headline, post, or statement here..."
                    className="w-full bg-transparent px-5 pt-4 pb-2 text-foreground placeholder:text-muted-foreground text-base resize-none outline-none min-h-[90px] font-sans"
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze() }}
                  />
                  <div className="border-t border-border px-5 py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setText(SAMPLE_TEXT)}
                        className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                      >
                        load demo text
                      </button>
                      {/* Cache toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          onClick={() => setUseCache(v => !v)}
                          className={`relative w-8 h-4 rounded-full transition-colors ${useCache ? "bg-primary/30" : "bg-white/10"}`}
                        >
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${useCache ? "left-4 bg-primary" : "left-0.5 bg-white/40"}`} />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">cache</span>
                      </label>
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={!text.trim()}
                      className="bg-primary text-primary-foreground font-display font-black text-sm px-5 py-2 flex items-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                      ANALYZE <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-6 flex flex-wrap gap-6">
                  {[
                    { stat: "84%",   label: "unintentional harm" },
                    { stat: "12",    label: "audience segments" },
                    { stat: "3-in-1",label: "verify → visualize → rewrite" },
                  ].map(({ stat, label }) => (
                    <div key={stat}>
                      <p className="font-display font-black text-2xl leading-none">{stat}</p>
                      <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── ERROR STATE ───────────────────────────────────── */}
          {stage === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 max-w-xl border border-red-900/50 bg-[#110509] px-5 py-4"
            >
              <p className="font-mono text-xs text-red-400 mb-1 uppercase tracking-widest">Pipeline Error</p>
              <p className="text-sm text-foreground/80 mb-4">{errorMsg}</p>
              <button onClick={handleReset} className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
                <RotateCcw size={12} /> RESET
              </button>
            </motion.div>
          )}

          {/* ── ACTIVE INPUT STRIP ────────────────────────────── */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3 mb-8"
            >
              <div className="flex-1 border border-border bg-card/40 backdrop-blur-sm px-4 py-3">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Input</p>
                <p className="text-foreground text-sm leading-relaxed font-sans">&ldquo;{text}&rdquo;</p>
              </div>
              <button
                onClick={handleReset}
                className="shrink-0 border border-border px-3 py-3 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-all flex items-center gap-2"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">RESET</span>
              </button>
            </motion.div>
          )}

          {/* ── STAGE 1: SOURCE SIGNAL ────────────────────────── */}
          {isAnalyzing && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield size={12} className="text-muted-foreground" />
                <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Stage 01 — Source Signal
                </span>
                {stage === "checking" && (
                  <div className="ml-2 w-24 h-0.5 bg-border overflow-hidden">
                    <div className="h-full bg-primary progress-bar-anim" />
                  </div>
                )}
              </div>

              {stage === "checking" ? (
                <div className="border border-border bg-card/40 px-5 py-3 flex items-center gap-3 max-w-md">
                  <PulsingDots />
                  <span className="font-mono text-xs text-muted-foreground">
                    Checking source credibility...
                  </span>
                </div>
              ) : data ? (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`inline-flex items-center gap-3 border ${signalStyle(data.source_signal).border} ${signalStyle(data.source_signal).bg} px-4 py-2.5`}
                >
                  <span className={`w-2 h-2 rounded-full ${signalStyle(data.source_signal).dot} shrink-0`} />
                  <span className={`font-mono text-xs font-medium uppercase tracking-widest ${signalStyle(data.source_signal).text}`}>
                    {signalStyle(data.source_signal).label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                    — {data.source_signal}
                  </span>
                </motion.div>
              ) : null}
            </motion.section>
          )}

          {/* ── STAGE 2: PERSONA GRID ─────────────────────────── */}
          {isAnalyzing && visibleCount > 0 && (
            <section className="mb-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-muted-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                    Stage 02 — Context Collapse
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  {visibleCount < personas.length ? (
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Loader2 size={10} className="animate-spin" />
                      {visibleCount} / {personas.length} segments
                    </span>
                  ) : (
                    <>
                      {(["alarm","confusion","agreement","skepticism"] as const).map(s => {
                        const rs = REACTION_STYLES[s]
                        return sentimentCounts[s] > 0 ? (
                          <span key={s} className={`flex items-center gap-1.5 ${rs.textColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${rs.dot} shrink-0`} />
                            {sentimentCounts[s]} {rs.label}
                          </span>
                        ) : null
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {personas.slice(0, visibleCount).map((persona, idx) => {
                  const sentiment = detectSentiment(persona.reaction)
                  const rs        = REACTION_STYLES[sentiment]
                  const Icon      = rs.Icon
                  return (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut", delay: idx * 0.02 }}
                      className={`persona-card ${rs.cardBg} ${rs.border} p-4`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="text-xl leading-none">{persona.emoji}</span>
                          <p className="font-display font-bold text-[15px] text-foreground leading-tight truncate">
                            {persona.label}
                          </p>
                        </div>
                        <span className={`shrink-0 font-mono text-[9px] px-1.5 py-0.5 ${rs.badge} flex items-center gap-1 uppercase tracking-wide`}>
                          <Icon size={9} />{rs.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-foreground/75 leading-relaxed font-sans italic">
                        &ldquo;{persona.reaction}&rdquo;
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

          {/* ── STAGE 3: SAFE REWRITE ─────────────────────────── */}
          <AnimatePresence>
            {stage === "complete" && data && showRewrite && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw size={12} className="text-muted-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                    Stage 03 — Safe Phrasing Suggester
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                  {/* Original */}
                  <div className="border border-border bg-card/40 backdrop-blur-sm p-5">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Original Text</p>
                    <p className="text-foreground text-sm leading-relaxed font-sans">&ldquo;{text}&rdquo;</p>
                  </div>

                  {/* Rewrite */}
                  <div className="border border-cyan-900/50 bg-[#021318] p-5">
                    <p className="font-mono text-[10px] text-cyan-400/70 uppercase tracking-widest mb-3">Suggested Rewrite</p>
                    <p className="text-foreground text-sm leading-relaxed font-sans">&ldquo;{data.safe_rewrite}&rdquo;</p>
                  </div>
                </div>

                {/* Meta strip */}
                <div className="border border-primary/20 bg-primary/5 px-5 py-3.5 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-0.5 h-8 bg-primary shrink-0" />
                    <div>
                      <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest">Pipeline</p>
                      <p className="font-display font-black text-base text-primary leading-tight">
                        {data.elapsed_ms}ms · {data.served_from_cache ? "Cached" : "Live Groq"}
                      </p>
                    </div>
                  </div>
                  {data.any_stage_used_fallback && (
                    <span className="font-mono text-[10px] text-amber-400/70 uppercase tracking-widest">
                      ⚠ Some stages used fallback
                    </span>
                  )}
                </div>

                {/* Expandable analysis */}
                <details className="mt-3 border border-border group">
                  <summary className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest cursor-pointer flex items-center gap-2 hover:text-foreground transition-colors select-none">
                    <ChevronDown size={11} className="transition-transform group-open:rotate-180" />
                    Interpretation Breakdown
                  </summary>
                  <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border">
                    {(["alarm","confusion","agreement","skepticism"] as const).map(s => {
                      const rs = REACTION_STYLES[s]
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${rs.dot} shrink-0`} />
                          <span className={`font-mono text-[11px] ${rs.textColor}`}>
                            {sentimentCounts[s]} {rs.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </details>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          {isAnalyzing && (
            <motion.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="border-t border-border pt-5 mt-2"
            >
              <p className="font-mono text-[11px] text-muted-foreground text-center">
                This tool helps you understand impact, not avoid accountability.
              </p>
            </motion.footer>
          )}
          {!isAnalyzing && stage !== "error" && (
            <footer className="border-t border-border pt-6 mt-6">
              <p className="font-mono text-[11px] text-muted-foreground">
                Based on MIT Sloan / Nature (2021) · Stanford Internet Observatory (2025) · MIT Media Lab (2018)
              </p>
            </footer>
          )}
        </main>
      </div>
    </>
  )
}
