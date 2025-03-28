import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { cn } from "../../lib/utils"
import { AlertCircle, Clock, MapPin, Route } from "lucide-react"
import { timeToMinutes } from "../../utils/time-utils"
import type { NextDepartureProps } from "../types"

export const NextDeparture = ({ schedule, currentMinutes, onViewRoute }: NextDepartureProps) => {
  const nextDeparture = schedule.find((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })

  if (!nextDeparture) {
    return (
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

  const isUrgent = nextDepartureMinutes <= 5
  const isSoon = nextDepartureMinutes <= 15 && !isUrgent

  return (
    <Card
      className={cn(
        "border transition-all duration-300 bg-white",
        isUrgent ? "border-orange-200" : isSoon ? "border-teal-200" : "border-gray-200",
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
              {nextDepartureMinutes >= 60 ? (
                <>
                  {Math.floor(nextDepartureMinutes / 60)}
                  <span className="text-sm font-normal">h</span>
                  {nextDepartureMinutes % 60 > 0 && (
                    <>
                      {" "}
                      {nextDepartureMinutes % 60}
                      <span className="text-sm font-normal">min</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  {nextDepartureMinutes} <span className="text-sm font-normal">min</span>
                </>
              )}
            </p>
          </div>
        </div>

        <Progress
          value={progressValue}
          className={cn(
            "h-2",
            isUrgent
              ? "bg-gray-100 text-orange-500"
              : isSoon
                ? "bg-gray-100 text-teal-500"
                : "bg-gray-100 text-teal-500"
          )}
        />

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {isUrgent ? "Hurry! Departing soon" : isSoon ? "Departing soon" : ""}
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