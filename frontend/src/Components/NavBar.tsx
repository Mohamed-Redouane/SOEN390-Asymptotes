
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, LogOut } from "lucide-react"
import { useAuthContext } from "../context/authContext"
import { useAuthService } from "../services/authService"

export default function NavBar() {
  const [isHovered, setIsHovered] = useState(false)
  const { user } = useAuthContext()
  const { handleLogout } = useAuthService()
  const navigate = useNavigate()

  async function onLogoutClick() {
    try {
      await handleLogout()
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Memoize the animated pin so it's created only once.
  const animatedPin = useMemo(
    () => (
      <div
        style={{
          position: "relative",
          // Custom bounce animation with a 2s duration
          animation: "bounce 2s infinite",
        }}
      >
        <MapPin style={{ width: "32px", height: "32px", color: "white" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "32px",
            height: "32px",
            backgroundColor: "rgba(59,130,246,0.6)",
            borderRadius: "50%",
            filter: "blur(4px)",
            // Custom pulse animation with a 2s duration
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>
    ),
    [],
  )

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md shadow-lg overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#4361ee] to-[#7209b7] opacity-90"
        style={{
          animation: "gradient 10s linear infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        <a href="/" className="flex items-center space-x-3">
          {animatedPin}
          <div className="flex flex-col">
            <span
              className="text-2xl font-black text-white"
              style={{
                fontFamily: "'Clash Display', sans-serif",
                letterSpacing: "-0.02em",
                background: "linear-gradient(to right, #fff, #e0e7ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
              }}
            >
              <span style={{ color: "#fff", WebkitTextFillColor: "#fff" }}>ON</span>
              Campus
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Clash Display', sans-serif",
                fontWeight: 500,
                marginTop: "-4px",
                marginLeft: "1px",
              }}
            >
              DISCOVER • CONNECT
            </span>
          </div>
        </a>
        {user && (
          <button
            onClick={onLogoutClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group flex items-center px-6 py-2 rounded-full bg-white text-[#4361ee] font-semibold transition-all duration-300 focus:outline-none hover:bg-opacity-90"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            <span className="font-medium">Logout</span>
            <LogOut className="h-5 w-5 ml-2" />
          </button>
        )}
      </div>
      {/* Inline keyframes for custom animations */}
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,400,700,500,600,300&display=swap');
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </nav>
  )
}

