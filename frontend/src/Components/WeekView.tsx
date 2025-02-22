import React from 'react';

interface WeekViewProps {
  events: any[];
  today: string;
  onEventClick: (event: any) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ events, today, onEventClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay() + index + 1);
        const dateString = date.toISOString().split("T")[0];
        const dayEvents = events.filter((event: any) => {
          const eventStart = event.start?.dateTime || event.start?.date;
          return eventStart && eventStart.startsWith(dateString);
        });
        const isToday = dateString === today;

        return (
          <div
            key={day}
            className={`p-4 rounded-lg shadow-md border border-gray-200 ${
              isToday ? "bg-blue-50" : "bg-white"
            }`}
          >
            <h2 className="text-lg font-bold text-center mb-2">
              {day} <span className="text-sm text-gray-500">{dateString}</span>
            </h2>
            {dayEvents.length > 0 ? (
              dayEvents.map((event: any) => {
                const startTime = event.start?.dateTime
                  ? event.start.dateTime.split("T")[1].substring(0, 5)
                  : "All Day";
                const endTime = event.end?.dateTime
                  ? event.end.dateTime.split("T")[1].substring(0, 5)
                  : "All Day";

                return (
                  <div
                    key={event.id}
                    className="p-2 mb-2 bg-blue-100 text-blue-900 rounded-md cursor-pointer hover:bg-blue-200 transition duration-300"
                    onClick={() => onEventClick(event)}
                  >
                    <p className="font-medium">{event.summary}</p>
                    <p className="text-sm text-blue-700">
                      {startTime} - {endTime}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center">No Events</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;