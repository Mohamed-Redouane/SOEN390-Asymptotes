
export function timeToMinutes(timeStr: string): number {
    const cleanStr = timeStr.replace("*", "")
    const [hh, mm] = cleanStr.split(":").map(Number)
    return hh * 60 + mm
  }
  
  export function formatMinutes(m: number) {
    if (m <= 0) return "Departed"
    if (m < 60) return `${m} min`
    const hrs = Math.floor(m / 60)
    const mins = m % 60
    return `${hrs}h ${mins > 0 ? `${mins}m` : ""}`
  }
  

  export function formatTime(date: Date | null) {
    if (!date) return ""
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  
  