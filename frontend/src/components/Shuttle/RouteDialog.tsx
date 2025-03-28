import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { ArrowRight, Clock, Info, MapIcon, MapPin, Route } from "lucide-react"
import type { RouteDialogProps } from "../types"

export const RouteDialog = ({ isOpen, onClose}: RouteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white text-gray-800 border border-gray-200">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Route className="h-5 w-5 text-teal-600" />
            Shuttle Route Information
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            View the route between Loyola and Sir George Williams campuses
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg p-4 border border-gray-200 bg-gray-50">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-800">
                <MapIcon className="h-4 w-4 text-teal-600" />
                Route Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-teal-500 text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Loyola Campus</p>
                    <p className="text-sm text-gray-500">7141 Sherbrooke St W, Montreal</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="h-10 border-l-2 border-dashed border-gray-300"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-orange-500 text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Sir George Williams Campus</p>
                    <p className="text-sm text-gray-500">1455 De Maisonneuve Blvd W, Montreal</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-md text-sm bg-white border border-gray-200">
                <h4 className="font-medium mb-1 text-gray-800">Journey Information</h4>
                <ul className="space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span>Approx. 20-30 minutes travel time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Route className="h-3.5 w-3.5 text-teal-600" />
                    <span>7.5 km distance between campuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-teal-600" />
                    <span>Route may vary based on traffic conditions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-gray-50">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-gray-800">
                <Clock className="h-4 w-4 text-teal-600" />
                Shuttle Schedule Highlights
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-md bg-white border border-gray-200">
                  <h4 className="font-medium text-sm mb-1 text-gray-800">Monday to Thursday</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">First Departure</p>
                      <p className="font-medium text-gray-800">Loyola: 9:15 AM</p>
                      <p className="font-medium text-gray-800">SGW: 9:30 AM</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Departure</p>
                      <p className="font-medium text-gray-800">Loyola: 6:30 PM*</p>
                      <p className="font-medium text-gray-800">SGW: 6:30 PM*</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-white border border-gray-200">
                  <h4 className="font-medium text-sm mb-1 text-gray-800">Friday</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">First Departure</p>
                      <p className="font-medium text-gray-800">Loyola: 9:15 AM</p>
                      <p className="font-medium text-gray-800">SGW: 9:45 AM</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Departure</p>
                      <p className="font-medium text-gray-800">Loyola: 6:15 PM*</p>
                      <p className="font-medium text-gray-800">SGW: 6:15 PM*</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>* Last departure of the day</p>
                  <p>No service on weekends and holidays</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 border border-gray-200 bg-gray-50">
            <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-800">
              <Info className="h-4 w-4 text-teal-600" />
              Important Information
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-600" />
                <p>Shuttle service is free for Concordia students, faculty, and staff with valid ID.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-600" />
                <p>Shuttles depart approximately every 15-30 minutes during peak hours.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-600" />
                <p>Seating is limited and available on a first-come, first-served basis.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-600" />
                <p>Schedule may be adjusted during exam periods, summer sessions, and holidays.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

