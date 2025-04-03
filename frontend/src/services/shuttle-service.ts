import type { BusLocation } from "../components/types"

export const fetchShuttleData = async (): Promise<{
  busLocations: BusLocation[]
  error: string | null
  lastUpdated: Date | null
}> => {
  try {

    const initResponse = await fetch("/api/concordiabusmap/Map.aspx", {
      method: "GET",
      credentials: "include",
    })

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize session: ${initResponse.status}`)
    }


    const response = await fetch("/api/concordiabusmap/WebService/GService.asmx/GetGoogleObject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify({}), 
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      throw new Error("Response is not JSON")
    }

    const data = await response.json()
    if (data?.d && Array.isArray(data.d.Points)) {
      return {
        busLocations: data.d.Points,
        error: null,
        lastUpdated: new Date(),
      }
    } else {
      throw new Error("Unexpected data format")
    }
  } catch (err) {
    console.error("Error fetching shuttle data:", err)
    const errorMessage = `Could not load shuttle data: ${err instanceof Error ? err.message : "Unknown error"}`


    return {
      busLocations: [
        {
          ID: "GPLoyola",
          Latitude: 45.458424,
          Longitude: -73.638264,
          Title: "Loyola Campus",
        },
        {
          ID: "GPSirGeorge",
          Latitude: 45.497304,
          Longitude: -73.578326,
          Title: "Sir George Williams Campus",
        },
      ],
      error: errorMessage,
      lastUpdated: null,
    }
  }
}

