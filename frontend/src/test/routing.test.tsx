// src/__tests__/App.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../App';
import {describe, vi} from 'vitest';


describe('App Routing', () => {
  it('renders bottom navbar elements', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Map/i)).toBeInTheDocument();
    expect(screen.getByText(/Directions/i)).toBeInTheDocument();
    expect(screen.getByText(/Shuttle/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule/i)).toBeInTheDocument(); 
  });

  it('navigates to Loyola Campus when visiting /LOYcampus', () => {
    render(
      <MemoryRouter initialEntries={['/LOYcampus']}>
        <App />
      </MemoryRouter>
    );
  });

  it('shows a 404 page for un-implemented route (schedule)', () => {
    render(
      <MemoryRouter initialEntries={['/schedule']}>
        <App />
      </MemoryRouter>
    ) 
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });

  it('shows a 404 page for un-implemented route (shuttle)', () => {
    render(
      <MemoryRouter initialEntries={['/shuttle']}>
        <App />
      </MemoryRouter>
    ) 
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });

  it('shows a 404 page for un-implemented route (directions)', () => {
    render(
      <MemoryRouter initialEntries={['/directions']}>
        <App />
      </MemoryRouter>
    ) 
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
  });
});
