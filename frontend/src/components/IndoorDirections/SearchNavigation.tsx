import type React from "react"
import { useState, useRef, useEffect, useCallback } from 'react'
import { useMap } from "@mappedin/react-sdk"
import { Search, Navigation2, Loader2, X, CornerDownLeft, History, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation } from 'react-router-dom';

interface Location {
  name: string
  description?: string
  id?: string
  floorId?: string
  coordinates?: { x: number; y: number }
}

interface RouteInfo {
  distance: number
  duration: number
  floors: string[]
}

const glassStyle = {
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",
}

interface SearchNavigationProps {
  accessible: boolean;
}

const RECENT_SEARCHES_KEY = "recentSearches"
const MAX_RECENT_SEARCHES = 5

// TODO: Maybe move this to a utility file, so we add unit tests for it
// This function will take the event name and return just the room number
// Example: "SOEN 343 - WW [C080]" will return "C080"
const getRoomNumber = (eventName: string) => {
  const roomNumberMatch = typeof eventName === 'string' ? eventName.match(/\[([^\]]+)\]/) : null;
  const roomNumber = roomNumberMatch ? roomNumberMatch[1] : eventName;
  return roomNumber;
}


export default function SearchNavigation({ accessible = false }: SearchNavigationProps) {
  const { mapView, mapData } = useMap()
  const [startPoint, setStartPoint] = useState("")
  const [endPoint, setEndPoint] = useState("")
  const [shouldAutoNavigate, setShouldAutoNavigate] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [isStart, setIsStart] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [recentSearches, setRecentSearches] = useState<{ start: string; end: string }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const markersRef = useRef<any[]>([])
  
  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Get destination from URL
  const { search } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(search);
    const destinationName = params.get('dest');
    console.log("Destination from URL:", destinationName);
    // Set endpoint to destination from URL
    if (destinationName) {
      const localDest = getRoomNumber(destinationName)
      setEndPoint(localDest)
      // Also set the start point depending on the page (if it includes H at the beginning, set it to Hall)
      // If it starts with J, set it to JMSB
      // If it starts with L, set to Loyola
      if (localDest.startsWith("H")) {
        setStartPoint("Entrance Hall")
      } else if (localDest.startsWith("J")) {
        setStartPoint("Entrance JMSB")
      }
      // TODO: Check this after since we will have to change to loyola map if this is the case
      else if (localDest.startsWith("L")) {
        setStartPoint("L170")
      }
      else if (localDest.startsWith("VE")) {
        setStartPoint("VE1")
      }

      setShouldAutoNavigate(true);
  
    }

   

  }, [search]); // Only runs when search changes

  // Automatically trigger navigation when startPoint and endPoint are set
  useEffect(() => {
    if (shouldAutoNavigate && startPoint && endPoint) {
      handleNavigation();
      setShouldAutoNavigate(false); // Reset the flag to prevent repeated navigation
    }
  }, [shouldAutoNavigate, startPoint, endPoint]);

  // Save recent searches
  const saveRecentSearch = (start: string, end: string) => {
    const newSearch = { start, end }
    const updated = [newSearch, ...recentSearches.filter((s) => s.start !== start || s.end !== end)].slice(
      0,
      MAX_RECENT_SEARCHES,
    )

    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  const getSpaceDetails = (name: string) => {
    return mapData?.getByType("space").find(s => s.name.toLowerCase() === name.toLowerCase())
  }

  const showLocationOnMap = (locationName: string, isStart: boolean) => {
    if (!mapView) return
    
    // Clear previous markers of the same type
    markersRef.current = markersRef.current.filter(marker => {
      if (marker.type === (isStart ? "start" : "end")) {
        mapView.Markers.remove(marker)
        return false
      }
      return true
    })

    const space = getSpaceDetails(locationName)
    if (!space) return

    // Add new marker
    const marker = mapView.Markers.add(space.center, 
      `<div class="location-marker ${isStart ? "start" : "end"}-marker">${space.name}</div>`
    ) as any
    marker.type = isStart ? "start" : "end"
    
    markersRef.current.push(marker)

    // Switch floors if needed
    if (space.floor.id !== mapView.currentFloor?.id) {
      mapView.setFloor(space.floor.id)
    }

    // Focus camera on the location
    mapView.Camera.focusOn(space.center, { duration: 1000 })
  }

  const getSuggestions = useCallback(
    (input: string) => {
      if (!mapData || !input || input.length < 2) return []

      const searchStr = input.toLowerCase()
      return mapData
        .getByType("space")
        .filter((s) => {
          const nameMatch = s.name.toLowerCase().includes(searchStr)
          const descMatch = s.description?.toLowerCase().includes(searchStr)
          return nameMatch || descMatch
        })
        .sort((a, b) => {
          const aName = a.name.toLowerCase()
          const bName = b.name.toLowerCase()
          if (aName === searchStr) return -1
          if (bName === searchStr) return 1
          if (aName.startsWith(searchStr)) return -1
          if (bName.startsWith(searchStr)) return 1
          return 0
        })
        .slice(0, 5)
        .map((s) => ({
          name: s.name,
          description: s.description || "",
          id: s.id,
          floorId: s.floor.id,
          coordinates: s.center
            ? { x: s.center.latitude, y: s.center.longitude } 
            : undefined
        }))
        
    },
    [mapData],
  )

  const handleInputChange = (value: string, isStartInput: boolean) => {
    setError("")
    setRouteInfo(null)
    if (isStartInput) {
      setStartPoint(value)
      setIsStart(true)
      setActiveInput("start")
    } else {
      setEndPoint(value)
      setIsStart(false)
      setActiveInput("end")
    }
    setSuggestions(getSuggestions(value))
    setSelectedIndex(-1)
  }

  const handleSelectSuggestion = (suggestion: Location) => {
    if (isStart) {
      setStartPoint(suggestion.name)
      showLocationOnMap(suggestion.name, true)
    } else {
      setEndPoint(suggestion.name)
      showLocationOnMap(suggestion.name, false)
    }
    setSuggestions([])
    setActiveInput(null)
    setSelectedIndex(-1)
  }

  const clearInput = (isStartInput: boolean) => {
    if (isStartInput) {
      setStartPoint("")
      markersRef.current = markersRef.current.filter(marker => {
        if (marker.type === "start") {
          mapView?.Markers.remove(marker)
          return false
        }
        return true
      })
    } else {
      setEndPoint("")
      markersRef.current = markersRef.current.filter(marker => {
        if (marker.type === "end") {
          mapView?.Markers.remove(marker)
          return false
        }
        return true
      })
    }
    setSuggestions([])
    setRouteInfo(null)
  }

  const calculateRouteInfo = (directions: any) => {
    const distance = Math.round(directions.distance)
    const duration = Math.round(directions.distance / 1.4)
const floors = [...new Set(directions.path.map((p: any) => p.floor.name))] as string[]

    return {
      distance,
      duration,
      floors,
    }
  }

  const handleNavigation = async () => {
    if (!mapView || !mapData) {
      setError("Map data not available")
      return
    }

    if (!startPoint || !endPoint) {
      setError("Please select both start and end locations")
      return
    }

    setIsLoading(true)
    setError("")
    setRouteInfo(null)

    try {
      const startLocation = mapData.getByType("space").find((s) => s.name.toLowerCase() === startPoint.toLowerCase())
      const endLocation = mapData.getByType("space").find((s) => s.name.toLowerCase() === endPoint.toLowerCase())

      if (!startLocation || !endLocation) {
        throw new Error("Invalid locations selected")
      }

      mapView.Navigation.clear()

      const directions = await mapView.getDirections(startLocation, endLocation, {
        accessible,
       
      })

      if (!directions) {
        throw new Error("No route available between these locations")
      }

      mapView.Navigation.draw(directions, {
        pathOptions: {
          nearRadius: 1,                           
          farRadius: 1,                            
          color: accessible ? "rgba(34,197,94,0.9)" : "rgba(59,130,246,0.9)",
          accentColor: accessible ? "#22c55e" : "#3b82f6", 
          displayArrowsOnPath: true, 
          animateArrowsOnPath: true, 
        },
        
      })

      mapView.Camera.focusOn(directions.coordinates)

      const info = calculateRouteInfo(directions)
      setRouteInfo(info)
      saveRecentSearch(startPoint, endPoint)

      setSuggestions([])
      setActiveInput(null)
    } catch (error: any) {
      setError(error.message || "Failed to generate directions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else if (suggestions.length > 0) {
          handleSelectSuggestion(suggestions[0])
        }
        break
      case "Escape":
        e.preventDefault()
        setSuggestions([])
        setSelectedIndex(-1)
        setActiveInput(null)
        break
    }
  }

  const handleClear = () => {
    if (mapView) {
      mapView.Navigation.clear()
      setStartPoint("")
      setEndPoint("")
      setError("")
      setSuggestions([])
      setActiveInput(null)
      setRouteInfo(null)
    }
  }


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setSuggestions([])
        setActiveInput(null)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed top-15 left-4 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all z-50 ${
          isVisible ? "rotate-0" : "rotate-180"
        }`}
        aria-label={isVisible ? "Hide navigation" : "Show navigation"}
      >
        <ChevronDown className="h-5 w-5 text-white" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={containerRef}
            className="w-full max-w-md mx-4 sm:mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="p-2" style={glassStyle}>
              <div className="space-y-3">
                {/* Inputs Container */}
                <div className="space-y-2">
                  {/* Start Location Input */}
                  <div className="relative">
                    <div className="flex items-center bg-transparent rounded-md">
                      <Search className="h-5 w-5 text-gray-400 ml-3" />
                      <input
                        type="text"
                        placeholder="Start Location"
                        value={startPoint}
                        onChange={(e) => handleInputChange(e.target.value, true)}
                        onFocus={() => setActiveInput("start")}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 text-sm sm:text-base bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                        aria-label="Start location"
                        role="combobox"
                        aria-expanded={activeInput === "start" && suggestions.length > 0}
                      />
                      {startPoint && (
                        <button
                          onClick={() => clearInput(true)}
                          className="p-2 hover:bg-gray-100/50 rounded-full"
                          aria-label="Clear start location"
                        >
                          <X className="h-5 w-5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Destination Input */}
                  <div className="relative">
                    <div className="flex items-center bg-transparent rounded-md">
                      <Navigation2 className="h-5 w-5 text-gray-400 ml-3" />
                      <input
                        type="text"
                        placeholder="Destination"
                        value={endPoint}
                        onChange={(e) => handleInputChange(e.target.value, false)}
                        onFocus={() => setActiveInput("end")}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 text-sm sm:text-base bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                        aria-label="Destination"
                        role="combobox"
                        aria-expanded={activeInput === "end" && suggestions.length > 0}
                      /> 
                      {endPoint && (
                        <button
                          onClick={() => clearInput(false)}
                          className="p-2 hover:bg-gray-100/50 rounded-full"
                          aria-label="Clear destination"
                        >
                          <X className="h-5 w-5 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

   

                {/* Route Info */}
                <AnimatePresence>
                  {routeInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-transparent rounded-md p-3 text-sm"
                    >
                      <div className="font-medium text-blue-700">Route Summary</div>
                      <div className="text-blue-600">
                        Distance: {routeInfo.distance}m<span className="mx-2">•</span>~{routeInfo.duration} seconds
                      </div>
                      <div className="text-blue-600">Floors: {routeInfo.floors.join(" → ")}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {suggestions.length > 0 && activeInput && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-1 bg-transparent backdrop-blur-sm border border-gray-200 rounded-md shadow-lg max-h-[50vh] overflow-y-auto"
                      role="listbox"
                    >
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={`
                            p-3 cursor-pointer transition-colors
                            ${selectedIndex === index ? "bg-blue-50" : "hover:bg-gray-100/50"}
                          `}
                          role="option"
                        >
                          <div className="font-medium text-sm sm:text-base">{suggestion.name}</div>
                          {suggestion.description && (
                            <div className="text-sm text-gray-500">{suggestion.description}</div>
                          )}
                        </motion.div>
                      ))}
                      <div className="p-2 text-xs text-gray-500 border-t">
                        <CornerDownLeft className="h-3 w-3 inline mr-1" />
                        Use arrow keys and Enter to select
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recent Searches */}
                {activeInput && !suggestions.length && recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute z-50 w-full mt-1 bg-transparent backdrop-blur-sm border border-gray-200 rounded-md shadow-lg max-h-[50vh] overflow-y-auto"
                  >
                    <div className="p-2 text-xs font-medium text-gray-500 border-b">
                      <History className="h-3 w-3 inline mr-1" />
                      Recent Searches
                    </div>
                    {recentSearches.map((search, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setStartPoint(search.start)
                          setEndPoint(search.end)
                          setActiveInput(null)
                        }}
                        className="p-3 cursor-pointer hover:bg-gray-100/50 transition-colors"
                      >
                        <div className="text-sm sm:text-base">
                          <span className="font-medium">{search.start}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{search.end}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Error Message (Will show only if there is an error) */}
                  {error && (
                    <div className="text-red-500 text-sm mt-2">
                      {error}
                    </div>
                  )}
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleNavigation}
                    disabled={isLoading || !startPoint || !endPoint}
                    className={`
                      flex-1 py-3 px-4 rounded-md transition-all
                      flex items-center justify-center gap-2
                      ${
                        isLoading || !startPoint || !endPoint
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 active:scale-95"
                      }
                      text-white text-sm sm:text-base
                    `}
                    aria-label="Calculate route"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Navigation2 className="h-5 w-5" />
                        Navigate
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={isLoading}
                    className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-100/50 transition-all text-sm sm:text-base active:scale-95 disabled:opacity-50"
                    aria-label="Clear route"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>
      {`
        .location-marker {
          padding: 6px 12px;
          border-radius: 24px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        
        .start-marker {
          background: rgba(76, 175, 80, 0.9);
          color: white;
          border: 2px solid #4CAF50;
        }
        
        .end-marker {
          background: rgba(244, 67, 54, 0.9);
          color: white;
          border: 2px solid #F44336;
        }
        
        /* CSS for path visualization */
        .mappedIn-path {
          transition: all 0.3s ease;
        }
        
        .mappedIn-path:hover {
          stroke-width: 6px;
          filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.3));
        }
        
        /* Styles for path animations */
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .mappedIn-path-animated {
          animation: dash 1.5s linear forwards;
        }
        
        /* Pulse effect for markers */
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .mappedIn-marker {
          animation: pulse 2s infinite;
        }
      `}
      </style>
    </>
  )

  
}

