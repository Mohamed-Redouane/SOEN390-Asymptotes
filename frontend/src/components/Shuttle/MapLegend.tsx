export const MapLegend = () => {
    return (
      <div className="widget absolute bottom-3 right-3 z-[1000] backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 text-xs">
        <div className="font-medium mb-2">Legend</div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-[#26a69a]"></div>
          <span>Loyola Campus</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 rounded-full bg-[#fb8c00]"></div>
          <span>SGW Campus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8bc34a] animate-pulse"></div>
          <span>Active Shuttle</span>
        </div>
      </div>
    )
  }
  
  