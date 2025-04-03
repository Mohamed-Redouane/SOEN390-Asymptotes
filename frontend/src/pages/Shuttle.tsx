"use client"

import { useState, useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { ScrollArea } from "../components/ui/scroll-area"
import { AlertCircle, Calendar, Clock, MapPin, RefreshCw } from "lucide-react"
import { initializeLeaflet } from "../utils/leaflet-utils"
import { formatTime, timeToMinutes } from "../utils/time-utils"
import { MapComponent } from "../components/Shuttle/MapComponent"
import { ScheduleItem } from "../components/Shuttle/ScheduleItem"
import { NextDeparture } from "../components/Shuttle/NextDeparture"
import { RouteDialog } from "../components/Shuttle/RouteDialog"
import { scheduleMonThu, scheduleFri } from "../components/schedule-data"
import { fetchShuttleData } from "../services/shuttle-service"
import type { BusLocation, DayType, TabType } from "../components/types"

//error state component
const MapErrorState = ({ isDesktop, error, onRetry}: {isDesktop: boolean; error: string; onRetry: () => void;}) => (
  <div className={`flex flex-col items-center justify-center ${isDesktop ? 'h-[500px]' : 'h-[400px]'} bg-gray-50`}>
  <AlertCircle className="h-10 w-10 text-orange-500 mb-2" />
  <p className="text-gray-700 font-medium">{error}</p>
  <Button
    variant="outline"
    size="sm"
    onClick={onRetry}
    className="mt-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
  >
    Try Again
  </Button>
</div>
)

//loading state component 
const MapLoadingState = ({ isDesktop }: { isDesktop: boolean }) => (
  <div className={`flex items-center justify-center ${isDesktop ? 'h-[500px]' : 'h-[400px]'} bg-gray-50`}>
    <div className="flex flex-col items-center">
      <RefreshCw className="h-10 w-10 animate-spin mb-2 text-teal-500" />
      <p className="text-gray-600">Loading shuttle locations...</p>
    </div>
  </div>
)

//empty state component 
const MapEmptyState = ({ isDesktop, onRefresh }: { isDesktop: boolean; onRefresh: () => void }) => (
<div className={`flex flex-col items-center justify-center ${isDesktop ? 'h-[500px]' : 'h-[400px]'} bg-gray-50`}>
  <p className="text-gray-600">No shuttle data available</p>
  <Button
    variant="outline"
    size="sm"
    onClick={onRefresh}
    className="mt-4 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
  >
    Refresh
  </Button>
</div>
)

const ConcordiaShuttle = () => {
  const [selectedDay, setSelectedDay] = useState<DayType>("mon-thu")
  const [busLocations, setBusLocations] = useState<BusLocation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [currentMinutes, setCurrentMinutes] = useState<number>(0)
  const [currentDay, setCurrentDay] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<TabType>("map")
  const [routeDialogOpen, setRouteDialogOpen] = useState(false)
  const centerMapRef = useRef<(location: { lat: number; lng: number }) => void>(() => {})

  const activeSchedule = selectedDay === "mon-thu" ? scheduleMonThu : scheduleFri

  // Update time and day
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes())
      setCurrentDay(now.getDay())
    }

    updateTime()

    // Set default tab based on day of week
    const today = new Date().getDay()
    if (today === 5) {
      setSelectedDay("fri")
    } else if (today >= 1 && today <= 4) {
      setSelectedDay("mon-thu")
    }

    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch shuttle data with proper error handling
  const handleFetchShuttleData = async () => {
    setLoading(true)
    try {
      const result = await fetchShuttleData()
      setBusLocations(result.busLocations)
      setError(result.error)
      setLastUpdated(result.lastUpdated)
    } finally {
      setLoading(false)
    }
  }

  // Initialize Leaflet when component mounts
  useEffect(() => {
    initializeLeaflet()
    setHasMounted(true)
  }, [])

  // Fetch data when component mounts
  useEffect(() => {
    if (!hasMounted) {
      return
    }

    handleFetchShuttleData()
    const intervalId = setInterval(handleFetchShuttleData, 15000)
    return () => clearInterval(intervalId)
  }, [hasMounted])

  // Separate campus markers from shuttle buses
  const campusPoints = busLocations.filter((pt) => pt.ID === "GPLoyola" || pt.ID === "GPSirGeorge")
  const shuttleBuses = busLocations.filter((pt) => pt.ID.startsWith("BUS"))

  // Find the next departure
  const nextDepartureIndex = activeSchedule.findIndex((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })

  // Center map on a specific location
  const centerMap = (location: { lat: number; lng: number }) => {
    if (centerMapRef.current) {
      centerMapRef.current(location)
    }
  }

  // Check if it's a weekend
  const isWeekend = currentDay === 0 || currentDay === 6
  const noServiceToday = isWeekend

  // Handle view route button click
  const handleViewRoute = () => {
    setRouteDialogOpen(true)
  }

  const mapBadgesStyle = (location: string) => {
    if(location === 'Loyola') {
      return 'text-teal-700 hover:bg-teal-50 border-teal-200'
    }
    else if(location === 'SGW') {
      return 'text-orange-700 hover:bg-orange-50 border-orange-200'
    }
    else {
      return 'text-green-700 hover:bg-green-50 border-green-200'
    }
  }

  const onMapLocationsStyle = (location: string) => {
    if(location === 'Loyola') {
      return 'bg-teal-500'
    }
    else if(location === 'SGW') {
      return 'bg-orange-500'
    }
    else {
      return 'bg-green-500'
    }

  }


  // refactored Reusable Map Card Component
  const renderMapCard = (isDesktop: boolean) => {
    const getMapContent = () => {
      if (error) {
        return <MapErrorState 
          isDesktop={isDesktop} 
          error={error} 
          onRetry={handleFetchShuttleData} 
        />
      }
      
      if (loading && busLocations.length === 0) {
        return <MapLoadingState isDesktop={isDesktop} />
      }
      
      if (busLocations.length === 0) {
        return <MapEmptyState 
          isDesktop={isDesktop} 
          onRefresh={handleFetchShuttleData} 
        />
      }
  
      const handleCenterMap = (loc: { lat: number; lng: number }) => {
        if (loc) {
          centerMap(loc);
        }
      }
  
      const setupCenterMapRef = () => {
        centerMapRef.current = handleCenterMap;
      }
  
      return (
        <MapComponent
          busLocations={shuttleBuses}
          campusPoints={campusPoints}
          onCenterMap={setupCenterMapRef}
        />
      )
    }
  
    return (
      <Card className={`${isDesktop ? 'lg:col-span-2' : ''} overflow-hidden bg-white border border-gray-200`}>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <MapPin className="h-5 w-5 text-teal-600" />
            Live Map
          </CardTitle>
          <div className="flex items-center gap-2">
            {['Loyola', 'SGW', 'Shuttles'].map((location) => (
              <Badge 
                key={location} 
                variant="outline" 
                className={`bg-white ${
                  mapBadgesStyle(location)
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  onMapLocationsStyle(location)
                } mr-1 animate-pulse`}></div>
                {location}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {getMapContent()}
        </CardContent>
      </Card>
    )
  }

  // Reusable Schedule Table
  const renderScheduleTable = (scheduleData: any[]) => (
    <>
      <div className="flex justify-between mb-2 px-3 text-sm font-medium">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#26a69a]" />
          <span className="text-gray-700">Loyola</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#fb8c00]" />
          <span className="text-gray-700">Sir George Williams</span>
        </div>
      </div>
      <Separator className="mb-2 bg-gray-200" />
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {scheduleData.map((item, index) => {
            const loyMinutes = timeToMinutes(item.loy)
            const sgwMinutes = timeToMinutes(item.sgw)
            const isUpcoming = loyMinutes >= currentMinutes || sgwMinutes >= currentMinutes
            const isNext = index === nextDepartureIndex
            return (
              <ScheduleItem
                key={`${item.loy}-${item.sgw}`} // Stable key from time values
                loy={item.loy}
                sgw={item.sgw}
                isUpcoming={isUpcoming}
                isNext={isNext}
                currentMinutes={currentMinutes}
              />
            )
          })}
        </div>
      </ScrollArea>
    </>
  )

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container mx-auto py-4 px-4 max-w-6xl mb-20 pt-16">
        <div className="flex flex-col gap-6">
          {/* Header Section (Shared between mobile and desktop) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800">Concordia Shuttle Service</h1>
              <div className="flex items-center justify-between">
                <p className="text-gray-500 mt-1">Real-time tracking and schedule information</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchShuttleData}
                disabled={loading}
                className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {lastUpdated && <span className="text-xs text-gray-500">Updated: {formatTime(lastUpdated)}</span>}
            </div>
          </div>

          {/* Service Alert for Weekends */}
          {noServiceToday && (
            <Card className="bg-white border border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 text-orange-500" />
                  <div>
                    <h3 className="font-medium text-gray-800">No Service Today</h3>
                    <p className="text-sm mt-1 text-gray-600">
                      The shuttle service doesn't operate on weekends. Regular service will resume on Monday.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile Layout */}
          <div className="md:hidden mb-24">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 z-10 bg-white border-b border-gray-200">
                <TabsTrigger
                  value= "map"
                  className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                >
                  <MapPin className="h-4 w-4" />
                  Live Map
                </TabsTrigger>
                <TabsTrigger
                  value= "schedule"
                  className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                >
                  <Clock className="h-4 w-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-0">
                {renderMapCard(false)}
                {!noServiceToday && (
                  <div className="mt-4">
                    <NextDeparture
                      schedule={activeSchedule}
                      currentMinutes={currentMinutes}
                      onViewRoute={handleViewRoute}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-0">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Clock className="h-5 w-5 text-teal-600" />
                      Full Schedule
                    </CardTitle>
                    <CardDescription className="text-gray-500">Mon–Thu and Friday departure times</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedDay} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-50">
                        <TabsTrigger
                          value="mon-thu"
                          onClick={() => setSelectedDay("mon-thu")}
                          className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                        >
                          Mon–Thu
                        </TabsTrigger>
                        <TabsTrigger
                          value="fri"
                          onClick={() => setSelectedDay("fri")}
                          className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                        >
                          Friday
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="mon-thu" className="mt-0">
                        {renderScheduleTable(scheduleMonThu)}
                      </TabsContent>

                      <TabsContent value="fri" className="mt-0">
                        {renderScheduleTable(scheduleFri)}
                      </TabsContent>
                    </Tabs>

                    <div className="mt-4 text-xs text-gray-500">
                      <p>* Last departure of the day</p>
                      <p>Highlighted times indicate upcoming departures</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {renderMapCard(true)}

            <div className="space-y-6">
              {!noServiceToday && (
                <NextDeparture
                  schedule={activeSchedule}
                  currentMinutes={currentMinutes}
                  onViewRoute={handleViewRoute}
                />
              )}

              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Clock className="h-5 w-5 text-teal-600" />
                    Full Schedule
                  </CardTitle>
                  <CardDescription className="text-gray-500">Mon–Thu and Friday departure times</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedDay} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-50">
                      <TabsTrigger
                        value="mon-thu"
                        onClick={() => setSelectedDay("mon-thu")}
                        className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                      >
                        Mon–Thu
                      </TabsTrigger>
                      <TabsTrigger
                        value="fri"
                        onClick={() => setSelectedDay("fri")}
                        className="flex items-center gap-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                      >
                        Friday
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mon-thu" className="mt-0">
                      {renderScheduleTable(scheduleMonThu)}
                    </TabsContent>

                    <TabsContent value="fri" className="mt-0">
                      {renderScheduleTable(scheduleFri)}
                    </TabsContent>
                  </Tabs>

                  <div className="mt-4 text-xs text-gray-500">
                    <p>* Last departure of the day</p>
                    <p>Highlighted times indicate upcoming departures</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Route Dialog */}
      <RouteDialog isOpen={routeDialogOpen} onClose={() => setRouteDialogOpen(false)} campusPoints={campusPoints} />
    </div>
  )
}

export default ConcordiaShuttle