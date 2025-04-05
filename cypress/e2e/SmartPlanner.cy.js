describe("Smart Planner", () => {
  const getToday2HoursBefore = () => {
    const now = new Date();
    now.setHours(now.getHours() - 2);
    now.setMinutes(0, 0, 0);
    return now.toISOString();
  };

  let authInstance;
  beforeEach(() => {
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

    // Initialize gapi
    cy.window().then((win) => {
      if (!win.gapi) {
        win.gapi = {};
      }
      win.gapi.load = (apis, callback) => {
        if (typeof callback === "function") {
          setTimeout(callback, 10);
        }
      };
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
                    start: { dateTime: getToday2HoursBefore() },
                    end: { dateTime: new Date(new Date(getToday2HoursBefore()).getTime() + 60 * 60 * 1000).toISOString() },
                    location: "H540",
                    description: "lecture.",
                  },
                ],
              },
            }),
          },
        },
      };
      win.gapi.auth2 = {
        init: () => Promise.resolve(),
        getAuthInstance: () => {
          if (!authInstance) {
            authInstance = {
              signIn: () => {
                authInstance.isSignedIn.get = () => true;
                if (typeof authInstance.isSignedIn.callback === "function") {
                  authInstance.isSignedIn.callback(true);
                }
                return Promise.resolve();
              },
              signOut: () => {
                authInstance.isSignedIn.get = () => false;
                if (typeof authInstance.isSignedIn.callback === "function") {
                  authInstance.isSignedIn.callback(false);
                }
                return Promise.resolve();
              },
              isSignedIn: {
                get: () => false,
                listen: (callback) => {
                  if (typeof callback === "function") {
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

  it("should show no events when there are no active events", () => {
    // Sign in
    cy.contains("Sign In with Google").click();
    cy.get("select#calendar-select").should("be.visible").select("cal1");

    cy.get('[data-cy="smart-planner-button"]').click({ force: true });
    cy.wait(1000);
    cy.contains("No events scheduled for today").should("be.visible");
    cy.get('[data-cy="close-smart-planner-button"]').click();
  });

  it("should visit the schedule page and click the Smart Planner button, then close", () => {
    // Sign in
    cy.contains("Sign In with Google").click();
    cy.get("select#calendar-select").should("be.visible").select("cal1");

    // Check if the Smart Planner button is visible
    cy.get('[data-cy="smart-planner-button"]').should("be.visible");

    // Click the Smart Planner button
    cy.get('[data-cy="smart-planner-button"]').click();

    
    // Verify that the close button is displayed and click it
    cy.get('[data-cy="close-smart-planner-button"]').should("be.visible").click();
  });

  it("should visit the schedule page and click the Smart Planner button, then regenerate", () => {
    // Sign in
    cy.contains("Sign In with Google").click();
    cy.get("select#calendar-select").should("be.visible").select("cal1");

    // Check if the Smart Planner button is visible
    cy.get('[data-cy="smart-planner-button"]').should("be.visible");

    // Click the Smart Planner button
    cy.get('[data-cy="smart-planner-button"]').click();

    
    // Verify that the regenerate button is displayed and click it
    cy.get('[data-cy="regenerate-smart-planner-button"]').should("be.visible").click();
  });
});