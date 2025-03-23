import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { ScrollArea } from "../components/ui/scroll-area"
import { Clock, MapPin, Info, Calendar, AlertCircle } from "lucide-react"
import { Progress } from "../components/ui/progress"
import { cn } from "../lib/utils"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"

function timeToMinutes(timeStr: string): number {
  const cleanStr = timeStr.replace("*", "")
  const [hh, mm] = cleanStr.split(":").map(Number)
  return hh * 60 + mm
}


function NextDeparture({
  schedule,
  currentMinutes,
}: {
  schedule: Array<{ loy: string; sgw: string }>
  currentMinutes: number
}) {
  const nextDeparture = schedule.find((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })

  if (!nextDeparture) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Next Departure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">No more departures today.</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Check back tomorrow for the next available shuttle.</p>
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
        "border transition-all duration-300",
        isUrgent
          ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
          : isSoon
            ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
            : "bg-gradient-to-br from-muted/50 to-background border-muted",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className={cn("h-4 w-4", isUrgent ? "text-red-500" : "text-primary")} />
          Next Departure
          {isUrgent && (
            <Badge variant="destructive" className="ml-auto text-xs">
              Departing Soon
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-full", isLoyolaNext ? "bg-purple-100" : "bg-red-100")}>
              <MapPin className={cn("h-4 w-4", isLoyolaNext ? "text-purple-600" : "text-red-600")} />
            </div>
            <div>
              <p className="font-medium">{nextDepartureCampus}</p>
              <p className="text-sm text-muted-foreground">Departs at {nextDepartureTime}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-2xl font-bold", isUrgent ? "text-red-500" : "text-primary")}>
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
          className={cn("h-2", isUrgent ? "bg-red-100" : isSoon ? "bg-primary/20" : "bg-muted")}
        />

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {isUrgent ? "Hurry! Departing soon" : isSoon ? "Departing soon" : ""}
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 py-1 text-primary">
            <Info className="h-3 w-3" />
            View route
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


function ScheduleItem({
  loy,
  sgw,
  isUpcoming,
  isNext,
  currentMinutes,
}: {
  loy: string
  sgw: string
  isUpcoming: boolean
  isNext: boolean
  currentMinutes: number
}) {

    const loyMinutesUntil = timeToMinutes(loy) - currentMinutes
  const sgwMinutesUntil = timeToMinutes(sgw) - currentMinutes


  function formatMinutes(m: number) {
    if (m <= 0) return "Departed"
    if (m < 60) return `${m} min`
    const hrs = Math.floor(m / 60)
    const mins = m % 60
    return `${hrs}h ${mins > 0 ? `${mins}m` : ""}`
  }


  const isUrgent = (loyMinutesUntil > 0 && loyMinutesUntil <= 5) || (sgwMinutesUntil > 0 && sgwMinutesUntil <= 5)

  return (
    <div
      className={cn(
        "flex justify-between py-3 px-4 rounded-md transition-all",
        isNext
          ? "bg-primary/15 border border-primary/30"
          : isUrgent
            ? "bg-red-50 border border-red-100"
            : isUpcoming
              ? "bg-primary/5 hover:bg-primary/10"
              : "hover:bg-muted/50",
      )}
    >

      <div className="flex items-center gap-3 w-1/2">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-full w-8 h-8",
            isUpcoming && loyMinutesUntil > 0 ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground",
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "font-medium",
              isUpcoming && loyMinutesUntil > 0
                ? loyMinutesUntil <= 5
                  ? "text-red-600"
                  : "text-purple-700"
                : "text-muted-foreground",
            )}
          >
            {loy}
            {loy.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
          </span>
          <span className="text-xs text-muted-foreground">Loyola</span>
          {isUpcoming && loyMinutesUntil > 0 && (
            <span className={cn("text-xs font-medium mt-1", loyMinutesUntil <= 5 ? "text-red-600" : "text-purple-600")}>
              {formatMinutes(loyMinutesUntil)}
            </span>
          )}
        </div>
      </div>


      <div className="flex items-center gap-3 w-1/2 justify-end">
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "font-medium",
              isUpcoming && sgwMinutesUntil > 0
                ? sgwMinutesUntil <= 5
                  ? "text-red-600"
                  : "text-red-700"
                : "text-muted-foreground",
            )}
          >
            {sgw}
            {sgw.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
          </span>
          <span className="text-xs text-muted-foreground">SGW</span>
          {isUpcoming && sgwMinutesUntil > 0 && (
            <span className="text-xs font-medium mt-1 text-red-600">
            {formatMinutes(sgwMinutesUntil)}
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-full w-8 h-8",
            isUpcoming && sgwMinutesUntil > 0 ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground",
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}


export default function ConcordiaSchedule() {
  const [selectedDay, setSelectedDay] = useState<"mon-thu" | "fri">("mon-thu")
  const [currentMinutes, setCurrentMinutes] = useState<number>(0)
  const [currentDay, setCurrentDay] = useState<number>(0)

  useEffect(() => {

    const updateTime = () => {
      const now = new Date()
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes())
      setCurrentDay(now.getDay()) 
    }

    updateTime()

    const today = new Date().getDay() 
    if (today === 5) {

        setSelectedDay("fri")
    } else if (today >= 1 && today <= 4) {

        setSelectedDay("mon-thu")
    }

    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  const scheduleMonThu = [
    { loy: "9:15", sgw: "9:30" },
    { loy: "9:30", sgw: "9:45" },
    { loy: "9:45", sgw: "10:00" },
    { loy: "10:00", sgw: "10:15" },
    { loy: "10:15", sgw: "10:30" },
    { loy: "10:30", sgw: "10:45" },
    { loy: "10:45", sgw: "11:00" },
    { loy: "11:00", sgw: "11:15" },
    { loy: "11:15", sgw: "11:30" },
    { loy: "11:30", sgw: "12:15" },
    { loy: "11:45", sgw: "12:30" },
    { loy: "12:30", sgw: "12:45" },
    { loy: "12:45", sgw: "13:00" },
    { loy: "13:00", sgw: "13:15" },
    { loy: "13:15", sgw: "13:30" },
    { loy: "13:30", sgw: "13:45" },
    { loy: "13:45", sgw: "14:00" },
    { loy: "14:00", sgw: "14:15" },
    { loy: "14:15", sgw: "14:30" },
    { loy: "14:30", sgw: "14:45" },
    { loy: "14:45", sgw: "15:00" },
    { loy: "15:00", sgw: "15:15" },
    { loy: "15:15", sgw: "15:30" },
    { loy: "15:30", sgw: "16:00" },
    { loy: "15:45", sgw: "16:15" },
    { loy: "16:30", sgw: "16:45" },
    { loy: "16:45", sgw: "17:00" },
    { loy: "17:00", sgw: "17:15" },
    { loy: "17:15", sgw: "17:30" },
    { loy: "17:30", sgw: "17:45" },
    { loy: "17:45", sgw: "18:00" },
    { loy: "18:00", sgw: "18:15" },
    { loy: "18:15*", sgw: "18:30*" },
    { loy: "18:30*", sgw: "18:30*" },
  ]


  const scheduleFri = [
    { loy: "9:15", sgw: "9:45" },
    { loy: "9:30", sgw: "10:00" },
    { loy: "9:45", sgw: "10:15" },
    { loy: "10:15", sgw: "10:45" },
    { loy: "10:45", sgw: "11:15" },
    { loy: "11:00", sgw: "11:30" },
    { loy: "11:15", sgw: "12:15" },
    { loy: "12:00", sgw: "12:30" },
    { loy: "12:15", sgw: "12:45" },
    { loy: "12:45", sgw: "13:15" },
    { loy: "13:00", sgw: "13:45" },
    { loy: "13:15", sgw: "14:00" },
    { loy: "13:45", sgw: "14:15" },
    { loy: "14:15", sgw: "14:45" },
    { loy: "14:30", sgw: "15:00" },
    { loy: "14:45", sgw: "15:15" },
    { loy: "15:15", sgw: "15:45" },
    { loy: "15:30", sgw: "16:00" },
    { loy: "15:45", sgw: "16:45" },
    { loy: "16:45", sgw: "17:15" },
    { loy: "17:15", sgw: "17:45" },
    { loy: "17:45", sgw: "18:15*" },
    { loy: "18:15*", sgw: "18:15*" },
  ]


  const activeSchedule = selectedDay === "mon-thu" ? scheduleMonThu : scheduleFri


  const nextDepartureIndex = activeSchedule.findIndex((item) => {
    const loyMinutes = timeToMinutes(item.loy)
    const sgwMinutes = timeToMinutes(item.sgw)
    return loyMinutes > currentMinutes || sgwMinutes > currentMinutes
  })


  const isWeekend = currentDay === 0 || currentDay === 6 
  const noServiceToday = isWeekend

  return (
    <div className="container mx-auto py-4 px-4 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Concordia Shuttle Schedule</h1>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground mt-1">Plan your trip between Loyola and SGW</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
          </div>
        </div>
      </div>


      {noServiceToday && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">No Service Today</h3>
                <p className="text-sm text-amber-700 mt-1">
                  The shuttle service doesn't operate on weekends. Regular service will resume on Monday.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {!noServiceToday && <NextDeparture schedule={activeSchedule} currentMinutes={currentMinutes} />}


      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Full Schedule
          </CardTitle>
          <CardDescription>Mon–Thu and Friday departure times</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="mon-thu"
                onClick={() => setSelectedDay("mon-thu")}
                className="flex items-center gap-1"
              >
                Mon–Thu
              </TabsTrigger>
              <TabsTrigger value="fri" onClick={() => setSelectedDay("fri")} className="flex items-center gap-1">
                Friday
              </TabsTrigger>
            </TabsList>


            <TabsContent value="mon-thu" className="mt-0">
              <div className="flex justify-between mb-2 px-3 text-sm font-medium">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-purple-600" />
                  Loyola
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                  Sir George Williams
                </div>
              </div>
              <Separator className="mb-2" />
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {scheduleMonThu.map((item, index) => {
                    const loyMinutes = timeToMinutes(item.loy)
                    const sgwMinutes = timeToMinutes(item.sgw)
                    const isUpcoming = loyMinutes >= currentMinutes || sgwMinutes >= currentMinutes
                    const isNext = index === nextDepartureIndex
                    return (
                      <ScheduleItem
                        key={index}
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
            </TabsContent>


            <TabsContent value="fri" className="mt-0">
              <div className="flex justify-between mb-2 px-3 text-sm font-medium">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-purple-600" />
                  Loyola
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-600" />
                  Sir George Williams
                </div>
              </div>
              <Separator className="mb-2" />
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {scheduleFri.map((item, index) => {
                    const loyMinutes = timeToMinutes(item.loy)
                    const sgwMinutes = timeToMinutes(item.sgw)
                    const isUpcoming = loyMinutes >= currentMinutes || sgwMinutes >= currentMinutes
                    const isNext = index === nextDepartureIndex
                    return (
                      <ScheduleItem
                        key={index}
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
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>* Last departure of the day</p>
            <p>Highlighted times indicate upcoming departures</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

