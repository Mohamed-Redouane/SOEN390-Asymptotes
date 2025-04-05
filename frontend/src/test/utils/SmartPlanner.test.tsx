import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SmartPlanner from '../../components/SmartPlanner';
import { BrowserRouter } from 'react-router-dom';
/**
 * Not a test for a util file, but for a component. 
 * I put it here because it's a heavier operation than usual. 
 * The optional feature also needs its own unit tests. 
 */

// Simple mock for OpenAI
vi.mock('openai', () => {
    return {
      default: function () {
        return {
          chat: {
            completions: {
              create: () =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({
                      choices: [
                        {
                          message: {
                            content: JSON.stringify({
                              summary: 'Your optimized schedule for today',
                              items: [
                                {
                                  time: '10:00 AM - 11:00 AM',
                                  activity: 'Math Class',
                                  location: 'Room 101'
                                },
                                {
                                  time: '12:00 PM',
                                  activity: 'Lunch Break',
                                  location: 'Campus Cafe'
                                }
                              ]
                            })
                          }
                        }
                      ]
                    });
                  }, 1000); // NOTE: delay to simulate loading
                })
            }
          }
        };
      }
    };
  });
  
    // Simple mock for react-router-dom Link component with proper types
    vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>
    };
  });
  
  // Simple mock for env variables
  vi.mock('import.meta.env', () => ({
    VITE_OPENAI_API_KEY: 'test-key'
  }));
  
  describe('SmartPlanner Component Basic Tests', () => {
    // Test events scheduled for today
    const today = new Date();
    const mockEvents = [
      {
        id: '1',
        summary: 'Math Class',
        location: 'Room 101',
        start: {
          dateTime: new Date(today.setHours(10, 0, 0)).toISOString()
        },
        end: {
          dateTime: new Date(today.setHours(11, 0, 0)).toISOString()
        }
      }
    ];
  
    const mockPosition = { lat: 37.7749, lng: -122.4194 };
  
    beforeEach(() => {
      vi.clearAllMocks();
    });
  
    it('renders properly when opened', () => {
      render(
        <BrowserRouter>
          <SmartPlanner 
            isOpen={true} 
            onClose={() => {}} 
            events={mockEvents} 
            currentPosition={mockPosition} 
          />
        </BrowserRouter>
      );
  
      expect(screen.getByText('📝 Generated Plan')).toBeInTheDocument();
    });
    

  
    it('calls onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      render(
        <BrowserRouter>
          <SmartPlanner 
            isOpen={true} 
            onClose={mockOnClose} 
            events={mockEvents}
            currentPosition={mockPosition}
          />
        </BrowserRouter>
      );
  
      fireEvent.click(screen.getByText('Close'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  
    it('does not render when isOpen is false', () => {
      render(
        <BrowserRouter>
          <SmartPlanner 
            isOpen={false} 
            onClose={() => {}} 
            events={mockEvents}
            currentPosition={mockPosition}
          />
        </BrowserRouter>
      );
  
      expect(screen.queryByText('📝 Generated Plan')).not.toBeInTheDocument();
    });
  
    it('shows appropriate message when there are no events', () => {
      render(
        <BrowserRouter>
          <SmartPlanner 
            isOpen={true} 
            onClose={() => {}} 
            events={[]}
            currentPosition={mockPosition}
          />
        </BrowserRouter>
      );
  
      
      expect(screen.getByText('No events to plan.')).toBeInTheDocument();
    });
  });

  describe('SmartPlanner Component', () => {
    it('calls onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      render(
        <BrowserRouter>
          <SmartPlanner
            isOpen={true}
            onClose={mockOnClose}
            events={[]} // Events arent relevant for this test
            currentPosition={null} // Position null for this test
          />
        </BrowserRouter>
      );
  
      // Find the close button by its text
      const closeButton = screen.getByText('Close');
  
      // Do click event
      fireEvent.click(closeButton);
  
      // Assert onClose function called
      expect(mockOnClose).toHaveBeenCalled();
    });
  });