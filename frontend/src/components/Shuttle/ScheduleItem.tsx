import { cn } from "../../lib/utils"
import { MapPin } from "lucide-react"
import { timeToMinutes, formatMinutes } from "../../utils/time-utils"
import type { ScheduleItemProps } from "../types"

export const ScheduleItem = ({ loy, sgw, isUpcoming, isNext, currentMinutes }: ScheduleItemProps) => {
  const loyMinutesUntil = timeToMinutes(loy) - currentMinutes
  const sgwMinutesUntil = timeToMinutes(sgw) - currentMinutes

  const isUrgent = (loyMinutesUntil > 0 && loyMinutesUntil <= 5) || (sgwMinutesUntil > 0 && sgwMinutesUntil <= 5)

  return (
    <div
      className={cn(
        "flex justify-between py-3 px-4 rounded-md transition-all",
        isNext
          ? "bg-white border border-teal-200"
          : isUrgent
            ? "bg-white border border-orange-200"
            : isUpcoming
              ? "bg-white hover:bg-gray-50"
              : "hover:bg-gray-50",
      )}
    >
      <div className="flex items-center gap-3 w-1/2">
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-full w-8 h-8",
            isUpcoming && loyMinutesUntil > 0 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500",
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
                  ? "text-orange-600"
                  : "text-teal-600"
                : "text-gray-500",
            )}
          >
            {loy}
            {loy.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
          </span>
          <span className="text-xs text-gray-500">Loyola</span>
          {isUpcoming && loyMinutesUntil > 0 && (
            <span
              className={cn("text-xs font-medium mt-1", loyMinutesUntil <= 5 ? "text-orange-600" : "text-teal-600")}
            >
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
                  ? "text-orange-600"
                  : "text-orange-600"
                : "text-gray-500",
            )}
          >
            {sgw}
            {sgw.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
          </span>
          <span className="text-xs text-gray-500">SGW</span>
          {isUpcoming && sgwMinutesUntil > 0 && (
            <span
              className={cn("text-xs font-medium mt-1", sgwMinutesUntil <= 5 ? "text-orange-600" : "text-orange-600")}
            >
              {formatMinutes(sgwMinutesUntil)}
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-full w-8 h-8",
            isUpcoming && sgwMinutesUntil > 0 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500",
          )}
        >
          <MapPin className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

