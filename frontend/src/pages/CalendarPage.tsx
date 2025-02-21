import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaClock, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import GoogleCalendarConnect from "../Components/GoogleCalendarConnect";
import Cookies from "js-cookie";


const mockedCalendars = [{ id: "1", summary: "Courses Schedule" }];

interface Event {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
  recurrence?: string[];
}


const mockedEvents: Event[] = [
  {
    id: "event1",
    summary: "SOEN 387 F",
    start: { dateTime: "2025-01-14T08:45:00-05:00" }, 
    end: { dateTime: "2025-01-14T11:30:00-05:00" },
    location: "Learning Square 208",
    description: "Lecture",
    recurrence: ["RRULE:FREQ=WEEKLY;COUNT=13"],
  },
  {
    id: "event2",
    summary: "ENGR 392 D",
    start: { dateTime: "2025-01-17T08:45:00-05:00" },
    end: { dateTime: "2025-01-17T11:30:00-05:00" },
    location: "Learning Square 208",
    description: "Lecture",
    recurrence: ["RRULE:FREQ=WEEKLY;COUNT=13"],
  },
];

const expandRecurringEvents = (events: Event[]): Event[] => {
  let expandedEvents: Event[] = [];

  events.forEach((event) => {
    expandedEvents.push(event); 

    if (event.recurrence) {
      const recurrenceRule = event.recurrence[0]; 
      const match = recurrenceRule.match(/COUNT=(\d+)/);
      const occurrences = match ? parseInt(match[1], 10) : 1;

      const startDate = new Date(event.start.dateTime || event.start.date || "");
      const endDate = new Date(event.end.dateTime || event.end.date || "");

      for (let i = 1; i < occurrences; i++) {
        const newStart = new Date(startDate);
        newStart.setUTCDate(startDate.getUTCDate() + i * 7); 

        const newEnd = new Date(endDate);
        newEnd.setUTCDate(endDate.getUTCDate() + i * 7);

        expandedEvents.push({
          ...event,
          id: `${event.id}-week-${i}`,
          start: { dateTime: newStart.toISOString() }, 
          end: { dateTime: newEnd.toISOString() },
        });
      }
    }
  });

  return expandedEvents;
};

const CalendarPage = () => {
  const [calendars, setCalendars] = useState(mockedCalendars);
  const [selectedCalendarId, setSelectedCalendarId] = useState(mockedCalendars[0]?.id || "");
  const [events, setEvents] = useState<Event[]>(expandRecurringEvents(mockedEvents));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!Cookies.get("access_token"));
    };
    checkAuth();
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, []);

  
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  const currentDay = firstDayOfWeek.getUTCDay();
  firstDayOfWeek.setUTCDate(today.getUTCDate() - (currentDay === 0 ? 6 : currentDay - 1));
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
      {!isAuthenticated ? (
        <GoogleCalendarConnect />
      ) : (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10">📅 Course Schedule</h1>

          <div className="mb-6">
            <label className="block text-lg font-medium">Select Calendar:</label>
            <select
              className="mt-2 p-2 border rounded-md w-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
            >
              {calendars.map((calendar) => (
                <option 
                  key={calendar.id} 
                  value={calendar.id} 
                  className="p-2 bg-gray-100 hover:bg-blue-100 text-gray-900"
                >
                  {calendar.summary}
                </option>
              ))}
            </select>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map((day, index) => {
              const date = new Date(firstDayOfWeek);
              date.setDate(firstDayOfWeek.getDate() + index);
              const dateString = date.toISOString().split("T")[0];

              const dayEvents = events.filter((event) => {
                const eventDate = event.start?.dateTime
                  ? new Date(event.start.dateTime).toISOString().split("T")[0]
                  : "";
                return eventDate === dateString;
              });

              return (
                <div key={day} className="p-4 rounded-lg shadow-md border bg-white">
                  <h2 className="text-lg font-bold text-center mb-2">
                    {day} <span className="text-sm text-gray-500">{dateString}</span>
                  </h2>
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-2 mb-2 bg-blue-100 text-blue-900 rounded-md cursor-pointer hover:bg-blue-200"
                        onClick={() => handleEventClick(event)}
                      >
                        <p className="font-medium">{event.summary}</p>
                        <p className="text-sm">
                          {event.start?.dateTime?.split("T")[1]?.substring(0, 5)} -{" "}
                          {event.end?.dateTime?.split("T")[1]?.substring(0, 5)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center">No classes</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-md w-full bg-white rounded-xl shadow-xl p-6">
              <Dialog.Title className="text-2xl font-bold">{selectedEvent?.summary}</Dialog.Title>
              <div className="mt-4 space-y-2">
                <p className="flex items-center">
                  <FaClock className="mr-2" />
                  {selectedEvent?.start?.dateTime?.split("T")[1]?.substring(0, 5)} -{" "}
                  {selectedEvent?.end?.dateTime?.split("T")[1]?.substring(0, 5)}
                </p>
                <p className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {selectedEvent?.location || "No location"}
                </p>
                <p className="flex items-center">
                  <FaInfoCircle className="mr-2" />
                  {selectedEvent?.description || "No description"}
                </p>
              </div>
              <button
                className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CalendarPage;


















