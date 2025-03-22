import { MapPin } from "lucide-react"
import { useMemo } from "react"

interface LogoProps {
  size?: "small" | "medium" | "large"
  showTagline?: boolean
  animated?: boolean
}

export default function Logo({ size = "medium", showTagline = true, animated = true }: LogoProps) {

    const sizeMap = {
    small: {
      container: "flex items-center space-x-2",
      icon: "w-5 h-5",
      title: "text-lg",
      tagline: "text-[0.5rem]",
    },
    medium: {
      container: "flex items-center space-x-3",
      icon: "w-8 h-8",
      title: "text-2xl",
      tagline: "text-[0.65rem]",
    },
    large: {
      container: "flex items-center space-x-4",
      icon: "w-12 h-12",
      title: "text-4xl",
      tagline: "text-xs",
    },
  }

  // Memoize the animated pin so it's created only once
  const logoPin = useMemo(
    () => (
      <div
        style={{
          position: "relative",
          animation: animated ? "bounce 2s infinite" : "none",
        }}
      >
        <MapPin className={`${sizeMap[size].icon} text-white`} />
        {animated && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(59,130,246,0.6)",
              borderRadius: "50%",
              filter: "blur(4px)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}
      </div>
    ),
    [size, animated],
  )

  return (
    <div className={sizeMap[size].container}>
      {logoPin}
      <div className="flex flex-col">
        <span
          className={`${sizeMap[size].title} font-black`}
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
        {showTagline && (
          <span
            className={`${sizeMap[size].tagline} tracking-wider text-white/80 font-medium -mt-1 ml-0.5`}
            style={{
              fontFamily: "'Clash Display', sans-serif",
            }}
          >
            DISCOVER • CONNECT
          </span>
        )}
      </div>


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
      `}</style>
    </div>
  )
}

