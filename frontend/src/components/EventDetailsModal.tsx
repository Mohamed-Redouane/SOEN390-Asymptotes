import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { FaClock, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: any;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, selectedEvent }) => {
  const navigate = useNavigate();
  const locationName = selectedEvent?.location;
  
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="max-w-md w-full bg-white rounded-xl shadow-xl p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              {selectedEvent?.summary} 
            </Dialog.Title>
            <div className="mt-4 space-y-3 text-gray-700">
              <div className="flex items-center">
                <FaClock className="mr-2" />
                <span>
                  <strong>Time:</strong>{" "}
                  {selectedEvent?.start?.dateTime
                    ? `${new Date(selectedEvent.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedEvent.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "All Day"}
                </span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                <span>
                  <strong>Location:</strong> {locationName || "No location"}
                </span>
              </div>
              <div className="flex items-start">
                <FaInfoCircle className="mr-2 mt-1" />
                <span>
                  <strong>Description:</strong>{" "}
                  {selectedEvent?.description || "No description available"}
                </span>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              onClick={() => navigate('/directions',
                { state: {eventName: selectedEvent?.summary , destination: locationName, isFromSchedule: true } })}
            >
              Get Directions
            </button>
            <button
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              onClick={onClose}
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EventDetailsModal;