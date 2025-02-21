import React from "react";
import Cookies from "js-cookie";

const GoogleCalendarConnect = () => {
  const handleConnect = () => {
    Cookies.set("access_token", "mock_token", { path: "/" });
    window.location.reload(); 
  };

  return (
    <div className="text-center">
      <button
        onClick={handleConnect}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Connect Google Calendar
      </button>
    </div>
  );
};
export default GoogleCalendarConnect;