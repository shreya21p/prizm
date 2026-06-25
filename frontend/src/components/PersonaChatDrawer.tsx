import { useState, useRef, useEffect, useCallback } from "react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface PersonaReaction {
  id: string
  label: string
  emoji: string
  reaction: string
}

interface PersonaChatDrawerProps {
  persona: PersonaReaction | null
  headline: string
  onClose: () => void
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          style={{
            animation: "chatDotBounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes chatDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

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

function PersonaIcon({ id, size = 18, className = "" }: { id: string; size?: number; className?: string }) {
  const path = iconPaths[id]
  if (!path) return <span className={className}>👤</span>
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}

export default function PersonaChatDrawer({ persona, headline, onClose }: PersonaChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Animate in when persona changes
  useEffect(() => {
    if (persona) {
      setMessages([])
      setInput("")
      // Small delay then animate in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
      setTimeout(() => inputRef.current?.focus(), 350)
    } else {
      setIsVisible(false)
    }
  }, [persona?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [handleClose])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !persona) return

    const userMsg = input.trim()
    setInput("")
    setIsLoading(true)

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }]
    setMessages(newMessages)

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona_id: persona.id,
          headline,
          initial_reaction: persona.reaction,
          messages: messages,
          user_message: userMsg,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setMessages([...newMessages, { role: "assistant", content: data.reply }])
    } catch (e) {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Sorry, I couldn't respond right now. Try again."
      }])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, isLoading, persona, messages, headline])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!persona) return null

  const hasMessages = messages.length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40"
        style={{
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(480px, 100vw)",
          background: "#0d0d14",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,201,177,0.1)", border: "1px solid rgba(0,201,177,0.2)" }}
            >
              <PersonaIcon id={persona.id} size={20} className="text-[#00c9b1]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-foreground leading-tight truncate">
                {persona.label}
              </h3>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                In-character conversation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 ml-3 p-2 text-muted-foreground hover:text-foreground transition-colors rounded"
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Context bubble */}
        <div className="mx-4 my-3 px-4 py-3 rounded border shrink-0"
          style={{
            background: "rgba(0,201,177,0.04)",
            borderColor: "rgba(0,201,177,0.12)",
          }}>
          <p className="font-mono text-[9px] text-primary/60 uppercase tracking-widest mb-1">
            Their initial reaction to your headline
          </p>
          <p className="text-xs text-foreground/70 font-sans italic leading-relaxed">
            &ldquo;{persona.reaction}&rdquo;
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
          {!hasMessages && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/[0.06] text-primary/60 mb-4">
                <PersonaIcon id={persona.id} size={26} />
              </div>
              <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest max-w-[220px] leading-relaxed">
                Ask them anything — why they reacted this way, what would change their mind, what they actually need
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-muted-foreground mr-2 shrink-0 mt-0.5">
                  <PersonaIcon id={persona.id} size={12} />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed font-sans ${
                  msg.role === "user"
                    ? "text-foreground rounded-2xl rounded-tr-sm"
                    : "text-foreground/90 rounded-2xl rounded-tl-sm italic"
                }`}
                style={msg.role === "user" ? {
                  background: "rgba(0,207,255,0.12)",
                  border: "1px solid rgba(0,207,255,0.15)",
                } : {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-muted-foreground mr-2 shrink-0">
                <PersonaIcon id={persona.id} size={12} />
              </div>
              <div
                className="rounded-2xl rounded-tl-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-3 shrink-0 border-t border-white/[0.06]">
          <div
            className="flex items-end gap-2 rounded border p-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${persona.label.split(" (")[0]}…`}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none font-sans leading-relaxed"
              style={{ maxHeight: 120, minHeight: 40 }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: input.trim() && !isLoading
                  ? "rgba(0,201,177,0.15)"
                  : "transparent",
                color: "#00c9b1",
                border: "1px solid rgba(0,201,177,0.2)",
              }}
            >
              <SendIcon />
            </button>
          </div>
          <p className="font-mono text-[9px] text-muted-foreground/40 mt-2 text-center">
            Enter to send · Shift+Enter for new line · Esc to close
          </p>
        </div>
      </div>
    </>
  )
}
