import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarSelector from '../Components/CalendarSelector';
import { describe, it, expect, vi } from 'vitest';

describe('CalendarSelector Component', () => {
    const mockCalendars = [
        { id: '1', summary: 'Work Calendar' },
        { id: '2', summary: 'Personal Calendar' },
    ];
    const mockOnSelectCalendar = vi.fn();

    test('renders correctly with given calendars', () => {
        render(<CalendarSelector calendars={mockCalendars} selectedCalendarId={null} onSelectCalendar={mockOnSelectCalendar} />);
        
        expect(screen.getByText('Select a Calendar:')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('Work Calendar')).toBeInTheDocument();
        expect(screen.getByText('Personal Calendar')).toBeInTheDocument();
    });

    test('selecting a calendar triggers onSelectCalendar', () => {
        render(<CalendarSelector calendars={mockCalendars} selectedCalendarId={null} onSelectCalendar={mockOnSelectCalendar} />);
        
        const selectElement = screen.getByRole('combobox');
        fireEvent.change(selectElement, { target: { value: '2' } });
        
        expect(mockOnSelectCalendar).toHaveBeenCalledWith('2');
    });

    test('displays the selected calendar correctly', () => {
        render(<CalendarSelector calendars={mockCalendars} selectedCalendarId={'1'} onSelectCalendar={mockOnSelectCalendar} />);
        
        expect(screen.getByRole('combobox')).toHaveValue('1');
    });
});
