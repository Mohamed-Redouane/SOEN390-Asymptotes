import { cn } from "../../lib/utils";
import { MapPin } from "lucide-react";
import { timeToMinutes, formatMinutes } from "../../utils/time-utils";
import type { ScheduleItemProps } from "../types";

const ScheduleItemStyles = {
  urgent: {
    container: "bg-orange-500 text-white",
    text: "text-orange-600"
  },
  upcoming: {
    container: "bg-teal-500 text-white",
    text: "text-teal-600"
  },
  inactive: {
    container: "bg-gray-200 text-gray-500",
    text: "text-gray-500"
  }
}

// Base Schedule Item Component
const BaseScheduleItem = ({
  time,
  minutesUntil,
  status,
  locationName,
}: {
  time: string;
  minutesUntil: number;
  status: "urgent" | "upcoming" | "inactive";
  locationName: string;
}) => {

  const style = ScheduleItemStyles[status]

  return (
    <div className="flex items-center gap-3 w-1/2">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full w-8 h-8",
          style.container
        )}
      >
        <MapPin className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-medium",
            style.text
          )}
        >
          {time}
          {time.includes("*") && <span className="text-xs ml-1 align-top">*</span>}
        </span>
        <span className="text-xs text-gray-500">{locationName}</span>
        {status !== "inactive" && minutesUntil > 0 && (
          <span
            className={cn(
              "text-xs font-medium mt-1",
              status == "urgent" ? "text-orange-600" : "text-teal-600"
            )}
          >
            {formatMinutes(minutesUntil)}
          </span>
        )}
      </div>
    </div>
  );
};

const ContainerStyles = {
  next: "bg-white border border-teal-200",
  urgent: "bg-white border border-orange-200",
  upcoming: "bg-white hover:bg-gray-50",
  default: "hover:bg-gray-50"
}

// Main Schedule Item Component
export const ScheduleItem = ({ loy, sgw, isUpcoming, isNext, currentMinutes }: ScheduleItemProps) => {
  const loyMinutesUntil = timeToMinutes(loy) - currentMinutes;
  const sgwMinutesUntil = timeToMinutes(sgw) - currentMinutes;

  const isUrgent = (loyMinutesUntil > 0 && loyMinutesUntil <= 5) || (sgwMinutesUntil > 0 && sgwMinutesUntil <= 5);

  const getContainerStyle = () => {
    if (isNext) return ContainerStyles.next;
    if (isUrgent) return ContainerStyles.urgent;
    if (isUpcoming) return ContainerStyles.upcoming;
    return ContainerStyles.default;
  }

  const getItemStatus = (minutesUntil: number): "urgent" | "upcoming" | "inactive" => {
    if (minutesUntil > 0 && minutesUntil <= 5) return "urgent";
    if (minutesUntil > 0) return "upcoming";
    return "inactive";
  };

  return (
    <div
      className={cn(
        "flex justify-between py-3 px-4 rounded-md transition-all",
        getContainerStyle()
      )}
    >
      <BaseScheduleItem
        time={loy}
        minutesUntil={loyMinutesUntil}
        status={getItemStatus(loyMinutesUntil)}
        locationName="Loyola"
      />

      <div className="flex items-center gap-3 w-1/2 justify-end">
        <BaseScheduleItem
          time={sgw}
          minutesUntil={sgwMinutesUntil}
          status={getItemStatus(sgwMinutesUntil)}
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