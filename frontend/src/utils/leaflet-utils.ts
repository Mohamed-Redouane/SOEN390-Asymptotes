import L from "leaflet"

export const initializeLeaflet = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  })
}

export const createCustomIcon = (type: "bus" | "campus", campus?: "loyola" | "sgw") => {
  const loyolaColor = "#26a69a" 
  const sgwColor = "#fb8c00"     
  const busColor = "#8bc34a"     

  let html = ""
  let iconColor = ""
  let pulseKeyframe = ""

  if (type === "bus") {
    iconColor = busColor
    pulseKeyframe = "busPulse"
    html = `
      <div class="leaflet-marker-icon" style="background-color: ${iconColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px rgba(139,195,74,0.3), 0 0 0 6px rgba(139,195,74,0.1); animation: ${pulseKeyframe} 2s infinite;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.2 0-2.1.8-2.4 1.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>
      </div>
      <style>
        @keyframes ${pulseKeyframe} {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,195,74,0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(139,195,74,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,195,74,0); }
        }
      </style>
    `
  } else {
    const color = campus === "loyola" ? loyolaColor : sgwColor
    const pulseColor = campus === "loyola" ? "rgba(38,166,154,0.6)" : "rgba(251,140,0,0.6)"
    const pulseFade = campus === "loyola" ? "rgba(38,166,154,0)" : "rgba(251,140,0,0)"
    pulseKeyframe = `pulse-${campus}`

    html = `
      <div class="leaflet-marker-icon" style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px ${pulseColor}, 0 0 0 6px ${pulseColor.replace("0.6", "0.1")}; animation: ${pulseKeyframe} 2s infinite;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
      <style>
        @keyframes ${pulseKeyframe} {
          0% { box-shadow: 0 0 0 0 ${pulseColor}; }
          50% { box-shadow: 0 0 0 10px ${pulseFade}; }
          100% { box-shadow: 0 0 0 0 ${pulseFade}; }
        }
      </style>
    `
  }

  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}
