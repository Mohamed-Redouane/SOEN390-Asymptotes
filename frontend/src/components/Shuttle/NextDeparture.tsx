import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { cn } from "../../lib/utils"
import { AlertCircle, Clock, MapPin, Route } from "lucide-react"
import { timeToMinutes } from "../../utils/time-utils"
import type { NextDepartureProps } from "../types"

// extract no depratures part into a separate component
const NoDeparturesCard = () => (
  <Card className="bg-white border border-gray-200 text-gray-800">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Clock className="h-4 w-4 text-teal-600" />
        Next Departure
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2 text-gray-600">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <p className="text-sm">No more departures today.</p>
      </div>
      <p className="text-xs text-gray-500 mt-2">Check back tomorrow for the next available shuttle.</p>
    </CardContent>
  </Card>
)

// helper function for status logic
const getDepartureStatus = (minutes: number) => {
  if (minutes <= 5) return { isUrgent: true, isSoon: false }
  if (minutes <= 15) return { isUrgent: false, isSoon: true }
  return { isUrgent: false, isSoon: false }
}

// helper function for time formatting
const formatDepartureTime = (minutes: number) => {
  if (minutes >= 60) {
    return (
      <>
        {Math.floor(minutes / 60)}
        <span className="text-sm font-normal">h</span>
        {minutes % 60 > 0 && (
          <>
            {" "}
            {minutes % 60}
            <span className="text-sm font-normal">min</span>
          </>
        )}
      </>
    )
  }
  return <>{minutes} <span className="text-sm font-normal">min</span></>
}

export const NextDeparture = ({ schedule, currentMinutes, onViewRoute }: NextDepartureProps) => {
  const nextDeparture = schedule.find((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })

  if (!nextDeparture){
    return <NoDeparturesCard />
  } 
  

  const loyMinutes = timeToMinutes(nextDeparture.loy)
  const sgwMinutes = timeToMinutes(nextDeparture.sgw)
  const minutesUntilLoy = loyMinutes - currentMinutes
  const minutesUntilSgw = sgwMinutes - currentMinutes

  const isLoyolaNext = minutesUntilLoy > 0 && (minutesUntilSgw <= 0 || minutesUntilLoy < minutesUntilSgw)
  const nextDepartureMinutes = isLoyolaNext ? minutesUntilLoy : minutesUntilSgw
  const nextDepartureCampus = isLoyolaNext ? "Loyola Campus" : "Sir George Williams Campus"
  const nextDepartureTime = isLoyolaNext ? nextDeparture.loy : nextDeparture.sgw

  const progressValue = Math.min(100, Math.max(0, ((15 - Math.min(15, nextDepartureMinutes)) / 15) * 100))

  // use helper function for the status
  const {isUrgent, isSoon} = getDepartureStatus(nextDepartureMinutes)

  const getBorderColor = (isUrgent: boolean, isSoon: boolean) => {
    if (isUrgent) return "border-orange-200"
    if(isSoon) return "border-teal-200"
    return "border-gray-200";
  }

  const getStatusMessage = (isUrgent: boolean, isSoon: boolean): string => {
    if (isUrgent) return "Hurry! Departing soon";
    if (isSoon) return "Departing soon";
    return "";
  };
  

  return (
    <Card
      className={cn(
        "border transition-all duration-300 bg-white",
        getBorderColor(isUrgent, isSoon)
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <Clock className={cn("h-4 w-4", isUrgent ? "text-orange-600" : "text-teal-600")} />
          Next Departure
          {isUrgent && (
            <Badge variant="outline" className="ml-auto text-xs bg-orange-100 text-orange-700 border-orange-200">
              Departing Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className={cn("p-1.5 rounded-full", isLoyolaNext ? "bg-teal-500 text-white" : "bg-orange-500 text-white")}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{nextDepartureCampus}</p>
              <p className="text-sm text-gray-500">Departs at {nextDepartureTime}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", isUrgent ? "text-orange-600" : "text-teal-600")}>
              {formatDepartureTime(nextDepartureMinutes)}
            </p>
        </div>
      </div>

        <Progress
          value={progressValue}
          className={cn(
            "h-2",
            isUrgent ? "bg-gray-100 text-orange-500" : "bg-gray-100 text-teal-500"
          )}
        />

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {getStatusMessage(isUrgent, isSoon)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200"
            onClick={onViewRoute}
          >
            <Route className="h-3 w-3" />
            View route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}