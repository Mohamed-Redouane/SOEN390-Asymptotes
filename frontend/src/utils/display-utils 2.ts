
export function getDisplayName(id: string) {
    switch (id) {
      case "GPLoyola":
        return "Loyola Campus"
      case "GPSirGeorge":
        return "Sir George Williams Campus"
      default:
        if (id.startsWith("BUS")) {
          return `Shuttle #${id.slice(3)}`
        }
        return id
    }
  }
  
  