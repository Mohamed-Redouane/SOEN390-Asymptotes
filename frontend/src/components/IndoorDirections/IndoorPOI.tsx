import type React from "react"

import { useEffect, useState } from "react"
import { useMap } from "@mappedin/react-sdk"

const glassStyle: React.CSSProperties = {
  backgroundColor: "rgba(108, 92, 231, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(108, 92, 231, 0.2)",
  boxShadow: "0 4px 6px rgba(108, 92, 231, 0.05)",
  borderRadius: "12px",
}

export default function IndoorPOI() {
  const { mapView, mapData } = useMap()
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    if (!mapView || !mapData) return;
  
    if (showLabels) {
      for (const space of mapData.getByType("space")) {
        mapView.Labels.add(space.center, space.name, {
          appearance: {
            text: { foregroundColor: "#6C5CE7" },
            marker: { foregroundColor: { active: "#6C5CE7", inactive: "#A29BFE" } }, // Fixed
          },
        });
      }
  
      for (const poi of mapData.getByType("point-of-interest")) {
        mapView.Labels.add(poi.coordinate, poi.name, {
          appearance: {
            text: { foregroundColor: "#74A0F4" },
            marker: { foregroundColor: { active: "#74A0F4", inactive: "#B2DFFC" } }, // Fixed
          },
        });
      }
    } else {
      mapView.Labels.removeAll();
    }
  }, [mapView, mapData, showLabels]);
  
  return (
    <div className="fixed bottom-20 right-4 z-50" style={glassStyle}>
      <button
        onClick={() => setShowLabels(!showLabels)}
        className={`
          flex items-center justify-center w-full px-3 py-2
          text-xs sm:text-sm font-medium
          ${showLabels ? "text-[#6C5CE7]" : "text-gray-500"}
          hover:bg-[#6C5CE7]/10 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 mr-2"
        >
          {showLabels ? (
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          ) : (
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          )}
          {showLabels && <line x1="1" y1="1" x2="23" y2="23" />}
        </svg>
        {showLabels ? "Hide Labels" : "Show Labels"}
      </button>
    </div>
  )
}

