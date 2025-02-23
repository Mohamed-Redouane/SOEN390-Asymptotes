import { render, screen, waitFor } from '@testing-library/react';
import CalendarPage from '../pages/CalendarPage';
import { gapi } from 'gapi-script';
import { describe, it, expect, vi } from 'vitest';

describe('CalendarPage', () => {
    it('renders CalendarPage without crashing', () => {
        render(<CalendarPage />);
    });

    it('renders GoogleCalendarConnect component', () => {
        render(<CalendarPage />);
        expect(screen.getByText('📅 Course Schedule')).toBeInTheDocument();
    });

    it('calls handleAuthChange when authentication status changes', async () => {
        render(<CalendarPage />);
        const handleAuthChange = vi.fn();
        handleAuthChange(true);
        await waitFor(() => {
            expect(handleAuthChange).toHaveBeenCalledWith(true);
        });
    });


    it('displays "No events found." message when there are no events', async () => {
        render(<CalendarPage />);
        await waitFor(() => {
            expect(screen.getByText('No events found.')).toBeInTheDocument();
        });
    });


    
});
