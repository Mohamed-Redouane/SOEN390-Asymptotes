import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface GoogleCalendarConnectProps {
  onCalendarsLoaded: (calendars: any[]) => void;
  onAuthChange: (isAuthenticated: boolean) => void;
  onError: (errorMessage: string) => void; 
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  onCalendarsLoaded,
  onAuthChange,
  onError,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
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

  const updateSigninStatus = (status: boolean) => {
    setIsSignedIn(status);
    onAuthChange(status);
    if (status) handleGetCalendars();
  };

  const handleSignIn = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      alert('Signed in successfully.');
    } catch (error) {
      console.error("Error signing in:", error);
      onError("Failed to sign in. Please try again."); 
    }
  };

  const handleSignOut = async () => {
    try {
      await gapi.auth2.getAuthInstance().signOut();
      alert('You have been signed out.');
      onAuthChange(false);
      setIsSignedIn(false);
    } catch (error) {
      console.error("Error signing out:", error);
      onError("Failed to sign out. Please try again.");
    }
  };

  const handleGetCalendars = async () => {
    setIsLoading(true);
    try {
      const response = await gapi.client.calendar.calendarList.list();
      const calendars = response.result.items || [];
      onCalendarsLoaded(calendars);
    } catch (error) {
      console.error("Error fetching calendars:", error);
      onError("Failed to fetch calendars. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  //refactored to use remove reliability for Sonar - Stop nesting ternaries in JavaScript
  const renderButton = () => {
    if (isLoading) {
      return <CircularProgress />;
    } else if (isSignedIn) {
      return (<>
      <Button variant="contained" color="primary" onClick={handleSignOut}>Sign Out</Button>
      </>)

    } else {
      return <Button variant="contained" color="primary" onClick={handleSignIn}>Sign In with Google</Button>;
    }
  };


  return (
    <div>
      {renderButton()}
    </div>
  );
};

export default GoogleCalendarConnect;
