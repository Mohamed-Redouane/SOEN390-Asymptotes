import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Accessibility, ShipWheelIcon as Wheelchair } from "lucide-react"

interface AccessibleToggleProps {
  setAccessible: (isAccessible: boolean) => void
}

const glassStyle: React.CSSProperties = {
  backgroundColor: "rgba(108, 92, 231, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(108, 92, 231, 0.2)",
  boxShadow: "0 4px 6px rgba(108, 92, 231, 0.05)",
  borderRadius: "8px",
}

export default function AccessibleToggle({ setAccessible }: AccessibleToggleProps) {
  const [isAccessible, setIsAccessible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>()

  const handleToggle = () => {
    setIsAccessible((prev) => {
      const newValue = !prev
      setAccessible(newValue)
      return newValue
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleToggle()
    }
  }

  const handleMouseEnter = () => {
    clearTimeout(tooltipTimeoutRef.current)
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 200)
  }

  useEffect(() => () => clearTimeout(tooltipTimeoutRef.current), [])

  return (
    <div className="fixed right-4 bottom-1/4 -translate-y-1/2 z-50" role="region" aria-label="Accessibility Options">
      <div className="p-1 transition-transform duration-200 hover:scale-105" style={glassStyle}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleMouseEnter}
          onBlur={handleMouseLeave}
          className={`
            relative p-2 rounded-lg transition-all duration-300
            flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50
            ${isAccessible ? "bg-[#6C5CE7]/20 hover:bg-[#6C5CE7]/30" : "hover:bg-[#6C5CE7]/10"}
          `}
          aria-label={isAccessible ? "Disable accessible routes" : "Enable accessible routes"}
          aria-pressed={isAccessible}
          role="switch"
        >
          {isAccessible ? (
            <Wheelchair
              size={20}
              className={`text-[#6C5CE7] transition-transform duration-300 ${isAccessible ? "scale-110" : "scale-100"}`}
            />
          ) : (
            <Accessibility
              size={20}
              className={`text-gray-600 transition-transform duration-300 ${isAccessible ? "scale-110" : "scale-100"}`}
            />
          )}

          {/* Animated Ring */}
          <div
            className={`absolute inset-0 rounded-lg border transition-all duration-500 ${
              isAccessible ? "border-[#6C5CE7]/50 scale-105" : "border-transparent scale-100"
            }`}
          />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            role="tooltip"
            className="
              absolute right-full top-1/2 -translate-y-1/2 mr-2
              px-2 py-1 rounded-md bg-[#6C5CE7] text-white text-xs
              whitespace-nowrap
            "
          >
            {isAccessible ? "Accessible routes on" : "Enable accessible routes"}
            {/* Tooltip Arrow */}
            <div
              className="
              absolute top-1/2 right-0 -translate-y-1/2 translate-x-1
              border-4 border-transparent border-l-[#6C5CE7]
            "
            />
          </div>
        )}
      </div>
    </div>
  )
}

