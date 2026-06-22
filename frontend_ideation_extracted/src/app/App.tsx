import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Eye,
  ArrowRight,
  Shield,
  Zap,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

type Stage = "idle" | "checking" | "revealing" | "complete";
type Reaction = "alarm" | "confusion" | "agreement" | "skepticism";

interface Persona {
  id: number;
  name: string;
  location: string;
  reaction: Reaction;
  interpretation: string;
  quote: string;
}

const SAMPLE_TEXT =
  "We need to protect our culture from outside influence.";

const PERSONAS: Persona[] = [
  {
    id: 1,
    name: "Retired Teacher, 60",
    location: "Coimbatore, Tamil Nadu",
    reaction: "agreement",
    interpretation: "Preservation of generational heritage",
    quote:
      "Finally someone speaking up for our traditions. Western values are eroding what we have built over centuries.",
  },
  {
    id: 2,
    name: "Engineering Student, 19",
    location: "Delhi, North India",
    reaction: "skepticism",
    interpretation: "Coded exclusion language",
    quote:
      "This is the framing used to justify censorship and restrict who belongs here. 'Our culture' always seems to exclude someone.",
  },
  {
    id: 3,
    name: "Small Business Owner, 38",
    location: "Patna — low institutional trust",
    reaction: "alarm",
    interpretation: "Political distraction tactic",
    quote:
      "Every time politicians say 'culture,' prices go up next week. They use it to stop us from asking about real problems.",
  },
  {
    id: 4,
    name: "IT Professional, 35",
    location: "Bengaluru, Tech sector",
    reaction: "confusion",
    interpretation: "Too vague — which culture?",
    quote:
      "India has 22 official languages and hundreds of traditions. This statement is too ambiguous to mean anything policy-relevant.",
  },
  {
    id: 5,
    name: "Farmer, 45",
    location: "Rural Punjab, Agriculture",
    reaction: "agreement",
    interpretation: "Defense of traditional farming",
    quote:
      "Yes — our farming methods, our festivals, our seeds. Corporations are taking everything and we are told to modernize.",
  },
  {
    id: 6,
    name: "Journalist, 28",
    location: "Mumbai, Media",
    reaction: "skepticism",
    interpretation: "Minority-targeting signal",
    quote:
      "I have covered enough communal tension to know what this framing precedes. 'Outside influence' rarely means Netflix.",
  },
  {
    id: 7,
    name: "First-Gen Smartphone User, 42",
    location: "Tier-3 town, Digital newcomer",
    reaction: "confusion",
    interpretation: "Unclear reference — apps? media?",
    quote:
      "What outside influence? Is this about the Chinese apps that got banned? Or something else? I am genuinely unsure.",
  },
  {
    id: 8,
    name: "Government Employee, 50",
    location: "Lucknow, Public sector",
    reaction: "agreement",
    interpretation: "National sovereignty framing",
    quote:
      "Foreign-funded NGOs and media are actively destabilizing the country. Strong leaders should address this directly.",
  },
  {
    id: 9,
    name: "Activist, 22",
    location: "Chennai, Civil society",
    reaction: "alarm",
    interpretation: "Authoritarian warning sign",
    quote:
      "This is the opening line of every suppression campaign in recorded history. We should be very alarmed when leaders say this.",
  },
  {
    id: 10,
    name: "Homemaker, 40",
    location: "Ahmedabad, Family-focused",
    reaction: "confusion",
    interpretation: "Parental concern — social media?",
    quote:
      "I worry about what my kids are watching on YouTube. Is this about regulating that kind of content? I hope so.",
  },
  {
    id: 11,
    name: "Returned Migrant Worker, 36",
    location: "Gulf returnee, Economic anxiety",
    reaction: "alarm",
    interpretation: "Threat to overseas livelihood",
    quote:
      "I just came back from Qatar. If they restrict outside influence, does that mean fewer opportunities to work abroad?",
  },
  {
    id: 12,
    name: "Vernacular Student, 16",
    location: "Rural school, Hindi medium",
    reaction: "confusion",
    interpretation: "Entertainment lens — music ban?",
    quote:
      "Is this about foreign songs being restricted again? My friends said something about K-pop being banned last year.",
  },
];

const REACTION_STYLES = {
  alarm: {
    label: "ALARM",
    Icon: AlertTriangle,
    textColor: "text-red-400",
    cardBg: "bg-[#110509]",
    border: "border border-red-900/40",
    badge: "bg-red-900/25 text-red-400",
    dot: "bg-red-500",
    sourceBg: "bg-[#110509] border-red-900/40",
  },
  confusion: {
    label: "CONFUSION",
    Icon: HelpCircle,
    textColor: "text-amber-400",
    cardBg: "bg-[#120f04]",
    border: "border border-amber-900/40",
    badge: "bg-amber-900/25 text-amber-400",
    dot: "bg-amber-500",
    sourceBg: "bg-[#120f04] border-amber-900/40",
  },
  agreement: {
    label: "AGREEMENT",
    Icon: CheckCircle,
    textColor: "text-cyan-400",
    cardBg: "bg-[#021318]",
    border: "border border-cyan-900/40",
    badge: "bg-cyan-900/25 text-cyan-400",
    dot: "bg-cyan-500",
    sourceBg: "bg-[#021318] border-cyan-900/40",
  },
  skepticism: {
    label: "SKEPTICISM",
    Icon: Eye,
    textColor: "text-slate-400",
    cardBg: "bg-[#07101e]",
    border: "border border-white/8",
    badge: "bg-white/5 text-slate-400",
    dot: "bg-slate-500",
    sourceBg: "bg-[#07101e] border-white/10",
  },
} as const;

const counts = (reaction: Reaction) =>
  PERSONAS.filter((p) => p.reaction === reaction).length;

export default function App() {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [visibleCount, setVisibleCount] = useState(0);
  const [sourceResult, setSourceResult] = useState<
    "well-supported" | "contested" | "no-source" | null
  >(null);

  useEffect(() => {
    if (stage !== "revealing") return;
    if (visibleCount >= PERSONAS.length) {
      const t = setTimeout(() => setStage("complete"), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setVisibleCount((n) => n + 1),
      visibleCount === 0 ? 100 : 260
    );
    return () => clearTimeout(t);
  }, [stage, visibleCount]);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setStage("checking");
    setVisibleCount(0);
    setSourceResult(null);
    const t = setTimeout(() => {
      setSourceResult("contested");
      setStage("revealing");
    }, 1800);
    return () => clearTimeout(t);
  };

  const handleReset = () => {
    setStage("idle");
    setVisibleCount(0);
    setSourceResult(null);
    setText("");
  };

  const isAnalyzing = stage !== "idle";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm px-5 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-black tracking-tight text-foreground">
              PRIZM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
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
        {/* ── HERO / INPUT ───────────────────────────────────── */}
        {!isAnalyzing && (
          <motion.section
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-2xl"
          >
            <p className="font-mono text-xs text-primary uppercase tracking-widest mb-4">
              84% of harmful sharing is unintentional
            </p>
            <h1 className="font-display font-black text-5xl sm:text-6xl leading-none tracking-tight mb-4">
              HOW DO YOUR
              <br />
              <span className="text-primary">WORDS LAND</span>
              <br />
              OUT THERE?
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-lg">
              Paste any text — a headline, tweet, policy statement. See how 12
              different audience segments read it simultaneously, and get a
              safer rewrite.
            </p>

            {/* Input */}
            <div className="border border-border focus-within:border-white/20 transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a headline, post, or statement here..."
                className="w-full bg-transparent px-5 pt-4 pb-2 text-foreground placeholder:text-muted-foreground text-base resize-none outline-none min-h-[90px] font-sans"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handleAnalyze();
                }}
              />
              <div className="border-t border-border px-5 py-2.5 flex items-center justify-between">
                <button
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  load demo text
                </button>
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
                { stat: "84%", label: "unintentional harm" },
                { stat: "12", label: "audience segments" },
                { stat: "3-in-1", label: "verify → visualize → rewrite" },
              ].map(({ stat, label }) => (
                <div key={stat}>
                  <p className="font-display font-black text-2xl text-foreground leading-none">
                    {stat}
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── ACTIVE INPUT STRIP ─────────────────────────────── */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 mb-8"
          >
            <div className="flex-1 border border-border px-4 py-3">
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                Input
              </p>
              <p className="text-foreground text-sm leading-relaxed font-sans">
                &ldquo;{text}&rdquo;
              </p>
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

        {/* ── STAGE 1: SOURCE SIGNAL ─────────────────────────── */}
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
            </div>

            {!sourceResult ? (
              <div className="border border-border px-5 py-3 flex items-center gap-3 max-w-md">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  Checking source credibility...
                </span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 border border-amber-900/50 bg-[#120f04] px-4 py-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="font-mono text-xs text-amber-400 font-medium uppercase tracking-widest">
                  CONTESTED
                </span>
                <span className="font-mono text-xs text-muted-foreground hidden sm:block">
                  — multiple credible framings; original claim disputed across
                  sources
                </span>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* ── STAGE 2: PERSONA GRID ──────────────────────────── */}
        {(stage === "revealing" || stage === "complete") &&
          visibleCount > 0 && (
            <section className="mb-10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-muted-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                    Stage 02 — Context Collapse
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  {visibleCount < PERSONAS.length ? (
                    <span className="text-muted-foreground">
                      {visibleCount} / {PERSONAS.length} segments
                    </span>
                  ) : (
                    <>
                      {(
                        [
                          "alarm",
                          "confusion",
                          "agreement",
                          "skepticism",
                        ] as Reaction[]
                      ).map((r) => {
                        const rs = REACTION_STYLES[r];
                        return (
                          <span
                            key={r}
                            className={`flex items-center gap-1.5 ${rs.textColor}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${rs.dot} shrink-0`}
                            />
                            {counts(r)} {rs.label}
                          </span>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {PERSONAS.slice(0, visibleCount).map((persona) => {
                  const rs = REACTION_STYLES[persona.reaction];
                  const Icon = rs.Icon;
                  return (
                    <motion.div
                      key={persona.id}
                      initial={{ opacity: 0, scale: 0.96, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className={`${rs.cardBg} ${rs.border} p-4`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="font-display font-bold text-[15px] text-foreground leading-tight">
                            {persona.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                            {persona.location}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 font-mono text-[9px] px-1.5 py-0.5 ${rs.badge} flex items-center gap-1 uppercase tracking-wide`}
                        >
                          <Icon size={9} />
                          {rs.label}
                        </span>
                      </div>

                      <p
                        className={`font-mono text-[10px] uppercase tracking-wide ${rs.textColor} mb-2 opacity-70`}
                      >
                        {persona.interpretation}
                      </p>

                      <p className="text-[13px] text-foreground/75 leading-relaxed font-sans italic">
                        &ldquo;{persona.quote}&rdquo;
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

        {/* ── STAGE 3: SAFE REWRITE ──────────────────────────── */}
        {stage === "complete" && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={12} className="text-muted-foreground" />
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Stage 03 — Safe Phrasing Suggester
              </span>
            </div>

            {/* Side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
              {/* Original */}
              <div className="border border-border bg-muted p-5">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                  Original Text
                </p>
                <p className="text-foreground text-sm leading-relaxed mb-5 font-sans">
                  &ldquo;{text}&rdquo;
                </p>
                <div className="border border-border px-3 py-2 inline-block">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Divergence Score
                  </p>
                  <p className="font-display text-4xl font-black text-red-400 leading-none mt-0.5">
                    78%
                  </p>
                </div>
              </div>

              {/* Rewrite */}
              <div className="border border-cyan-900/50 bg-[#021318] p-5">
                <p className="font-mono text-[10px] text-cyan-400/70 uppercase tracking-widest mb-3">
                  Suggested Rewrite
                </p>
                <p className="text-foreground text-sm leading-relaxed mb-5 font-sans">
                  &ldquo;We need to support local cultural traditions and the
                  heritage of our communities — including their right to
                  evolve.&rdquo;
                </p>
                <div className="border border-cyan-900/50 px-3 py-2 inline-block">
                  <p className="font-mono text-[10px] text-cyan-400/70">
                    Divergence Score
                  </p>
                  <p className="font-display text-4xl font-black text-cyan-400 leading-none mt-0.5">
                    31%
                  </p>
                </div>
              </div>
            </div>

            {/* Delta */}
            <div className="border border-primary/25 bg-primary/5 px-5 py-3.5 flex items-center gap-4">
              <div className="w-0.5 h-10 bg-primary shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest">
                  Divergence reduction
                </p>
                <p className="font-display font-black text-xl text-primary leading-tight">
                  ↓ 47 points — from high-risk to manageable
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* ── INTENT DISCLAIMER ──────────────────────────────── */}
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

        {/* ── IDLE FOOTER ────────────────────────────────────── */}
        {!isAnalyzing && (
          <footer className="border-t border-border pt-6 mt-6">
            <p className="font-mono text-[11px] text-muted-foreground">
              Based on MIT Sloan / Nature (2021) · Stanford Internet Observatory
              (2025) · MIT Media Lab (2018)
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}
