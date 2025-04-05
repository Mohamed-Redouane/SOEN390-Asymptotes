import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react';
import { FaRoute, FaClock, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CircularProgress from '@mui/material/CircularProgress';
import OpenAI from 'openai';
import { Link } from 'react-router-dom';

interface SmartPlannerProps {
    isOpen: boolean;
    onClose: () => void;
    events: any[];
    currentPosition?: { lat: number; lng: number } | null;
}

interface PlanItem {
    time: string;
    activity: string;
    location?: string;
    directions?: string;
}

interface Plan {
    summary: string;
    items: PlanItem[];
}

const itemsPerPage = 4; // Number of events to display per page

const SmartPlanner: React.FC<SmartPlannerProps> = ({
    isOpen,
    onClose,
    events,
    currentPosition
}) => {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Initialize OpenAI client (TEMPORARY, MUST CHANGE)
    const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY, // MUST CHANGE, EXTREMELY UNSAFE!
        dangerouslyAllowBrowser: true // MUST CHANGE 
    });

    const generatePlan = async () => {
        setIsLoading(true);
        setError(null);
        console.log("Today's events:");
        try {
            // Sort events by start time
            // Get current date and time
            const now = new Date();
            const currentHour = now.getHours();
            const currentDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Filter events to only today's events (and after current hour)
            const todaysEvents = events.filter(event => {
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const eventDateString = eventStart.toISOString().split('T')[0];
                
                // Check if event is today
                if (eventDateString !== currentDateString) return false;
                
                // For all-day events, keep them
                if (!event.start.dateTime) return true;
                
                // For timed events, check if they're after current hour
                const eventHour = eventStart.getHours();
                return eventHour >= currentHour;
            });

                        
            if (todaysEvents.length === 0) {
                setError("No events scheduled for today.");
                return;
            }
    

            const sortedEvents = [...todaysEvents].sort((a, b) => {
                const aStart = new Date(a.start.dateTime || a.start.date);
                const bStart = new Date(b.start.dateTime || b.start.date);
                return aStart.getTime() - bStart.getTime();
            });
    
            // Prepare data for the OpenAI API
            const eventsData = sortedEvents.map(event => ({
                summary: event.summary,
                location: event.location || "No location specified",
                startTime: event.start.dateTime
                    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "All day",
                endTime: event.end.dateTime
                    ? new Date(event.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "All day"
            }));

            // Create a prompt for the OpenAI model
            const prompt = `
              I have the following events scheduled for today:
              ${eventsData.map((event, index) => `
                Event ${index + 1}: ${event.summary}
                Location: ${event.location}
                Time: ${event.startTime} - ${event.endTime}
              `).join('\n')}
              ${currentPosition ? `My current location is: Latitude ${currentPosition.lat}, Longitude ${currentPosition.lng}` : ''}
    
              Please create an optimized plan for my day that:
              1. Suggests the most efficient order to attend these events
              2. Includes estimated travel times between locations
              3. Recommends the best mode of transportation for each journey (walking, public transit, or driving)
              4. Suggests optimal departure times to arrive 10 minutes early to each event
              5. Indicates if there are any scheduling conflicts or tight transitions
    
              Format the response as a JSON object with this structure:
              {
                "summary": "Brief overall summary of the plan",
                "items": [
                  {
                    "time": "Time of activity",
                    "activity": "Description of the activity (event or travel)",
                    "location": "Location, keep the exact name of the location given in the events",
                    "directions": "Transportation instructions, if this is a travel segment"
                  }
                ]
              }
            `;
    
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant that creates efficient daily plans and optimized routes between events." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });
    
            const content = completion.choices[0].message.content;
    
            if (!content) {
                throw new Error('OpenAI returned an empty response');
            }
    
            const result = JSON.parse(content) as Plan;
            setPlan(result);
        } catch (err: any) {
            console.error('Error generating plan:', err);
            setError(`Failed to generate plan. Please try again.  Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && events.length > 0) {
            generatePlan();
        }
    }, [isOpen, events]);

    const totalPages = plan ? Math.ceil(plan.items.length / itemsPerPage) : 0;

    const currentItems = plan
        ? plan.items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
        : [];

    const goToPreviousPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        setCurrentPage(currentPage + 1);
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <div className="fixed inset-0 bg-black bg-opacity-30" />
                <div className="fixed inset-0 flex items-center justify-center p-4  data-cy='generated-modal'">
                    <DialogPanel className="max-w-sm w-full bg-white rounded-xl shadow-xl p-6 flex flex-col">
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                            📝 Generated Plan
                        </DialogTitle>

                        {isLoading ? (
                            <div className="my-4 flex justify-center items-center">
                                <CircularProgress size={24} />
                                <p className="ml-2 text-gray-600 text-sm">Generating plan...</p>
                            </div>
                        ) : error ? (
                            <div className="my-2 p-3 bg-red-50 text-red-600 rounded-md text-sm  data-cy='error-message-modal'">
                                
                                {error}
                            </div>
                        ) : plan ? (
                            <div className="mt-4 flex-grow flex flex-col">
                                <div className="p-3 bg-blue-50 rounded-md">
                                    <h3 className="font-semibold text-blue-800 text-sm">
                                        Today's Plan
                                    </h3>
                                    <p className="text-blue-700 text-xs mt-1">{plan.summary}</p>
                                </div>

                                <div className="space-y-2 mt-3 overflow-y-auto">
                                    {currentItems &&
                                        currentItems.map((item: PlanItem, index: number) => (
                                            <div
                                                key={index}
                                                className="space-y-1" // Group items vertically
                                            >
                                                <div className="flex items-center">
                                                    <FaClock className="mr-2 text-blue-400" size={12} />
                                                    <span className="text-gray-900 font-medium text-xs">
                                                        {item.time}
                                                    </span>
                                                </div>
                                                <div className="pl-6"> {/* Indent content */}
                                                    <div className="text-gray-800 text-sm">{item.activity}</div>
                                                    {item.location && (
                                                        <div className="flex items-center text-gray-600 text-xs mt-1">
                                                            <FaMapMarkerAlt className="mr-1" size={10} />
                                                           
                                                            {/* Make the item location a link */}
                                                            <Link
                                                                to="/directions"
                                                                state={{
                                                                    eventName: plan.summary,
                                                                    destination: item.location,
                                                                    isFromSchedule: false
                                                                }}
>

                                                            {item.location} {/* Location name */} 
                
                                                            </Link>
                                                        </div>
                                                    )}
                                                    {item.directions && (
                                                        <div className="flex items-start text-gray-600 text-xs mt-1">
                                                            <FaRoute className="mr-1" size={10} />
                                                            <div>{item.directions}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 0}
                                        className="bg-gray-100 text-gray-700 rounded-md py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-gray-600 text-xs">
                                        Page {currentPage + 1} of {totalPages}
                                    </span>
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages - 1}
                                        className="bg-gray-100 text-gray-700 rounded-md py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 my-4 text-sm">
                                No events to plan.
                            </p>
                        )}

                        <div className="mt-4 flex gap-2">
                            <button
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md text-sm hover:bg-gray-300 transition duration-200"
                                onClick={onClose}
                                data-cy="close-smart-planner-button"  // Preferred for Cypress
                            >
                                Close
                            </button>
                            {!isLoading && (
                                <button
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-md text-sm hover:bg-blue-600 transition duration-200"
                                    onClick={generatePlan}
                                    disabled={isLoading}
                                    data-cy="regenerate-smart-planner-button"  // Preferred for Cypress
                                >
                                    Regenerate
                                </button>
                            )}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SmartPlanner;