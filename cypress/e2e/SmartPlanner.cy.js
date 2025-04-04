describe("Smart Planner", () => {

    // We will have two tests:
    // -One testing what if the user is connected to google calendar but has no active events that day
    // -another testing if the user is connected to google calendar and has active events that day, in here we will check if the events are generated correctly and test if we can navigate to the event location
   
    const getToday2HoursBefore = () => {
        const now = new Date();

        // Add 2 hours to the current time
        now.setHours(now.getHours() - 2);
        now.setMinutes(0, 0, 0); // Set minutes and seconds to 0 for consistency
        return now.toISOString();
      };

    const getToday2HoursFromNow = () => {
        const now = new Date();

        // Add 2 hours to the current time
        now.setHours(now.getHours() + 2);
        now.setMinutes(0, 0, 0); // Set minutes and seconds to 0 for consistency
        return now.toISOString();
      };
   



    // This takes care of the connecting to the callendar
    let authInstance; 
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


    //First test if the user is connected to google calendar but has no active events that day
    it("should show no events when there are no active events", () => {
              // Sign in
        cy.contains("Sign In with Google").click();
        // Then select a calendar
        cy.get("select#calendar-select").should("be.visible").select("cal1");
 
        
        cy.get('[data-cy="smart-planner-button"]').click({force: true});
        // Wait a bit for the modal to open
        cy.wait(1000);
        // Check that the modal contains the text "No events found"
        cy.contains("No events scheduled for today").should("be.visible");

        // Close the modal
        cy.get('[data-cy="close-smart-planner-button"]').click();
        
    });


    // First check that the modal is opened after clicking the button 
    // (The button has the text "Smart Planner")
    // The modal has the title "Generated Plan"
    it("should generate plan when there is future events", () => {
       
        // Mock the new event to be added
        cy.window().then((win) => {
            // Add mock implementation for events.insert
            win.gapi.client.calendar.events.insert = ({ calendarId, resource }) => {
              return Promise.resolve({
                result: {
                  ...resource,
                  id: "newly-added-event-123",
                  status: "confirmed",
                  htmlLink: "https://calendar.google.com/event?eid=new123"
                }
              });
            };
      
            // Mock the updated events list that includes our new event
            win.gapi.client.calendar.events.list = () => Promise.resolve({
              result: {
                items: [
                  {
                    id: "newly-added-event-123",
                    summary: "Added Test Event",
                    start: { dateTime: getToday2HoursBefore() },
                    end: { dateTime: new Date(new Date(getToday2HoursBefore()).getTime() + 60 * 60 * 1000).toISOString() },
                    location: "Test Location",
                    description: "This event was added for testing"
                  },
                  // Keep the original event too
                  {
                    id: "event-1",
                    summary: "ENGR 391",
                    start: { dateTime: getToday2HoursFromNow() },
                    end: { dateTime: new Date(new Date(getToday2HoursFromNow()).getTime() + 60 * 60 * 1000).toISOString() },
                    location: "H540",
                    description: "lecture."
                  }
                ]
              }
            });
          });
        
        cy.contains("Sign In with Google").click();
        cy.get("select#calendar-select").should("be.visible").select("cal1");
        cy.get('[data-cy="smart-planner-button"]').click({force: true});
        // Wait a bit for the modal to open
        cy.wait(1000);

        // Check that the modal contains the text "Generated Plan"
        cy.contains("Generated Plan").should("be.visible");
        // Check that the modal contains the text "Added Test Event"

        // Check that the modal is loading the plan
        cy.contains("Generating plan...").should("be.visible");

        // Check that it contains "Today's Plan"
        cy.contains("Today's Plan").should("be.visible");

        // Close the modal
        cy.get('[data-cy="close-smart-planner-button"]').click();
    });
});