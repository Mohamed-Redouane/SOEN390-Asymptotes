describe("Google Calendar Component", () => {
  let authInstance;

  // Helper function to calculate the next Thursday at 10:00 AM
  const getNextThursdayAt10AM = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilNextThursday = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7; // 4 = Thursday
    const nextThursday = new Date(now);
    nextThursday.setDate(now.getDate() + daysUntilNextThursday);
    nextThursday.setHours(10, 0, 0, 0); // Set time to 10:00 AM
    return nextThursday.toISOString();
  };

  beforeEach(() => {
    authInstance = null;

    cy.intercept("GET", "/api/auth/me", {
      statusCode: 200,
      body: { user: { id: "test-user", email: "test@example.com" } },
    }).as("getCurrentUser");

    cy.visit("http://localhost:5173/schedule", {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, "watchPosition").callsFake((success) => {
          // Simulate being on campus
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

    // Stub Google API globally
    cy.window().then((win) => {
      if (!win.gapi) {
        win.gapi = {};
      }

      // Stub gapi.load
      win.gapi.load = (modules, callback) => callback();

      // Stub gapi.client.init and calendar methods
      win.gapi.client = {
        init: cy.stub().resolves(),
        calendar: {
          calendarList: {
            list: cy.stub().resolves({
              result: {
                items: [
                  { id: "cal1", summary: "Work Calendar" },
                  { id: "cal2", summary: "Personal Calendar" },
                ],
              },
            }),
          },
          events: {
            list: cy.stub().resolves({
              result: {
                items: [
                  {
                    id: "event-1",
                    summary: "ENGR 391",
                    start: { dateTime: getNextThursdayAt10AM() }, // Use dynamic date
                    end: { dateTime: new Date(new Date(getNextThursdayAt10AM()).getTime() + 60 * 60 * 1000).toISOString() }, // 1 hour later
                    location: "H540",
                    description: "lecture.",
                  },
                ],
              },
            }),
          },
        },
      };

      // Stub gapi.auth2
      win.gapi.auth2 = {
        getAuthInstance: () => {
          if (!authInstance) {
            authInstance = {
              signIn: cy.stub().resolves(),
              signOut: cy.stub().resolves(),
              isSignedIn: {
                get: cy.stub().returns(false),
                listen: cy.stub().callsFake((callback) => {
                  authInstance.isSignedIn.callback = callback;
                }),
              },
            };
          }
          return authInstance;
        },
      };
    });
  });

  afterEach(() => {
    // Restore all stubs after each test to avoid "already stubbed" errors
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();
      if (auth.signIn.restore) auth.signIn.restore();
      if (auth.signOut.restore) auth.signOut.restore();

      if (win.gapi.client.calendar.events.list.restore) {
        win.gapi.client.calendar.events.list.restore();
      }
    });
  });

  it("should display the Google sign-in button initially", () => {
    cy.contains("Sign In with Google").should("be.visible");
  });

  it("should allow user to sign in and load calendars", () => {
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();

      // Simulate successful sign-in
      auth.signIn.callsFake(() => {
        auth.isSignedIn.get = cy.stub().returns(true);
        if (auth.isSignedIn.callback) {
          auth.isSignedIn.callback(true);
        }
        return Promise.resolve();
      });

      // Simulate clicking "Sign In with Google"
      cy.intercept("POST", "/api/auth/google", {
        statusCode: 200,
        body: { token: "fake-token", user: { email: "test@example.com" } },
      }).as("googleAuth");
      cy.contains("Sign In with Google").click();

      // Verify UI updates
      cy.contains("Sign Out").should("be.visible");
      cy.contains("Select a Calendar:").should("be.visible");
      cy.get("select#calendar-select").should("be.visible").select("cal1");
    });
  });

  it("should load events when a calendar is selected", () => {
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();

      // Simulate signed-in state
      auth.isSignedIn.get = cy.stub().returns(true);
      if (auth.isSignedIn.callback) {
        auth.isSignedIn.callback(true);
      }

      // Log the dynamically calculated date
      const eventStart = getNextThursdayAt10AM();
      const eventEnd = new Date(new Date(eventStart).getTime() + 60 * 60 * 1000).toISOString();
      cy.log(`Mocked event start: ${eventStart}`);
      cy.log(`Mocked event end: ${eventEnd}`);

      // Mock event fetching from Google Calendar API
      win.gapi.client.calendar.events.list.resolves({
        result: {
          items: [
            {
              id: "event-1",
              summary: "ENGR 391",
              start: { dateTime: eventStart },
              end: { dateTime: eventEnd },
              location: "H540",
              description: "lecture.",
            },
          ],
        },
      });
    });

    // Select calendar and verify events
    cy.get("select#calendar-select").should("be.visible").select("cal1");
    cy.contains("ENGR 391").should("be.visible");
  });

  it("should display an error message if events fail to load", () => {
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();

      // Simulate signed-in state
      auth.isSignedIn.get = cy.stub().returns(true);
      if (auth.isSignedIn.callback) {
        auth.isSignedIn.callback(true);
      }

      // Simulate API failure
      win.gapi.client.calendar.events.list.rejects(new Error("API Error"));
    });

    cy.get("select#calendar-select").select("cal1");
    cy.contains("Failed to fetch events. Please check your connection and try again.").should("be.visible");
  });

  it("should show and close event details modal", () => {
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();

      // Simulate signed-in state
      auth.isSignedIn.get = cy.stub().returns(true);
      if (auth.isSignedIn.callback) {
        auth.isSignedIn.callback(true);
      }

      // Mock event fetching from Calendar API
      win.gapi.client.calendar.events.list.resolves({
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
      });
    });

    cy.get("select#calendar-select").select("cal1");
    cy.contains("ENGR 391").click();
    cy.contains("ENGR 391").should("be.visible");
    cy.contains("H540").should("be.visible");

    cy.contains("Close").click();
    cy.contains("ENGR 391").should("be.visible");
  });

  it("should allow user to sign out", () => {
    cy.window().then((win) => {
      const auth = win.gapi.auth2.getAuthInstance();

      // Simulate signed-in state
      auth.isSignedIn.get = cy.stub().returns(true);
      if (auth.isSignedIn.callback) {
        auth.isSignedIn.callback(true);
      }

      // Simulate successful sign-out
      auth.signOut.callsFake(() => {
        auth.isSignedIn.get = cy.stub().returns(false);
        if (auth.isSignedIn.callback) {
          auth.isSignedIn.callback(false);
        }
        return Promise.resolve();
      });
    });
    cy.contains("Sign Out").click();
    cy.contains("Sign In with Google").should("be.visible");
  });
});