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
  <Card className="border border-gray-200">
    <CardHeader>
      <CardTitle className="text-base flex items-center gap-2">
        <Clock className="h-4 w-4 text-teal-500" />
        Next Departure
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-orange-500" />
        <p className="text-sm">No more departures today.</p>
      </div>
      <p className="text-xs mt-2">Check back tomorrow for the next available shuttle.</p>
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
  const nextDepartureIndex = schedule.findIndex((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })
  const nextDeparture = schedule[nextDepartureIndex];
  
  if (!nextDeparture){
    return <NoDeparturesCard />
  }

  const loyMinutes = timeToMinutes(nextDeparture.loy)
  const sgwMinutes = timeToMinutes(nextDeparture.sgw)
  const minutesUntilLoy = loyMinutes - currentMinutes
  const minutesUntilSgw = sgwMinutes - currentMinutes

  const isLoyolaNext = minutesUntilLoy > 0 
    && (minutesUntilSgw <= 0 || minutesUntilLoy < minutesUntilSgw)
  const prevDeparture = nextDepartureIndex-1 >= 0 ? 
    schedule[nextDepartureIndex-1] : {sgw: "00:00", loy: "00:00"} // midnight
  const nextDepartureContext = isLoyolaNext ? {
    minutes: minutesUntilLoy,
    campus: "Loyola Campus",
    time: nextDeparture.loy,
    duration: loyMinutes - timeToMinutes(prevDeparture.loy)
  } : {
    minutes: minutesUntilSgw,
    campus: "Sir George Williams Campus",
    time: nextDeparture.sgw,
    duration: sgwMinutes - timeToMinutes(prevDeparture.sgw)
  }

  const progressValue = 100*((nextDepartureContext.duration
    - nextDepartureContext.minutes) / nextDepartureContext.duration);

  // use helper function for the status
  const {isUrgent, isSoon} = getDepartureStatus(nextDepartureContext.minutes)

  const getBorderColor = (isUrgent: boolean, isSoon: boolean) => {
    if (isUrgent) return "border-orange-200"
    if (isSoon) return "border-teal-200"
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
        "border transition-all duration-300",
        getBorderColor(isUrgent, isSoon))}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className={cn("h-4 w-4", isUrgent ? "text-orange-500" : "text-teal-500")} />
          Next Departure
          {isUrgent && (
            <Badge variant="outline" className="ml-auto text-xs bg-orange-50 dark:bg-background text-orange-500 border-orange-200">
              Departing Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className={cn("p-1.5 rounded-full", isLoyolaNext ? "bg-teal-500 dark:bg-teal-500" : "bg-orange-500 dark:bg-orange-500")}
            >
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{nextDepartureContext.campus}</p>
              <p className="text-sm">Departs at {nextDepartureContext.time}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", isUrgent ? "text-orange-600" : "text-teal-600")}>
              {formatDepartureTime(nextDepartureContext.minutes)}
            </p>
        </div>
      </div>

        <Progress
          value={progressValue}
          className={cn(
            "h-2",
            isUrgent ? "bg-orange-500 text-orange-500" : "bg-teal-500 text-teal-500"
          )}
        />

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-primary">
            {getStatusMessage(isUrgent, isSoon)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 px-2 py-1 hover:text-gray-800 hover:bg-gray-50 border-gray-200"
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