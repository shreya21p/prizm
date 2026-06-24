import { useState, useEffect } from "react"

interface EmpathyPersonaResult {
  id: string
  zone: string
  distance: number
  similarity: number
  reached: boolean
}

interface PersonaReaction {
  id: string
  label: string
  emoji: string
  reaction: string
}

interface EmpathyRingProps {
  personas: PersonaReaction[]
  empathyPersonaResults: EmpathyPersonaResult[]
  onSelectPersona?: (personaId: string) => void
  onChatPersona?: (personaId: string) => void
  selectedPersonaId?: string | null
}

// Pure SVG path icons — no foreignObject, no DOM, no flicker
function SvgPersonaIcon({ id, cx, cy, size = 12, color }: {
  id: string; cx: number; cy: number; size?: number; color: string
}) {
  const s = size / 24  // scale factor from 24x24 viewBox to desired size
  const tx = cx - size / 2
  const ty = cy - size / 2

  const iconPaths: Record<string, string> = {
    startup_founder_pune: "M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 9c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5M19 5c-3-3-9-2-12 1s-4 9-1 12c3 3 9 2 12-1s4-9 1-12z",
    urban_student_vadodara: "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM6 12v5c0 2 2 3 6 3s6-1 6-3v-5",
    corporate_employee_chennai: "M2 4h20v12H2zM2 20h20M12 16v4",
    homemaker_thanjavur: "M3 18h18M9 18V9a6 6 0 0 1 12 0v9",
    homemaker_hoshiarpur: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
    business_owner_surat: "M2 7h20v14H2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    farmer_kannur: "M13 22H4M10 22C10 12 16 6 21 6M13 6c-2.4 0-4.4 2-5 4.5",
    farmer_anantapur: "M2 22 22 2M8 12c.5-2.5 2.5-4 4.5-4.5M12 8c.5-2.5 2.5-4 4.5-4.5",
    business_owner_aligarh: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5",
    aspirant_sangli: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    retired_officer_ujjain: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
    retired_officer_guntur: "M8 2h8v4H8zM16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 11h8M8 16h8",
  }

  const d = iconPaths[id] || "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"

  return (
    <g transform={`translate(${tx}, ${ty}) scale(${s})`} pointerEvents="none">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

export default function EmpathyRing({
  personas,
  empathyPersonaResults,
  onSelectPersona,
  onChatPersona,
  selectedPersonaId
}: EmpathyRingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mq.matches)
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [])

  // Gentle tick for pulsing core — replaces broken Tailwind ping on SVG
  useEffect(() => {
    if (prefersReducedMotion) return
    const id = setInterval(() => setTick(t => (t + 1) % 60), 50)
    return () => clearInterval(id)
  }, [prefersReducedMotion])

  const corePulseR = prefersReducedMotion ? 0 : 6 + Math.sin(tick * 0.2) * 3
  const corePulseOpacity = prefersReducedMotion ? 0 : 0.15 + Math.sin(tick * 0.2) * 0.1

  // Map persona reactions to empathy results
  const mappedPersonas = personas.map((p, idx) => {
    const emp = empathyPersonaResults.find(r => r.id === p.id) ?? {
      zone: "BLIND_SPOT",
      distance: 1.0,
      similarity: 0.0,
      reached: false
    }
    return { ...p, ...emp, index: idx }
  })

  // Concentric ring boundaries
  const rClose = 82
  const rDistant = 130
  const rBlindSpot = 170

  const getRadius = (distance: number) => {
    if (distance < 0.35) return 28 + (distance / 0.35) * (rClose - 28)
    if (distance < 0.48) return rClose + ((distance - 0.35) / 0.13) * (rDistant - rClose)
    return rDistant + (Math.min(distance, 1.0) - 0.48) / 0.52 * (rBlindSpot - rDistant)
  }

  const getXY = (radius: number, index: number) => {
    const angleDeg = (index * 360) / 12 - 90
    const rad = (angleDeg * Math.PI) / 180
    return { x: 200 + radius * Math.cos(rad), y: 200 + radius * Math.sin(rad) }
  }

  const zoneColor = (zone: string) => {
    if (zone === "CLOSE") return { stroke: "#00c9b1", nodeFill: "#021318", iconColor: "#00e5cc" }
    if (zone === "DISTANT") return { stroke: "#f59e0b", nodeFill: "#120f04", iconColor: "#fbbf24" }
    return { stroke: "#ef4444", nodeFill: "#110509", iconColor: "#f87171" }
  }

  const activePersona = mappedPersonas.find(p => p.id === (hoveredId || selectedPersonaId))

  // Build spoke coordinates once
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const rad = ((i * 30 - 90) * Math.PI) / 180
    return { x: 200 + rBlindSpot * Math.cos(rad), y: 200 + rBlindSpot * Math.sin(rad) }
  })

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 py-4 select-none">
      {/* SVG */}
      <div className="relative shrink-0" style={{ width: "min(100%, 380px)", aspectRatio: "1" }}>
        <svg viewBox="0 0 400 400" className="w-full h-full" style={{ overflow: "visible" }}>
          {/* ── Spokes ── */}
          {spokes.map((s, i) => (
            <line key={i} x1={200} y1={200} x2={s.x} y2={s.y}
              stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
          ))}

          {/* ── Zone rings ── */}
          <circle cx={200} cy={200} r={rBlindSpot}
            fill="rgba(239,68,68,0.01)" stroke="rgba(239,68,68,0.1)"
            strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={200} cy={200} r={rDistant}
            fill="rgba(245,158,11,0.01)" stroke="rgba(245,158,11,0.1)"
            strokeWidth={1.5} strokeDasharray="4 4" />
          <circle cx={200} cy={200} r={rClose}
            fill="rgba(0,201,177,0.02)" stroke="rgba(0,201,177,0.13)"
            strokeWidth={1.5} strokeDasharray="4 4" />

          {/* ── Zone labels ── */}
          <text x={206} y={200 - rClose + 10} fontSize={7} fill="#00e5cc" fillOpacity={0.5}
            fontFamily="monospace" letterSpacing={1}>CLOSE</text>
          <text x={206} y={200 - rDistant + 10} fontSize={7} fill="#f59e0b" fillOpacity={0.5}
            fontFamily="monospace" letterSpacing={1}>DISTANT</text>
          <text x={206} y={200 - rBlindSpot + 10} fontSize={7} fill="#ef4444" fillOpacity={0.5}
            fontFamily="monospace" letterSpacing={1}>BLIND SPOT</text>

          {/* ── Active highlight ring + connector ── */}
          {activePersona && (() => {
            const r = getRadius(activePersona.distance)
            const { x, y } = getXY(r, activePersona.index)
            const c = zoneColor(activePersona.zone)
            return (
              <g>
                <line x1={200} y1={200} x2={x} y2={y}
                  stroke={c.stroke} strokeWidth={1.5} strokeOpacity={0.5}
                  strokeDasharray="3 3" />
                <circle cx={200} cy={200} r={r}
                  fill="none" stroke={c.stroke} strokeWidth={1} strokeOpacity={0.2} />
              </g>
            )
          })()}

          {/* ── Pulse core (animated via JS tick, no Tailwind) ── */}
          <circle cx={200} cy={200} r={corePulseR + 14}
            fill="none" stroke="#00cfff" strokeOpacity={corePulseOpacity} strokeWidth={1} />
          <circle cx={200} cy={200} r={14}
            fill="rgba(0,207,255,0.08)" stroke="#00cfff" strokeWidth={1.5} />
          <circle cx={200} cy={200} r={5} fill="#00cfff" />

          {/* ── Persona nodes ── */}
          {mappedPersonas.map(persona => {
            const r = getRadius(persona.distance)
            const { x, y } = getXY(r, persona.index)
            const c = zoneColor(persona.zone)
            const isHovered = hoveredId === persona.id
            const isSelected = selectedPersonaId === persona.id
            const isActive = isHovered || isSelected

            return (
              <g
                key={persona.id}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredId(persona.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectPersona?.(persona.id)}
              >
                {/* Outer glow when active */}
                {isActive && (
                  <circle cx={x} cy={y} r={20}
                    fill="none" stroke={c.stroke} strokeWidth={1.5} strokeOpacity={0.7} />
                )}

                {/* Node circle */}
                <circle cx={x} cy={y} r={15}
                  fill={isSelected ? c.stroke : c.nodeFill}
                  stroke={c.stroke}
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {/* Reached indicator dot */}
                {persona.reached && (
                  <circle cx={x + 10} cy={y - 10} r={3.5}
                    fill="#00e5cc" stroke="#0a0a0f" strokeWidth={1} />
                )}

                {/* SVG path icon */}
                <SvgPersonaIcon
                  id={persona.id}
                  cx={x} cy={y}
                  size={13}
                  color={isSelected ? "#0a0a0f" : c.iconColor}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Details panel */}
      <div className="w-full flex-1" style={{ minWidth: 260 }}>
        <div className="border border-border bg-card/30 backdrop-blur-md p-5"
          style={{ minHeight: 180 }}>
          {activePersona ? (
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-secondary/50">
                    <svg viewBox="0 0 24 24" width={16} height={16}
                      fill="none" stroke="#00c9b1" strokeWidth={1.8}
                      strokeLinecap="round" strokeLinejoin="round">
                      <circle cx={12} cy={12} r={10} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-foreground leading-tight">
                      {activePersona.label}
                    </h4>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      Similarity: {(activePersona.similarity * 100).toFixed(1)}% · Distance: {activePersona.distance.toFixed(3)}
                    </p>
                  </div>
                </div>
                <span className={`shrink-0 font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider font-semibold rounded-[4px] border ${
                  activePersona.zone === "CLOSE"
                    ? "bg-[rgba(0,201,177,0.1)] text-[#00e5cc] border-[#00c9b1]/20"
                    : activePersona.zone === "DISTANT"
                    ? "bg-[rgba(245,158,11,0.08)] text-amber-400 border-amber-900/30"
                    : "bg-[rgba(239,68,68,0.08)] text-red-400 border-red-900/30"
                }`}>
                  {activePersona.zone.replace("_", " ")}
                </span>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed font-sans italic border-l-2 border-border/40 pl-3">
                &ldquo;{activePersona.reaction}&rdquo;
              </p>

              <button
                onClick={() => onChatPersona?.(activePersona.id)}
                className="mt-4 w-full py-2 border border-primary/30 bg-primary/5 text-primary font-mono text-xs uppercase tracking-widest hover:bg-primary/10 transition-colors"
              >
                Chat with this persona →
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth={1.2}
                className="text-muted-foreground/40 mb-3">
                <circle cx={12} cy={12} r={10} />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest max-w-[200px]">
                Hover or click a node to see context collapse
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
