import { cn } from "../../lib/utils";
import { MapPin } from "lucide-react";
import { timeToMinutes, formatMinutes } from "../../utils/time-utils";
import type { ScheduleItemProps } from "../types";

// Base Schedule Item Component
const BaseScheduleItem = ({
  time,
  minutesUntil,
  isUpcoming,
  isUrgent = false,
  locationName,
}: {
  time: string;
  minutesUntil: number;
  isUpcoming: boolean;
  isUrgent?: boolean;
  locationName: string;
}) => {
  return (
    <div className="flex items-center gap-3 w-1/2">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full w-8 h-8",
          isUpcoming && minutesUntil > 0
            ? isUrgent
              ? "bg-orange-500 text-white"
              : "bg-teal-500 text-white"
            : "bg-gray-200 text-gray-500"
        )}
      >
        <MapPin className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-medium",
            isUpcoming && minutesUntil > 0
              ? isUrgent
                ? "text-orange-600"
                : "text-teal-600"
              : "text-gray-500"
          )}
        >
          {time}
          {time.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
        </span>
        <span className="text-xs text-gray-500">{locationName}</span>
        {isUpcoming && minutesUntil > 0 && (
          <span
            className={cn(
              "text-xs font-medium mt-1",
              isUrgent ? "text-orange-600" : "text-teal-600"
            )}
          >
            {formatMinutes(minutesUntil)}
          </span>
        )}
      </div>
    </div>
  );
};

// Main Schedule Item Component
export const ScheduleItem = ({ loy, sgw, isUpcoming, isNext, currentMinutes }: ScheduleItemProps) => {
  const loyMinutesUntil = timeToMinutes(loy) - currentMinutes;
  const sgwMinutesUntil = timeToMinutes(sgw) - currentMinutes;

  const isUrgent = (loyMinutesUntil > 0 && loyMinutesUntil <= 5) || (sgwMinutesUntil > 0 && sgwMinutesUntil <= 5);

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
          : "hover:bg-gray-50"
      )}
    >
      <BaseScheduleItem
        time={loy}
        minutesUntil={loyMinutesUntil}
        isUpcoming={isUpcoming}
        isUrgent={loyMinutesUntil > 0 && loyMinutesUntil <= 5}
        locationName="Loyola"
      />

      <div className="flex items-center gap-3 w-1/2 justify-end">
        <BaseScheduleItem
          time={sgw}
          minutesUntil={sgwMinutesUntil}
          isUpcoming={isUpcoming}
          isUrgent={sgwMinutesUntil > 0 && sgwMinutesUntil <= 5}
          locationName="SGW"
        />
      </div>
    </div>
  );
};

// Factory for creating different types of schedule items
export const ScheduleItemFactory = {
  create: (props: ScheduleItemProps) => <ScheduleItem {...props} />,
  
  createUpcoming: (props: ScheduleItemProps) => (
    <ScheduleItem {...props} isUpcoming={true} />
  ),
  
  createNext: (props: ScheduleItemProps) => (
    <ScheduleItem {...props} isNext={true} />
  ),
  
  createUrgent: (props: ScheduleItemProps) => {
    return <ScheduleItem {...props} />; 
  }
};