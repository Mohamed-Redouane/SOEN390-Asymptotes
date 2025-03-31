export const MapLegend = () => {
    return (
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="font-medium mb-2 text-gray-800">Legend</div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-[#26a69a]"></div>
          <span className="text-gray-700">Loyola Campus</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-[#fb8c00]"></div>
          <span className="text-gray-700">SGW Campus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8bc34a] animate-pulse"></div>
          <span className="text-gray-700">Active Shuttle</span>
        </div>
      </div>
    )
  }
  
  