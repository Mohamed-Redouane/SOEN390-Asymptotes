import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface GoogleCalendarConnectProps {
  onEventsLoaded: (events: any[]) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onEventsLoaded }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Access from .env
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY; // Access from .env
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

  useEffect(() => {
    const initClient = async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      } catch (error) {
        console.error("Error initializing Google API client:", error);
      }
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const updateSigninStatus = (isSignedIn: boolean) => {
    setIsSignedIn(isSignedIn);
  };

  const handleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn().then(() => {
      alert('Signed in successfully.');
    });
  };

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut().then(() => {
      alert('You have been signed out.');
    });
    //clear events
    onEventsLoaded([]);
    
  };
  /**
   * CALENDAR + EVENT LOGIC 
   * 
   */
  const handleGetEvents = async () => {
    setIsLoading(true);
    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      if (events && events.length > 0) {
        onEventsLoaded(events); // Pass events to CalendarPage
      } else {
        onEventsLoaded([]); // Pass an empty array if no events are found
        console.log('No upcoming events found.');
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      onEventsLoaded([]); // Pass an empty array on error
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      {isSignedIn ? (
        <div>
          <Button variant="contained" color="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button variant="contained" color="secondary" onClick={handleGetEvents} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Get Events'}
          </Button>
        </div>
      ) : (
        <Button variant="contained" color="primary" onClick={handleSignIn}>
          Sign In with Google
        </Button>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;