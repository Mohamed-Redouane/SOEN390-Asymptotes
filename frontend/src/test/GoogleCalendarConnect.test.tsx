import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import GoogleCalendarConnect from '../Components/GoogleCalendarConnect';
import { gapi } from 'gapi-script';


vi.mock('gapi-script', () => ({
  gapi: {
    load: vi.fn(),
    client: {
      init: vi.fn(),
      calendar: {
        calendarList: {
          list: vi.fn(),
        },
      },
    },
    auth2: {
      getAuthInstance: vi.fn(() => ({
        isSignedIn: {
          get: vi.fn(),
          listen: vi.fn(),
        },
        signIn: vi.fn().mockResolvedValue(true),
        signOut: vi.fn().mockResolvedValue(true),
      })),
    },
  },
}));

describe('GoogleCalendarConnect', () => {
  const onCalendarsLoaded = vi.fn();
  const onAuthChange = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders sign-in button when not signed in', () => {
    render(
      <GoogleCalendarConnect
        onCalendarsLoaded={onCalendarsLoaded}
        onAuthChange={onAuthChange}
        onError={onError}
      />
    );
    expect(screen.getByText('Sign In with Google')).toBeInTheDocument();
  });
  
  
});