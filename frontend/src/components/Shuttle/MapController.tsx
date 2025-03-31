import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { MapControllerProps } from "../types"

export const MapController = ({ center, zoom }: MapControllerProps) => {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [center, zoom, map])

  return null
}

