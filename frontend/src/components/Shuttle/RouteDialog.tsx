import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { ArrowRight, Clock, Info, MapIcon, MapPin, Route } from "lucide-react"
import type { RouteDialogProps } from "../types"

export const RouteDialog = ({ isOpen, onClose}: RouteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-gray-200">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Route className="h-5 w-5 text-teal-500" />
            Shuttle Route Information
          </DialogTitle>
          <DialogDescription>
            View the route between Loyola and Sir George Williams campuses
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg p-4 border border-gray-200 bg-gray-50 dark:bg-background">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-teal-500" />
                Route Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-teal-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Loyola Campus</p>
                    <p className="text-sm">7141 Sherbrooke St W, Montreal</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="h-10 border-l-2 border-dashed border-gray-300"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-orange-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Sir George Williams Campus</p>
                    <p className="text-sm">1455 De Maisonneuve Blvd W, Montreal</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-md text-sm border border-gray-200">
                <h4 className="font-medium mb-1">Journey Information</h4>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-teal-500" />
                    <span>Approx. 20-30 minutes travel time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Route className="h-3.5 w-3.5 text-teal-500" />
                    <span>7.5 km distance between campuses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-teal-500" />
                    <span>Route may vary based on traffic conditions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-gray-50 dark:bg-background">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-500" />
                Shuttle Schedule Highlights
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-md border border-gray-200">
                  <h4 className="font-medium text-sm mb-1">Monday to Thursday</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs">First Departure</p>
                      <p className="font-medium">Loyola: 9:15 AM</p>
                      <p className="font-medium">SGW: 9:30 AM</p>
                    </div>
                    <div>
                      <p className="text-xs">Last Departure</p>
                      <p className="font-medium">Loyola: 6:30 PM*</p>
                      <p className="font-medium">SGW: 6:30 PM*</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-md border border-gray-200">
                  <h4 className="font-medium text-sm mb-1">Friday</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs">First Departure</p>
                      <p className="font-medium">Loyola: 9:15 AM</p>
                      <p className="font-medium">SGW: 9:45 AM</p>
                    </div>
                    <div>
                      <p className="text-xs">Last Departure</p>
                      <p className="font-medium">Loyola: 6:15 PM*</p>
                      <p className="font-medium">SGW: 6:15 PM*</p>
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <p>* Last departure of the day</p>
                  <p>No service on weekends and holidays</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 border border-gray-200 bg-gray-50 dark:bg-background">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Info className="h-4 w-4 text-teal-500" />
              Important Information
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-500" />
                <p>Shuttle service is free for Concordia students, faculty, and staff with valid ID.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-500" />
                <p>Shuttles depart approximately every 15-30 minutes during peak hours.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-500" />
                <p>Seating is limited and available on a first-come, first-served basis.</p>
              </div>
              <div className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-teal-500" />
                <p>Schedule may be adjusted during exam periods, summer sessions, and holidays.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

