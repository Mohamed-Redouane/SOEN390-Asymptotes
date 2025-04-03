"use client"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Layers, Locate, Minus, Plus } from "lucide-react"
import type { MapControlsProps } from "../types"

export const MapControls = ({ onZoomIn, onZoomOut, onMyLocation, onMapTypeChange }: MapControlsProps) => {
  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
      <div className="backdrop-blur-sm p-1.5 rounded-lg shadow-md border border-gray-200 flex flex-col gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-transparent text-gray-700"
                onClick={onZoomIn}
              >
                <span className="sr-only">Zoom In</span>
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-transparent text-gray-700"
                onClick={onZoomOut}
              >
                <span className="sr-only">Zoom Out</span>
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator className="my-0.5 bg-gray-200" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md bg-transparent hover:bg-secondary text-gray-700"
                  >
                    <span className="sr-only">Map Type</span>
                    <Layers className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuItem onClick={() => onMapTypeChange("streets")}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-gray-200 border border-gray-300"></div>
                      <span>Standard</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMapTypeChange("satellite")}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-gray-600 border border-gray-500"></div>
                      <span>Satellite</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMapTypeChange("hybrid")}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-blue-900 border border-blue-800"></div>
                      <span>Hybrid</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMapTypeChange("terrain")}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm bg-green-200 border border-green-300"></div>
                      <span>Terrain</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Map Type</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md bg-transparent text-gray-700"
                onClick={onMyLocation}
              >
                <span className="sr-only">My Location</span>
                <Locate className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>My Location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

