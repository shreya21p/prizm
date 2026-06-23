import { createRoot } from "react-dom/client"
import { useState } from "react"
import App from "./components/App"
import LoginPage, { type GoogleUser } from "./components/LoginPage"
import "./styles/index.css"

// Preload GIS font so it isn't FOIT
const link1 = document.createElement("link")
link1.rel = "preconnect"
link1.href = "https://fonts.googleapis.com"
document.head.appendChild(link1)

const link2 = document.createElement("link")
link2.rel = "stylesheet"
link2.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
document.head.appendChild(link2)

// ─── Root with auth gate ───────────────────────────────────────────────────────
function Root() {
  const [user, setUser] = useState<GoogleUser | null>(null)

  if (!user) {
    return <LoginPage onLogin={setUser} />
  }

  return <App user={user} onSignOut={() => setUser(null)} />
}

createRoot(document.getElementById("root")!).render(<Root />)
