import React from 'react';

interface CalendarSelectorProps {
  calendars: any[];
  selectedCalendarId: string | null;
  onSelectCalendar: (calendarId: string) => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ calendars, selectedCalendarId, onSelectCalendar }) => {
  return (
    <div className="mb-6 text-center">
      <label htmlFor="calendar-select" className="block text-lg font-semibold mb-2">
        Select a Calendar:
      </label>
      <select
        id="calendar-select"
        className="px-4 py-2 border rounded-lg shadow-sm"
        value={selectedCalendarId || ''}
        onChange={(e) => onSelectCalendar(e.target.value)}
      >
        {calendars.map((calendar) => (
          <option key={calendar.id} value={calendar.id}>
        {calendar.summary}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CalendarSelector;