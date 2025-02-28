import { Building, ChevronDown } from "lucide-react"
import { useState } from "react"

const BUILDINGS = {
  "Hall Building": "67b0241a845fda000bf299cb",
  "EV Building": "67b023355b54d7000b151b86",
}

const glassStyle = {
  backgroundColor: "rgba(108, 92, 231, 0.2)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(108, 92, 231, 0.3)",
  boxShadow: "0 4px 8px rgba(108, 92, 231, 0.1)",
  borderRadius: "8px",
}

interface BuildingSelectorProps {
  selectedBuilding: string
  onBuildingSelect: (building: string) => void
}

export default function BuildingSelector({ selectedBuilding, onBuildingSelect }: BuildingSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 flex items-center justify-center rounded-lg transition-colors"
            style={glassStyle}
          >
            <Building className="h-8 w-8" style={{ color: "#6C5CE7" }} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 bg-black/20 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 overflow-hidden" style={glassStyle}>
                {Object.keys(BUILDINGS).map((building) => (
                  <button
                    key={building}
                    onClick={() => {
                      onBuildingSelect(building)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full px-4 py-3 text-left text-sm font-medium
                      transition-colors hover:bg-[#6C5CE7]/20
                      ${selectedBuilding === building ? "bg-[#6C5CE7]/20 font-semibold" : ""}
                    `}
                    style={{ color: "#6C5CE7" }}
                  >
                    {building}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative" style={glassStyle}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ color: "#6C5CE7" }}
          >
            <Building className="h-5 w-5" />
            <span className="text-sm font-medium">{selectedBuilding}</span>
            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 overflow-hidden" style={glassStyle}>
              {Object.keys(BUILDINGS).map((building) => (
                <button
                  key={building}
                  onClick={() => {
                    onBuildingSelect(building)
                    setIsOpen(false)
                  }}
                  className={`
                    w-full px-4 py-3 text-left text-sm
                    transition-colors hover:bg-[#6C5CE7]/20
                    ${selectedBuilding === building ? "bg-[#6C5CE7]/20 font-semibold" : ""}
                  `}
                  style={{ color: "#6C5CE7" }}
                >
                  {building}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}