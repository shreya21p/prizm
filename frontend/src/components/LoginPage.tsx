import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { motion } from "motion/react"
import * as THREE from "three"

// ─── Mini shader plane for login background ───────────────────────────────────
const loginVertexShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.y += sin(pos.x * 8.0 + time * 0.6) * 0.08;
    pos.x += cos(pos.y * 6.0 + time * 0.9) * 0.04;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`
const loginFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  void main() {
    float n  = sin(vUv.x * 18.0 + time * 0.5) * cos(vUv.y * 12.0 + time * 0.7);
          n += sin(vUv.x * 32.0 - time * 1.2) * 0.4;
    vec3 c   = mix(color1, color2, n * 0.5 + 0.5);
    float g  = pow(max(1.0 - length(vUv - 0.5) * 2.0, 0.0), 1.8);
    gl_FragColor = vec4(c * g, g * 0.6);
  }
`

function LoginShaderPlane({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({
    time:   { value: 0 },
    color1: { value: new THREE.Color("#01021b") },
    color2: { value: new THREE.Color("#00b4d8") },
  }), [])
  useFrame(s => { if (mesh.current) uniforms.time.value = s.clock.elapsedTime })
  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[3, 3, 24, 24]} />
      <shaderMaterial uniforms={uniforms} vertexShader={loginVertexShader} fragmentShader={loginFragmentShader} transparent side={THREE.DoubleSide} />
    </mesh>
  )
}

function LoginParticles() {
  const pts = useRef<THREE.Points>(null)
  const pos = useMemo(() => {
    const arr = new Float32Array(80 * 3)
    for (let i = 0; i < 80; i++) {
      arr[i*3]   = (Math.random() - 0.5) * 10
      arr[i*3+1] = (Math.random() - 0.5) * 6
      arr[i*3+2] = (Math.random() - 0.5) * 3
    }
    return arr
  }, [])
  useFrame(s => { if (pts.current) pts.current.rotation.y = s.clock.elapsedTime * 0.035 })
  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00b4d8" size={0.035} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function LoginCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 55 }} dpr={[1, 1.2]}>
      <LoginParticles />
      <LoginShaderPlane position={[-2.5, 1.2, -1.5]} />
      <LoginShaderPlane position={[ 2.5, -1.2, -1.5]} />
    </Canvas>
  )
}

// ─── Google SVG logo ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.2 30.3 0 24 0 14.7 0 6.7 5.5 2.7 13.5l7.9 6.1C12.4 13.2 17.8 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.5-.1-3-.4-4.5H24v8.5h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 7.2-16.9z"/>
      <path fill="#FBBC05" d="M10.6 28.6A14.7 14.7 0 0 1 9.5 24c0-1.6.3-3.2.7-4.6l-7.9-6.1A23.8 23.8 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.1z"/>
      <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.4-5.6l-7.3-5.7c-2.1 1.4-4.7 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.1C6.7 42.5 14.7 48 24 48z"/>
    </svg>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface LoginPageProps {
  onLogin: (user: GoogleUser) => void
}

export interface GoogleUser {
  name:    string
  email:   string
  picture: string
  sub:     string
}

// ─── Google OAuth helper ───────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

// ─── Login Page ──────────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }: LoginPageProps) {
  // Check for returning redirect token in the hash on mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const idToken = params.get("id_token")
      if (idToken) {
        try {
          const parts = idToken.split(".")
          if (parts.length >= 2) {
            const payload = JSON.parse(
              atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
            )
            onLogin({
              name:    payload.name || "Google User",
              email:   payload.email || "",
              picture: payload.picture || "",
              sub:     payload.sub || "",
            })
            // Clear hash from URL
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } catch (e) {
          console.error("Failed to parse Google ID token:", e)
        }
      }
    }
  }, [onLogin])

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) return
    const redirectUri = window.location.origin
    const scope = "openid profile email"
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=${encodeURIComponent(scope)}&nonce=prizm_nonce`
    window.location.href = authUrl
  }

  const handleGoogleLoginMock = () => {
    onLogin({ name: "Demo User", email: "demo@prizm.local", picture: "", sub: "demo-00001" })
  }

  return (
    <>
      {/* WebGL background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <LoginCanvas />
      </div>

      {/* Scanline overlay */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "repeating-linear-gradient(to bottom,transparent 0px,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(1,2,27,0.92) 100%)",
        }}
      />

      {/* Login shell */}
      <div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Top brand bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 right-0 flex items-center gap-3 px-8 py-5 border-b"
          style={{ borderColor: "rgba(144,224,239,0.1)", background: "rgba(1,2,27,0.5)", backdropFilter: "blur(16px)" }}
        >
          <span className="text-2xl" style={{ color: "#00b4d8", fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: "-0.02em" }}>
            PRIZM
          </span>
          <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(144,224,239,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Context Collapse Visualizer
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00b4d8" }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(0,180,216,0.7)" }}>
              SYSTEMS_NOMINAL
            </span>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "rgba(3,4,94,0.35)",
            backdropFilter: "blur(24px)",
            border: "0.5px solid rgba(144,224,239,0.2)",
            borderRadius: "4px",
            boxShadow: "0 0 40px rgba(0,180,216,0.08), 0 24px 60px rgba(1,2,27,0.7)",
            padding: "40px 36px",
          }}
        >
          {/* Corner accents — Stitch design detail */}
          {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((cls, i) => (
            <div key={i} className={`absolute ${cls} w-4 h-4`} style={{ borderColor: "rgba(0,180,216,0.4)" }} />
          ))}

          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
              style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)", boxShadow: "0 0 20px rgba(0,180,216,0.1)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00b4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#caf0f8", letterSpacing: "-0.02em", lineHeight: 1.1, textAlign: "center", marginBottom: "8px" }}>
              SIGN IN
            </h1>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(144,224,239,0.55)", textAlign: "center", lineHeight: 1.6 }}>
              Access the Context Collapse Visualizer.<br />Authenticate to continue.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {[["84%", "unintentional harm"], ["12", "segments"], ["3-in-1", "pipeline"]].map(([stat, label]) => (
              <div key={stat} className="text-center">
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#4cd6fb", lineHeight: 1 }}>{stat}</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "9px", color: "rgba(144,224,239,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", background: "rgba(144,224,239,0.08)", marginBottom: "28px" }} />

          {/* Google Sign-In */}
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(144,224,239,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", marginBottom: "14px" }}>
            AUTHENTICATE WITH
          </p>
          <button
            id="prizm-google-signin-btn"
            onClick={GOOGLE_CLIENT_ID ? handleGoogleLogin : handleGoogleLoginMock}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(144,224,239,0.25)",
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.18s ease",
              color: "#caf0f8",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,180,216,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
          >
            <GoogleIcon />
            Continue with Google
          </button>
          {!GOOGLE_CLIENT_ID && (
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(0,180,216,0.45)", textAlign: "center", marginTop: "12px" }}>
              (Demo mode — set VITE_GOOGLE_CLIENT_ID to enable real auth)
            </p>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(144,224,239,0.08)" }} />
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "10px", color: "rgba(144,224,239,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(144,224,239,0.08)" }} />
          </div>

          {/* Continue as guest */}
          <button
            id="prizm-guest-btn"
            onClick={() => onLogin({ name: "Guest", email: "guest@prizm.local", picture: "", sub: "guest" })}
            style={{
              width: "100%",
              padding: "11px 20px",
              background: "transparent",
              border: "0.5px solid rgba(144,224,239,0.15)",
              borderRadius: "3px",
              cursor: "pointer",
              color: "rgba(144,224,239,0.55)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "all 0.18s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#caf0f8")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(144,224,239,0.55)")}
          >
            Continue as Guest
          </button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "10px",
            color: "rgba(144,224,239,0.25)",
            textAlign: "center",
            marginTop: "28px",
            letterSpacing: "0.04em",
          }}
        >
          Based on MIT Sloan / Nature (2021) · Stanford Internet Observatory (2025) · MIT Media Lab (2018)
        </motion.p>
      </div>
    </>
  )
}
