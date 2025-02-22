import React, { useState } from 'react';
import GoogleCalendarConnect from '../Components/GoogleCalendarConnect';
import dayjs from 'dayjs';
import { Dialog, Transition } from '@headlessui/react';
import { FaClock, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';
import { useMediaQuery, useTheme } from '@mui/material';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEventsLoaded = (loadedEvents: any[]) => {
    setEvents(loadedEvents);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 flex items-center justify-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-gray-900">📅 Your Events</h1>

        <GoogleCalendarConnect onEventsLoaded={handleEventsLoaded} />

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-gray-900">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg shadow-md border bg-white cursor-pointer hover:bg-blue-100"
                onClick={() => handleEventClick(event)}
              >
                <h2 className="text-lg font-bold text-center mb-2">{event.summary}</h2>
                <p className="text-sm text-gray-500">
                  {event.start.dateTime
                    ? dayjs(event.start.dateTime).format('MMMM D, YYYY h:mm A')
                    : dayjs(event.start.date).format('MMMM D, YYYY')}
                </p>
                <p className="text-sm text-gray-500">{event.location}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No events to display.</p>
        )}
      </div>

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 text-gray-900">
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