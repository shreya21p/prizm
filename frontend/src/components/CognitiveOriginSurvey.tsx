import React, { useState, useEffect, useRef } from "react"

interface SurveyProfile {
  origin: string
  language: string
  profession: string
  audience: string
}

interface CognitiveOriginSurveyProps {
  isVisible: boolean
  onComplete: (profile: SurveyProfile) => void
  activeQuestionIndex: number
  setActiveQuestionIndex: (idx: number) => void
}

const QUESTIONS = [
  {
    key: "origin" as keyof SurveyProfile,
    text: "Where did you grow up?",
    options: [
      { label: "Metro city", value: "metro" },
      { label: "Small city", value: "small_city" },
      { label: "Town", value: "town" },
      { label: "Village", value: "village" }
    ]
  },
  {
    key: "language" as keyof SurveyProfile,
    text: "What language do you think in?",
    options: [
      { label: "English", value: "english" },
      { label: "Hindi", value: "hindi" },
      { label: "Regional language", value: "regional" },
      { label: "Mixed", value: "mixed" }
    ]
  },
  {
    key: "profession" as keyof SurveyProfile,
    text: "What's your field?",
    options: [
      { label: "Policy / Govt", value: "policy" },
      { label: "Media / PR", value: "media" },
      { label: "Business", value: "business" },
      { label: "Education", value: "education" }
    ]
  },
  {
    key: "audience" as keyof SurveyProfile,
    text: "Who were you writing this for?",
    options: [
      { label: "General public", value: "general" },
      { label: "Specific community", value: "community" },
      { label: "Decision makers", value: "decision" },
      { label: "Not sure", value: "not_sure" }
    ]
  }
]

export default function CognitiveOriginSurvey({
  isVisible,
  onComplete,
  activeQuestionIndex,
  setActiveQuestionIndex
}: CognitiveOriginSurveyProps) {
  const [profile, setProfile] = useState<Partial<SurveyProfile>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnimatingIn, setIsAnimatingIn] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [])

  // Reset local state when survey becomes visible
  useEffect(() => {
    if (isVisible) {
      setProfile({})
      setSelectedOption(null)
      setIsCollapsing(false)
      setIsAnimatingIn(false)
    }
  }, [isVisible])

  // Trigger anim-in on question index change
  useEffect(() => {
    if (prefersReducedMotion) return
    setIsAnimatingIn(false)
    const t = setTimeout(() => {
      setIsAnimatingIn(true)
    }, 200) // Entrance delay: 200ms
    return () => clearTimeout(t)
  }, [activeQuestionIndex, prefersReducedMotion])

  if (!isVisible) return null

  const handleSelectOption = (key: keyof SurveyProfile, value: string) => {
    setSelectedOption(value)
    const updatedProfile = { ...profile, [key]: value }
    setProfile(updatedProfile)

    const isLastQuestion = activeQuestionIndex === QUESTIONS.length - 1

    if (prefersReducedMotion) {
      if (isLastQuestion) {
        onComplete(updatedProfile as SurveyProfile)
      } else {
        setSelectedOption(null)
        setActiveQuestionIndex(activeQuestionIndex + 1)
      }
      return
    }

    // Delay transition for pulse animation
    setTimeout(() => {
      if (isLastQuestion) {
        setIsCollapsing(true)
        // Wait for survey exit animation to complete (300ms)
        setTimeout(() => {
          onComplete(updatedProfile as SurveyProfile)
        }, 300)
      } else {
        setSelectedOption(null)
        setActiveQuestionIndex(activeQuestionIndex + 1)
      }
    }, 200) // Brief pulse: 200ms
  }

  // If reduced motion is enabled, show all unanswered questions at once
  if (prefersReducedMotion) {
    return (
      <div className="w-full max-w-[600px] mx-auto py-6 text-left space-y-8">
        <h3 className="font-mono text-xs text-primary uppercase tracking-widest text-center mb-6">
          Cognitive Profile Survey
        </h3>
        {QUESTIONS.map((q, idx) => {
          const isAnswered = profile[q.key] !== undefined
          const currentVal = profile[q.key]
          return (
            <div key={q.key} className="space-y-3">
              <p className="text-base font-normal text-[#e8e8f0]">{q.text}</p>
              <div className="flex flex-wrap gap-3">
                {q.options.map(opt => {
                  const isSelected = currentVal === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectOption(q.key, opt.value)}
                      className={`h-9 px-5 rounded-[20px] text-sm font-medium border transition-colors ${
                        isSelected
                          ? "bg-[rgba(0,201,177,0.12)] border-[#00c9b1] text-[#00e5cc]"
                          : "bg-[#111118] border-[#2a2a3e] text-[#a0a0b8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const currentQuestion = QUESTIONS[activeQuestionIndex]

  return (
    <div
      ref={containerRef}
      className="survey-wrapper w-full max-w-[600px] mx-auto flex flex-col items-center justify-center select-none"
      style={{
        maxHeight: isCollapsing ? "0px" : "300px",
        opacity: isCollapsing ? 0 : 1,
        marginTop: isCollapsing ? "0px" : "1.5rem",
        marginBottom: isCollapsing ? "0px" : "1.5rem",
        transition: "max-height 300ms ease-out, opacity 300ms ease-out, margin 300ms ease-out"
      }}
    >
      <style>{`
        .survey-btn {
          background-color: #111118;
          border: 1px solid #2a2a3e;
          color: #a0a0b8;
          height: 36px;
          padding: 0 20px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          transition: border-color 150ms ease, color 150ms ease, background-color 150ms ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }
        .survey-btn:hover:not(:disabled) {
          border-color: rgba(0, 201, 177, 0.5);
          color: #e8e8f0;
        }
        .survey-btn.selected {
          background-color: rgba(0, 201, 177, 0.12);
          border-color: #00c9b1;
          color: #00e5cc;
          animation: surveyPulse 200ms ease-out;
        }
        @keyframes surveyPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 201, 177, 0.4); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 6px rgba(0, 201, 177, 0.1); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 201, 177, 0); }
        }
      `}</style>

      {currentQuestion && (
        <div
          className="w-full flex flex-col items-center"
          style={{
            opacity: isAnimatingIn ? 1 : 0,
            transform: isAnimatingIn ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 250ms ease-out, transform 250ms ease-out"
          }}
        >
          <h2 className="text-[18px] font-normal text-[#e8e8f0] text-center mb-[20px] leading-snug">
            {currentQuestion.text}
          </h2>
          <div className="flex flex-row flex-wrap gap-[12px] justify-center items-center">
            {currentQuestion.options.map(opt => {
              const isSelected = selectedOption === opt.value
              return (
                <button
                  key={opt.value}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(currentQuestion.key, opt.value)}
                  className={`survey-btn ${isSelected ? "selected" : ""}`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
