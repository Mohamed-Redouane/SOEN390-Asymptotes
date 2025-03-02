import type React from "react"

import { useMap } from "@mappedin/react-sdk"
import { useEffect, useState } from "react"
import { Layers, ChevronUp, ChevronDown, Loader2 } from "lucide-react"

interface Floor {
  id: string
  name: string
  elevation?: number
}

const glassStyle: React.CSSProperties = {
  backgroundColor: "rgba(108, 92, 231, 0.1)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(108, 92, 231, 0.2)",
  boxShadow: "0 4px 6px rgba(108, 92, 231, 0.05)",
  borderRadius: "8px",
}

export default function FloorSelector() {
  const { mapData, mapView } = useMap()
  const [floors, setFloors] = useState<Floor[]>([])
  const [isChanging, setIsChanging] = useState(false)
  const [currentFloor, setCurrentFloor] = useState<string>()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (mapData) {
      const sortedFloors = mapData
        .getByType("floor")
        .map((floor) => ({
          id: floor.id,
          name: floor.name,
          elevation: floor.elevation,
        }))
        .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))

      setFloors(sortedFloors)
      setCurrentFloor(mapView?.currentFloor?.id)
    }
  }, [mapData, mapView?.currentFloor?.id])

  const handleFloorChange = async (floorId: string) => {
    try {
      setIsChanging(true)
      await mapView?.setFloor(floorId)
      setCurrentFloor(floorId)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to change floor:", error)
    } finally {
      setIsChanging(false)
    }
  }

  const getCurrentFloorName = () => {
    return floors.find((f) => f.id === currentFloor)?.name || "Floor"
  }

  if (!floors.length) return null

  return (
    <div className="fixed top-20 right-4 z-50">
      <div style={glassStyle} className="relative rounded-lg w-[120px]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isChanging}
          className={`
            p-1.5 w-full rounded-lg transition-all duration-300
            flex items-center justify-between gap-1
            ${isOpen ? "bg-[#6C5CE7]/10" : "hover:bg-[#6C5CE7]/5"}
            focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50
            text-[#6C5CE7]
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center gap-1 truncate">
            <Layers className="h-3 w-3 shrink-0" />
            <span className="text-xs font-medium truncate">{getCurrentFloorName()}</span>
          </div>
          {isChanging ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {isOpen && (
          <div
            className="
              absolute top-full mt-1 w-full
              bg-white/90 backdrop-blur-md rounded-lg shadow-lg
              max-h-[40vh] overflow-y-auto
            "
            role="listbox"
            aria-label="Floor selector"
          >
            {floors.map((floor) => (
              <button
                key={floor.id}
                onClick={() => handleFloorChange(floor.id)}
                className={`
                  w-full p-1.5 text-left transition-all duration-200
                  flex items-center justify-between gap-1
                  ${floor.id === currentFloor ? "bg-[#6C5CE7]/10 text-[#6C5CE7]" : "hover:bg-[#6C5CE7]/5 text-gray-600"}
                `}
                role="option"
                aria-selected={floor.id === currentFloor}
              >
                <span className="text-xs truncate">{floor.name}</span>
                {floor.id === currentFloor && <div className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7] shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

