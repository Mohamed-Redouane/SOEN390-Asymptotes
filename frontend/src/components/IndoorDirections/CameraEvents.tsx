import { useEvent, useMap } from "@mappedin/react-sdk"
import { useEffect, useRef } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"

const glassStyle = {
  backgroundColor: "rgba(108, 92, 231, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(108, 92, 231, 0.2)",
  boxShadow: "0 4px 6px rgba(108, 92, 231, 0.05)",
  borderRadius: "8px",
}

export default function CameraEvents() {
  const { mapView, mapData } = useMap()
  const zoomLevelRef = useRef(0)

  useEffect(() => {
    if (!mapView || !mapData) return

    mapData.getByType("space").forEach((space) => {
      mapView.updateState(space, {
        interactive: true,
        hoverColor: "rgba(108, 92, 231, 0.2)",
      })
    })

    zoomLevelRef.current = Math.round(mapView.Camera.zoomLevel)
  }, [mapView, mapData])

  useEvent("camera-change", (event) => {
    zoomLevelRef.current = Math.round(event.zoomLevel)
  })

  useEvent("click", (event) => {
    if (event.spaces.length >= 1) {
      mapView.Camera.focusOn(event.spaces)
    }
  })

  return (
    <div className="fixed bottom-20 left-4 z-50" style={glassStyle}>
      <div className="flex flex-col gap-1 p-0.5 sm:gap-2 sm:p-1">
        <button
          onClick={() => mapView?.Camera.animateTo({ zoomLevel: mapView.Camera.zoomLevel + 1 })}
          className="p-1 sm:p-2 hover:bg-[#6C5CE7]/20 rounded-md sm:rounded-lg transition-colors"
          style={{ color: "#6C5CE7" }}
        >
          <ZoomIn size={16} className="sm:w-5 sm:h-5" />
        </button>
        <div
          className="px-2 py-0.5 sm:px-3 sm:py-1 text-center rounded-md bg-[#6C5CE7]/5 text-xs sm:text-sm"
          style={{ color: "#6C5CE7" }}
        >
          {zoomLevelRef.current}
        </div>
        <button
          onClick={() => mapView?.Camera.animateTo({ zoomLevel: mapView.Camera.zoomLevel - 1 })}
          className="p-1 sm:p-2 hover:bg-[#6C5CE7]/20 rounded-md sm:rounded-lg transition-colors"
          style={{ color: "#6C5CE7" }}
        >
          <ZoomOut size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

