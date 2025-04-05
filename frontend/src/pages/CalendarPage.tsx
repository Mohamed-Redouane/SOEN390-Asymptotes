import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import GoogleCalendarConnect from '../components/GoogleCalendarConnect';
import ErrorMessage from '../components/ErrorMessage';
import EventDetailsModal from '../components/EventDetailsModal';
import CalendarSelector from '../components/CalendarSelector';
import WeekView from '../components/WeekView';
import SmartPlanner from '../components/SmartPlanner';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';


const CalendarPage: React.FC = () => {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  
  const [isSmartPlannerOpen, setIsSmartPlannerOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

   // Get user's current position on component mount
   useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Handle error silently - current position will remain null
        }
      );
    }
  }, []);

  const navigate = useNavigate();
  const handleNavigateToDirections = () => {
    const nextClass = handleGoToNextClass();
    
    if (nextClass) {
      navigate('/directions', {
        state: {
          eventName: nextClass.summary,
          destination: nextClass.location,
          isFromSchedule: true
        }
      });
    }
  };

  const handleGoToNextClass = () => {
    // In here we check all the events for today, and based on the current time we find the next class.
    const currentDate = new Date();
    // Use 2025-03-25 at 9:00 AM as a test case.
    // const currentDate = new Date("2025-03-26T09:00:00Z"); // Test case

    // First we filter only the next upcoming event
    const upcomingClasses = events.filter(event => {
      const startTime = new Date(event.start.dateTime || event.start.date);
      return (
        startTime > currentDate &&
        event.location &&
        startTime.getDate() === currentDate.getDate() &&
        startTime.getMonth() === currentDate.getMonth() &&
        startTime.getFullYear() === currentDate.getFullYear()
      );
    });

    const nextClass = upcomingClasses[0]; // Get the first upcoming class
    if (!nextClass) {
      alert("No upcoming classes found for today.");
      return;
    }
    // Now just 
    console.log("Current Time:", nextClass.summary);
    return nextClass;
  }

  const handleCalendarsLoaded = (loadedCalendars: any[]) => {
    setCalendars(loadedCalendars);
    if (loadedCalendars.length > 0) {
      setSelectedCalendarId(loadedCalendars[0].id);
    }
  };

  
  const handleSmartPlannerClick = () => {
    setIsSmartPlannerOpen(true);
  };

  const handleAuthChange = (authStatus: boolean) => {
    setIsAuthenticated(authStatus);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };
  //refactored to use chain expression for better readability.
  const handleGetEvents = async (calendarId: string) => {
    if (!gapi.client?.calendar) {
      setErrorMessage("Google Calendar API client not initialized.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (!isSignedIn) {
      setErrorMessage("You are not signed in. Please sign in to view your calendars.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setLoading(true);
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); 
      
      const timeMin = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate(),
        0, 0, 0
      ).toISOString();

      const timeMax = new Date(
        endOfWeek.getFullYear(),
        endOfWeek.getMonth(),
        endOfWeek.getDate(),
        23, 59, 59
      ).toISOString();

      const response = await gapi.client.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime',
      });

      const events = response.result.items || [];
      setEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      setErrorMessage("Failed to fetch events. Please check your connection and try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCalendarId && isAuthenticated) {
      handleGetEvents(selectedCalendarId);
    }
  }, [selectedCalendarId, isAuthenticated]);

  const today = new Date().toLocaleDateString('en-CA'); 
  
  return (
    <div className="min-h-screen from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
          📅 Course Schedule
        </h1>


        <GoogleCalendarConnect
          onCalendarsLoaded={handleCalendarsLoaded}
          onAuthChange={handleAuthChange}
          onError={(errorMessage) => {
            setErrorMessage(errorMessage);
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
          }}
        />

        <ErrorMessage
          message={errorMessage || "An unknown error occurred."}
          show={showError}
        />

        {isAuthenticated && calendars.length > 0 && (
          <div>
          <CalendarSelector
            calendars={calendars}
            selectedCalendarId={selectedCalendarId}
            onSelectCalendar={(calendarId) => setSelectedCalendarId(calendarId)}
          />

          {/* Smart Planner Button */}
          <div className="mb-6 text-center">
            <button
              data-cy="smart-planner-button"  // Preferred for Cypress
              onClick={handleSmartPlannerClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
              disabled={events.length === 0}
            >
              🧠 Smart Planner
            </button>
          </div>
        </div>
        )}
        
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && isAuthenticated && events.length > 0 && (
          <>
          <Button variant="contained" color="primary"  className="mb-4" onClick={handleNavigateToDirections}> Directions To Next Class</Button>
          {/* Add a small vertical space */}
          <div className="mb-4" />
          <WeekView
            events={events}
            today={today}
            onEventClick={handleEventClick}
          />
          </>
        )}

        {!loading && isAuthenticated && events.length === 0 && (
          <p className="text-gray-500 text-center">No events found.</p>
        )}
        <EventDetailsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          selectedEvent={selectedEvent}
        />
                <SmartPlanner
          isOpen={isSmartPlannerOpen}
          onClose={() => setIsSmartPlannerOpen(false)}
          events={events}
          currentPosition={currentPosition}
        />
      </div>
    
    </div>
    
    
  );
};

export default CalendarPage;