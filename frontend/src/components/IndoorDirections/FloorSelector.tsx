import type React from "react"

import { useMap } from "@mappedin/react-sdk"
import { useEffect, useState, useRef } from "react"
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
  const selectRef = useRef<HTMLDivElement>(null)

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

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleFloorChange = (floorId: string) => {
    try {
      setIsChanging(true)
      // Fixed: Removed redundant 'await'
      mapView?.setFloor(floorId)
      setCurrentFloor(floorId)
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to change floor:", error)
    } finally {
      setIsChanging(false)
    }
  }

  const getCurrentFloorName = () => {
    // Fixed: Using nullish coalescing operator (??) instead of logical or (||)
    return floors.find((f) => f.id === currentFloor)?.name ?? "Floor"
  }

  if (!floors.length) return null

  // Fixed: Extracted nested ternary operation into a separate function
  const renderButtonIcon = () => {
    if (isChanging) return <Loader2 className="h-3 w-3 animate-spin" />
    if (isOpen) return <ChevronUp className="h-3 w-3" />
    return <ChevronDown className="h-3 w-3" />
  }

  return (
    <div className="fixed top-20 right-4 z-50" ref={selectRef}>
      <div style={glassStyle} className="relative rounded-lg w-[120px]">
        {/* Main button that toggles the dropdown */}
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
          aria-controls="floor-select-list"
        >
          <div className="flex items-center gap-1 truncate">
            <Layers className="h-3 w-3 shrink-0" />
            <span className="text-xs font-medium truncate">{getCurrentFloorName()}</span>
          </div>
          {renderButtonIcon()}
        </button>

        {/* Accessible custom floor selector dropdown */}
        {isOpen && (
          <div
            id="floor-select-list"
            className="
              absolute top-full mt-1 w-full
              bg-white/90 backdrop-blur-md rounded-lg shadow-lg
              max-h-[40vh] overflow-y-auto
            "
            role="listbox"
            aria-label="Floor selector"
            tabIndex={0}
            onKeyDown={(e) => {
              // Handle keyboard navigation
              const currentIndex = floors.findIndex(f => f.id === currentFloor);
              if (e.key === 'ArrowDown' && currentIndex < floors.length - 1) {
                handleFloorChange(floors[currentIndex + 1].id);
              } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                handleFloorChange(floors[currentIndex - 1].id);
              } else if (e.key === 'Enter' || e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            style={glassStyle}
          >
            {floors.map((floor) => (
              <div
                key={floor.id}
                onClick={() => handleFloorChange(floor.id)}
                className={`
                  w-full p-1.5 text-left transition-all duration-200
                  flex items-center justify-between gap-1 cursor-pointer
                  ${floor.id === currentFloor ? "bg-[#6C5CE7]/10 text-[#6C5CE7]" : "hover:bg-[#6C5CE7]/5 text-gray-600"}
                `}
                role="option"
                aria-selected={floor.id === currentFloor}
                tabIndex={0}
              >
                <span className="text-xs truncate">{floor.name}</span>
                {floor.id === currentFloor && <div className="h-1.5 w-1.5 rounded-full bg-[#6C5CE7] shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}