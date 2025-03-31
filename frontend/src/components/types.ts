// Types for the shuttle 

export interface BusLocation {
    ID: string
    Latitude: number
    Longitude: number
    Title?: string
  }
  
  export interface ScheduleItem {
    loy: string
    sgw: string
  }
  
  export type DayType = "mon-thu" | "fri"
  
  export type TabType = "map" | "schedule"
  
  export interface MapControlsProps {
    onZoomIn: () => void
    onZoomOut: () => void
    onMyLocation: () => void
    onMapTypeChange: (type: string) => void
  }
  
  export interface MapComponentProps {
    busLocations: BusLocation[]
    campusPoints: BusLocation[]
    onCenterMap: (location: { lat: number; lng: number }) => void
  }
  
  export interface MapControllerProps {
    center?: [number, number]
    zoom?: number
  }
  
  export interface ScheduleItemProps {
    loy: string
    sgw: string
    isUpcoming: boolean
    isNext: boolean
    currentMinutes: number
  }
  
  export interface NextDepartureProps {
    schedule: Array<{ loy: string; sgw: string }>
    currentMinutes: number
    onViewRoute: () => void
  }
  
  export interface RouteDialogProps {
    isOpen: boolean
    onClose: () => void
    campusPoints: BusLocation[]
  }
  
  