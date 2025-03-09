describe("Google Calendar Component", () => {
  let authInstance;

  const getNextThursdayAt10AM = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate the date of Thursday of the current week
    let thursdayOfThisWeek = new Date(now);

    if (dayOfWeek === 1) { 
        // If it's Monday, return the upcoming Thursday
        thursdayOfThisWeek.setDate(now.getDate() + 3);
    } else {
        // Otherwise, calculate the Thursday of the current week based on the Monday
        const mondayOfThisWeek = new Date(now);
        mondayOfThisWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        thursdayOfThisWeek = new Date(mondayOfThisWeek);
        thursdayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 3);
    }

    // Set the time to 10:00 AM in UTC
    thursdayOfThisWeek.setHours(10, 0, 0, 0);
    
    return thursdayOfThisWeek.toISOString();
  };

  beforeEach(() => {
    // Initialize authInstance as null
    authInstance = null;

    // Intercept API calls
    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: { user: { id: "test-user", email: "test@example.com" } },
    }).as("getCurrentUser");

    cy.intercept("POST", "/api/auth/google", {
      statusCode: 200,
      body: { token: "fake-token", user: { email: "test@example.com" } },
    }).as("googleAuth");

    // Visit the page with geolocation stub
    cy.visit("http://localhost:5173/schedule", {
      onBeforeLoad(win) {
        // Stub geolocation
        cy.stub(win.navigator.geolocation, "watchPosition").callsFake((success) => {
          success({
            coords: {
              latitude: 45.4969316,
              longitude: -73.5799272,
              accuracy: 10,
            },
          });
        });
      },
    });

    cy.wait("@getCurrentUser");

    // After page loads, initialize gapi
    cy.window().then((win) => {
      // Ensure window.gapi exists
      if (!win.gapi) {
        win.gapi = {};
      }

      // Create a simple stub for gapi.load
      win.gapi.load = (apis, callback) => {
        if (typeof callback === 'function') {
          setTimeout(callback, 10); // Small timeout to mimic async behavior
        }
      };

      // Set up client API stubs
      win.gapi.client = {
        init: () => Promise.resolve(),
        calendar: {
          calendarList: {
            list: () => Promise.resolve({
              result: {
                items: [
                  { id: "cal1", summary: "Work Calendar" },
                  { id: "cal2", summary: "Personal Calendar" },
                ],
              },
            }),
          },
          events: {
            list: () => Promise.resolve({
              result: {
                items: [
                  {
                    id: "event-1",
                    summary: "ENGR 391",
                    start: { dateTime: getNextThursdayAt10AM() },
                    end: { dateTime: new Date(new Date(getNextThursdayAt10AM()).getTime() + 60 * 60 * 1000).toISOString() },
                    location: "H540",
                    description: "lecture.",
                  },
                ],
              },
            }),
          },
        },
      };

      // Set up auth2 API
      win.gapi.auth2 = {
        init: () => Promise.resolve(),
        getAuthInstance: () => {
          if (!authInstance) {
            authInstance = {
              signIn: () => {
                // When signIn is called, update isSignedIn.get
                authInstance.isSignedIn.get = () => true;
                if (typeof authInstance.isSignedIn.callback === 'function') {
                  authInstance.isSignedIn.callback(true);
                }
                return Promise.resolve();
              },
              signOut: () => {
                // When signOut is called, update isSignedIn.get
                authInstance.isSignedIn.get = () => false;
                if (typeof authInstance.isSignedIn.callback === 'function') {
                  authInstance.isSignedIn.callback(false);
                }
                return Promise.resolve();
              },
              isSignedIn: {
                get: () => false,
                listen: (callback) => {
                  if (typeof callback === 'function') {
                    authInstance.isSignedIn.callback = callback;
                  }
                },
              },
            };
          }
          return authInstance;
        },
      };
    });
  });

  // Simple tests first
  it("should display the Google sign-in button initially", () => {
    cy.contains("Sign In with Google").should("be.visible");
  });

  it("should allow user to sign in and load calendars", () => {
    // Simulate clicking "Sign In with Google"
    cy.contains("Sign In with Google").click();
    
    // UI should update with signed-in state
    cy.contains("Sign Out").should("be.visible");
    cy.contains("Select a Calendar:").should("be.visible");
    cy.get("select#calendar-select").should("be.visible");
  });

  it("should load events when a calendar is selected", () => {
    // First sign in
    cy.contains("Sign In with Google").click();
    
    // Then select a calendar
    cy.get("select#calendar-select").should("be.visible").select("cal1");
    
    // Verify events are loaded
    cy.contains("ENGR 391").should("be.visible");
  });

  it("should display an error message if events fail to load", () => {
    // Override the events.list method for this test
    cy.window().then((win) => {
      win.gapi.client.calendar.events.list = () => Promise.reject(new Error("API Error"));
    });

    // Sign in
    cy.contains("Sign In with Google").click();
    
    // Select calendar (which will trigger error)
    cy.get("select#calendar-select").select("cal1");
    
    // Error message should be displayed
    cy.contains("Failed to fetch events").should("be.visible");
  });

  it("should show and close event details modal", () => {
    // Sign in
    cy.contains("Sign In with Google").click();
    
    // Select calendar
    cy.get("select#calendar-select").select("cal1");
    
    // Click on event to open modal
    cy.contains("ENGR 391").click();
    
    // Verify modal contents
    cy.contains("H540").should("be.visible");
    
    // Close modal
    cy.contains("Close").click();
    
    // Event should still be visible in list
    cy.contains("ENGR 391").should("be.visible");
  });

  it("should allow user to sign out", () => {
    // Sign in first
    cy.contains("Sign In with Google").click();
    
    // Verify signed-in state
    cy.contains("Sign Out").should("be.visible");
    
    // Sign out
    cy.contains("Sign Out").click();
    
    // Verify signed-out state
    cy.contains("Sign In with Google").should("be.visible");
  });
});