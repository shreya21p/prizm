import { useState, useEffect, useCallback, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { motion, AnimatePresence } from "motion/react"
interface IconProps {
  size?: number
  className?: string
  strokeWidth?: number | string
}

function AlertTriangle({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function HelpCircle({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function CheckCircle({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function Eye({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ArrowRight({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function Shield({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function Zap({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function RefreshCw({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

function RotateCcw({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function Loader2({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function ChevronDown({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function LogOut({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function Activity({ size = 24, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function PersonaIcon({ id, size = 18, className }: { id: string; size?: number; className?: string }) {
  switch (id) {
    case "startup_founder_pune": // Rocket
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
          <path d="M12 9c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5" />
          <path d="M19 5c-3-3-9-2-12 1s-4 9-1 12c3 3 9 2 12-1s4-9 1-12z" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      )
    case "urban_student_vadodara": // Graduation Cap
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          <path d="M21.5 12v6" />
        </svg>
      )
    case "corporate_employee_chennai": // Laptop
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="4" width="20" height="12" rx="2" ry="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      )
    case "homemaker_thanjavur": // ChefHat / Cooking
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M6 18V9a6 6 0 0 1 12 0v9" />
          <path d="M18 14a4 4 0 1 1 0-8 4 4 0 1 1 0 8z" />
          <path d="M6 14a4 4 0 1 0 0-8 4 4 0 1 0 0 8z" />
          <path d="M3 18h18" />
          <path d="M17 18a2.5 2.5 0 0 1-10 0" />
        </svg>
      )
    case "homemaker_hoshiarpur": // Home
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case "business_owner_surat": // Briefcase
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    case "farmer_kannur": // Palm Tree
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M13 22H4" />
          <path d="M10 22C10 12 16 6 21 6" />
          <path d="M13 6c-2.4 0-4.4 2-5 4.5" />
          <path d="M13 6c-1.5-1.5-3-2-4.5-2" />
          <path d="M13 6c2 1.5 3.5 3.5 4 5.5" />
          <path d="M17 11.5c-1-1.5-2.5-2-4-2" />
          <path d="M21 6c-1.5 1-3.5 1-5 0.5" />
          <path d="M21 6c1 1.5 1.5 3.5 1 5" />
          <path d="M17 11.5c.5-1.5 1.5-2.5 3-3" />
        </svg>
      )
    case "farmer_anantapur": // Wheat / Grain
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 22 22 2" />
          <path d="M8 12c.5-2.5 2.5-4 4.5-4.5" />
          <path d="M12 8c.5-2.5 2.5-4 4.5-4.5" />
          <path d="M12 16c2.5-.5 4-2.5 4.5-4.5" />
          <path d="M16 12c2.5-.5 4-2.5 4.5-4.5" />
        </svg>
      )
    case "business_owner_aligarh": // Key
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" />
        </svg>
      )
    case "aspirant_sangli": // BookOpen
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    case "retired_officer_ujjain": // UserCheck / Award
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case "retired_officer_guntur": // ClipboardList / FileText
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <line x1="8" y1="11" x2="16" y2="11" />
          <line x1="8" y1="16" x2="16" y2="16" />
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

import { ShaderPlane, EnergyRing, FloatingParticles, GridLines } from "./ShaderScene"
import type { GoogleUser } from "./LoginPage"
import CognitiveOriginSurvey from "./CognitiveOriginSurvey"
import EmpathyRing from "./EmpathyRing"
import PersonaChatDrawer from "./PersonaChatDrawer"

// ─── Types ────────────────────────────────────────────────────────────────────
interface SurveyProfile {
  origin: string
  language: string
  profession: string
  audience: string
}
type Stage = "idle" | "checking" | "revealing" | "complete" | "error"
type Sentiment = "alarm" | "confusion" | "agreement" | "skepticism"

interface PersonaReaction {
  id: string
  label: string
  emoji: string
  reaction: string
}

interface EmpathyPersonaResult {
  id: string
  zone: string
  distance: number
  similarity: number
  reached: boolean
}

interface EmpathyResult {
  empathy_reach: number
  profile_benchmark: number
  reach_sentence: string
  benchmark_sentence: string
  personas: EmpathyPersonaResult[]
}

interface MeaningHalfLifeResult {
  original_meaning: string
  emergent_meanings: string[]
  meaning_retention_score: number
  meaning_half_life: string
  final_interpretation: string
}

interface AnalyzeResponse {
  headline: string
  source_signal: string
  persona_reactions: PersonaReaction[]
  safe_rewrite: string
  served_from_cache: boolean
  any_stage_used_fallback: boolean
  elapsed_ms: number
  empathy_result?: EmpathyResult | null
  meaning_half_life?: MeaningHalfLifeResult | null
}

// ─── Sentiment detection ──────────────────────────────────────────────────────
const ALARM_WORDS = ["worried", "afraid", "fear", "alarmed", "dangerous", "threat", "problem", "concern", "hurt", "suffer", "crisis", "disaster", "terrible", "awful", "riot", "violence", "crazy", "struggle", "struggling", "won't", "can't", "impossible"]
const CONFUSION_WORDS = ["unclear", "unsure", "confused", "don't understand", "what does", "what is", "which", "ambiguous", "vague", "mean", "means", "genuinely", "wonder", "wondering", "what about", "how will"]
const AGREEMENT_WORDS = ["agree", "yes", "finally", "good", "great", "hope", "benefit", "right", "correct", "absolutely", "exactly", "welcome", "positive", "helpful", "happy", "glad", "agreeing", "agreed"]

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
        <ShaderPlane position={[-3.5, 1.5, -2]} color1="#001a33" color2="#004466" />
        <ShaderPlane position={[3.5, -1.5, -2]} color1="#001a2e" color2="#003355" />
        <EnergyRing radius={1.4} position={[-4, -1.5, -1]} color="#00cfff" />
        <EnergyRing radius={0.9} position={[4, 1.5, -1]} color="#0088bb" />
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

function formatProfileVal(key: string, val: string): string {
  if (key === "origin") {
    if (val === "metro") return "Metro"
    if (val === "small_city") return "Small city"
    if (val === "town") return "Town"
    if (val === "village") return "Village"
  }
  if (key === "language") {
    if (val === "english") return "English"
    if (val === "hindi") return "Hindi"
    if (val === "regional") return "Regional"
    if (val === "mixed") return "Mixed"
  }
  if (key === "profession") {
    if (val === "policy") return "Policy/Govt"
    if (val === "media") return "Media/PR"
    if (val === "business") return "Business"
    if (val === "education") return "Education"
  }
  if (key === "audience") {
    if (val === "general") return "General public"
    if (val === "community") return "Specific community"
    if (val === "decision") return "Decision makers"
    if (val === "not_sure") return "Not sure"
  }
  return val
}

// ─── Main App ─────────────────────────────────────────────────────────────────
interface AppProps {
  user: GoogleUser
  onSignOut: () => void
}

export default function App({ user, onSignOut }: AppProps) {
  const [text, setText] = useState("")
  const [intendedMeaning, setIntendedMeaning] = useState("")
  const [stage, setStage] = useState<Stage>("idle")
  const [visibleCount, setVisibleCount] = useState(0)
  const [data, setData] = useState<AnalyzeResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [useCache, setUseCache] = useState(true)
  const [showRewrite, setShowRewrite] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [surveyProfile, setSurveyProfile] = useState<SurveyProfile | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "ring">("grid")
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)
  const [chatPersonaId, setChatPersonaId] = useState<string | null>(null)
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

  const handleAnalyze = useCallback(async (profile?: SurveyProfile) => {
    if (!text.trim()) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setStage("checking")
    setVisibleCount(0)
    setData(null)
    setErrorMsg("")
    setShowRewrite(false)
    setViewMode("grid")
    setSelectedPersonaId(null)

    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: text.trim(),
          use_cache: useCache,
          cognitive_profile: profile || surveyProfile || undefined,
          intended_meaning: intendedMeaning.trim() || undefined
        }),
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
  }, [text, useCache, surveyProfile])

  const onStartAnalyze = useCallback(() => {
    if (!text.trim()) return
    setShowSurvey(true)
    setActiveQuestionIndex(0)
    setSurveyProfile(null)
  }, [text])

  const handleReset = useCallback(() => {
    abortRef.current?.abort()
    setStage("idle")
    setVisibleCount(0)
    setData(null)
    setErrorMsg("")
    setShowRewrite(false)
    setText("")
    setIntendedMeaning("")
    setShowSurvey(false)
    setActiveQuestionIndex(0)
    setSurveyProfile(null)
    setViewMode("grid")
    setSelectedPersonaId(null)
  }, [])

  const isAnalyzing = stage !== "idle" && stage !== "error"
  const personas = data?.persona_reactions ?? []

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
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-muted-foreground hidden sm:block">12 SEGMENTS</span>
            {/* User avatar */}
            <div className="relative">
              <button
                id="prizm-user-menu-btn"
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center font-display font-bold text-xs text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-mono text-[11px] text-muted-foreground hidden sm:block max-w-[100px] truncate">{user.email}</span>
              </button>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-52 border border-border bg-card/95 backdrop-blur-md z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-display font-bold text-sm text-foreground truncate">{user.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    id="prizm-signout-btn"
                    onClick={() => { setShowUserMenu(false); onSignOut() }}
                    className="w-full flex items-center gap-2 px-4 py-3 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                  >
                    <LogOut size={13} strokeWidth={1.8} /> Sign out
                  </button>
                </motion.div>
              )}
            </div>
            {/* Logout button */}
            <button
              id="prizm-direct-logout-btn"
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-primary/40 font-mono text-xs text-muted-foreground hover:text-foreground transition-all duration-150"
              style={{
                borderRadius: "3px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <LogOut size={13} strokeWidth={1.8} />
              <span>LOGOUT</span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── HERO / IDLE INPUT ─────────────────────────────── */}
          <AnimatePresence>
            {!isAnalyzing && stage !== "error" && !showSurvey && (
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
                  Paste any text - a headline, tweet, policy statement. See how 12
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
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onStartAnalyze() }}
                  />
                  <div className="border-t border-border/20">
                    <textarea
                      value={intendedMeaning}
                      onChange={e => setIntendedMeaning(e.target.value)}
                      placeholder="Optional: What is your intended meaning/message? (to measure semantic decay)"
                      className="w-full bg-transparent px-5 pt-3 pb-2 text-foreground/80 placeholder:text-muted-foreground/50 text-sm resize-none outline-none min-h-[60px] font-sans border-none focus:ring-0"
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onStartAnalyze() }}
                    />
                  </div>
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
                      onClick={onStartAnalyze}
                      disabled={!text.trim()}
                      className="bg-primary text-primary-foreground font-display font-black text-sm px-5 py-2 flex items-center gap-2 hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
                    >
                      ANALYZE <ArrowRight size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {/* Stats strip */}
                <div className="mt-6 flex flex-wrap gap-6">
                  {[
                    { stat: "84%", label: "unintentional harm" },
                    { stat: "12", label: "audience segments" },
                    { stat: "3-in-1", label: "verify → visualize → rewrite" },
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

          {/* ── COGNITIVE SURVEY ──────────────────────────────── */}
          {showSurvey && (
            <CognitiveOriginSurvey
              isVisible={showSurvey}
              activeQuestionIndex={activeQuestionIndex}
              setActiveQuestionIndex={setActiveQuestionIndex}
              onComplete={async (profile) => {
                setSurveyProfile(profile)
                setShowSurvey(false)
                await handleAnalyze(profile)
              }}
            />
          )}

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
                <RotateCcw size={13} strokeWidth={1.8} /> RESET
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
                <RotateCcw size={13} strokeWidth={1.8} />
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
                <Shield size={13} strokeWidth={1.8} className="text-muted-foreground" />
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Zap size={13} strokeWidth={1.8} className="text-muted-foreground" />
                    <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                      Stage 02 — Context Collapse
                    </span>
                  </div>
                  {surveyProfile && (
                    <span className="font-mono text-[11px]" style={{ fontWeight: 400, color: "#5a5a72" }}>
                      Writing as: [{formatProfileVal("origin", surveyProfile.origin)}] · [{formatProfileVal("language", surveyProfile.language)}] · [{formatProfileVal("profession", surveyProfile.profession)}] · [{formatProfileVal("audience", surveyProfile.audience)}]
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Sentiment summary */}
                  <div className="flex items-center gap-3 font-mono text-[11px] hidden sm:flex">
                    {visibleCount < personas.length ? (
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Loader2 size={12} strokeWidth={1.8} className="animate-spin" />
                        {visibleCount} / {personas.length} segments
                      </span>
                    ) : (
                      <>
                        {(["alarm", "confusion", "agreement", "skepticism"] as const).map(s => {
                          const rs = REACTION_STYLES[s]
                          const SentimentIcon = rs.Icon
                          return sentimentCounts[s] > 0 ? (
                            <span key={s} className={`flex items-center gap-1.5 ${rs.textColor}`}>
                              <SentimentIcon size={12} strokeWidth={1.5} className="shrink-0" />
                              {sentimentCounts[s]} {rs.label}
                            </span>
                          ) : null
                        })}
                      </>
                    )}
                  </div>

                  {/* View Toggler */}
                  {data && data.empathy_result && (
                    <div className="flex items-center gap-1 border border-border bg-[#111118]/60 p-[3px] rounded-[4px] font-mono text-[10px]">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 py-1.5 transition-all ${
                          viewMode === "grid"
                            ? "bg-primary text-primary-foreground font-bold shadow-[0_0_8px_rgba(0,207,255,0.2)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={{ borderRadius: "2px" }}
                      >
                        GRID VIEW
                      </button>
                      <button
                        onClick={() => setViewMode("ring")}
                        className={`px-3 py-1.5 transition-all ${
                          viewMode === "ring"
                            ? "bg-primary text-primary-foreground font-bold shadow-[0_0_8px_rgba(0,207,255,0.2)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        style={{ borderRadius: "2px" }}
                      >
                        COLLAPSE MAP
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Empathy Reach Bar */}
              {data && data.empathy_result && (
                <div className="mb-6 border border-border bg-card/25 backdrop-blur-md p-5 pt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div>
                      <h4 className="font-mono text-xs text-primary uppercase tracking-widest mb-1">
                        EMPATHY REACH SUMMARY
                      </h4>
                      <p className="text-foreground text-sm font-sans font-medium">
                        {data.empathy_result.reach_sentence}
                      </p>
                      <p className="text-muted-foreground text-xs font-sans mt-0.5">
                        {data.empathy_result.benchmark_sentence}
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end shrink-0">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Reach Score
                      </span>
                      <span className="font-display font-black text-3xl text-primary leading-none">
                        {data.empathy_result.empathy_reach} / 12
                      </span>
                    </div>
                  </div>

                  {/* Reach segment bar */}
                  <div className="relative mt-6">
                    <div className="flex h-3 gap-[2px] bg-background border border-border/40 p-[2px] rounded-[3px] overflow-hidden">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const isReached = idx < (data.empathy_result?.empathy_reach ?? 0)
                        return (
                          <div
                            key={idx}
                            className={`flex-1 transition-all duration-500 rounded-[1px] ${
                              isReached
                                ? "bg-gradient-to-r from-[#00cfff] to-[#00c9b1] shadow-[0_0_8px_rgba(0,201,177,0.4)]"
                                : "bg-[#111118]"
                            }`}
                          />
                        )
                      })}
                    </div>

                    {/* Benchmark indicator */}
                    {data.empathy_result.profile_benchmark > 0 && (
                      <div
                        className="absolute top-[-26px] transform -translate-x-1/2 flex flex-col items-center"
                        style={{
                          left: `${(data.empathy_result.profile_benchmark / 12) * 100}%`
                        }}
                      >
                        <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest whitespace-nowrap bg-background px-1.5 border border-border/30 rounded-[2px] py-[1.5px] shadow-sm">
                          AVG: {data.empathy_result.profile_benchmark.toFixed(1)}
                        </span>
                        <div className="w-[1.5px] h-[26px] bg-muted-foreground/50 border-dashed border-l mt-[1px]" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Rendering */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {personas.slice(0, visibleCount).map((persona, idx) => {
                    const sentiment = detectSentiment(persona.reaction)
                    const rs = REACTION_STYLES[sentiment]
                    const Icon = rs.Icon
                    return (
                      <motion.div
                        key={persona.id}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut", delay: idx * 0.02 }}
                        className={`persona-card overflow-hidden ${rs.cardBg} ${rs.border} p-4 cursor-pointer group relative`}
                        onClick={() => setChatPersonaId(persona.id)}
                        title={`Chat with ${persona.label}`}
                      >
                        {/* Chat hint overlay on hover */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center pointer-events-none">
                          <span className="font-mono text-[9px] text-primary uppercase tracking-widest px-2 py-1 bg-background/80 border border-primary/20 rounded">
                            Chat →
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex items-center gap-2">
                            <PersonaIcon id={persona.id} size={18} className="text-muted-foreground shrink-0" />
                            <p className="font-display font-bold text-[15px] text-foreground leading-tight truncate">
                              {persona.label}
                            </p>
                          </div>
                          <span className={`shrink-0 font-mono text-[9px] px-1.5 py-0.5 ${rs.badge} flex items-center gap-1.5 uppercase tracking-wide`}>
                            <Icon size={11} strokeWidth={1.5} />{rs.label}
                          </span>
                        </div>
                        <p className="text-[13px] text-foreground/75 leading-relaxed font-sans italic">
                          &ldquo;{persona.reaction}&rdquo;
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                data && data.empathy_result && (
                  <EmpathyRing
                    personas={personas}
                    empathyPersonaResults={data.empathy_result.personas}
                    onSelectPersona={(id) => setSelectedPersonaId(id)}
                    onChatPersona={(id) => setChatPersonaId(id)}
                    selectedPersonaId={selectedPersonaId}
                  />
                )
              )}
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
                  <RefreshCw size={13} strokeWidth={1.8} className="text-muted-foreground" />
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
                    <ChevronDown size={12} strokeWidth={1.8} className="transition-transform group-open:rotate-180" />
                    Interpretation Breakdown
                  </summary>
                  <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border">
                    {(["alarm", "confusion", "agreement", "skepticism"] as const).map(s => {
                      const rs = REACTION_STYLES[s]
                      const SentimentIcon = rs.Icon
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <SentimentIcon size={12} strokeWidth={1.5} className="shrink-0" />
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

          {/* ── STAGE 4: SEMANTIC DECAY (MEANING HALF-LIFE) ────── */}
          <AnimatePresence>
            {stage === "complete" && data && data.meaning_half_life && showRewrite && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-12"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={13} strokeWidth={1.8} className="text-muted-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                    Stage 04 — Semantic Decay & Meaning Half-Life
                  </span>
                </div>

                <div className="border border-[#00c9b1]/15 bg-[#0a0a0f]/80 backdrop-blur-md p-5 mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[4px]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-[10px] text-[#00e5cc]/80 uppercase tracking-widest">Original Intent</p>
                      <p className="text-foreground text-sm font-sans mt-1">&ldquo;{data.meaning_half_life.original_meaning}&rdquo;</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-mono text-[10px] text-[#00e5cc]/80 uppercase tracking-widest">Retention Score</p>
                      <p className="font-display font-black text-2xl text-[#00e5cc] leading-none mt-1">
                        {data.meaning_half_life.meaning_retention_score}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/20 pt-4">
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Emergent Interpretations</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-foreground/80 font-sans">
                        {data.meaning_half_life.emergent_meanings.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Meaning Half-Life</p>
                      <p className="text-sm font-semibold text-[#00e5cc] font-mono">{data.meaning_half_life.meaning_half_life}</p>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-sans">
                        (The number of interpretation steps before original intent loses dominance)
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/20 mt-4 pt-4">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Final Dominant Interpretation</p>
                    <p className="text-sm text-foreground/90 font-sans leading-relaxed mt-1 italic">&ldquo;{data.meaning_half_life.final_interpretation}&rdquo;</p>
                  </div>
                </div>
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

      {/* Persona Chat Drawer */}
      {data && (
        <PersonaChatDrawer
          persona={chatPersonaId ? data.persona_reactions.find(p => p.id === chatPersonaId) ?? null : null}
          headline={data.headline}
          onClose={() => setChatPersonaId(null)}
        />
      )}
    </>
  )
}
