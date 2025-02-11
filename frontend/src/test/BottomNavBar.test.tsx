import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../App';
import {describe} from 'vitest';
import BottomNavBar from '../Components/BottomNavBar';

describe('Testing Bottom NavBar UI', () => {
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

    it('opens the map menu when the map icon is clicked and shows options' , () => {
        render(
            <MemoryRouter initialEntries={['/directions']}>
                <App />
            </MemoryRouter>
        );
        const mapIcon = screen.getByText(/Map/i);
        fireEvent.click(mapIcon);

        //expect the menu to be visible and display the options
        expect(screen.getByText(/SGW Campus/i)).toBeInTheDocument();
        expect(screen.getByText(/Loyola Campus/i)).toBeInTheDocument();   
    });

    // it('navigates to Loyola Campus when visiting \'/LOYcampus\'', () => {
    //     render(
    //         <MemoryRouter initialEntries={['/LOYcampus']}>
    //             <BottomNavBar />
    //         </MemoryRouter>
    //     );

    //     expect(screen.getByText(/Map: Loyola/i)).toBeInTheDocument();
        
    // });

    // it('navigates to sgw Campus when visiting \'/\'', () => {
    //     render(
    //         <MemoryRouter initialEntries={['/map']}>
    //             <BottomNavBar />
    //         </MemoryRouter>
    //     );

    //     expect(screen.getByText(/Map: SGW/i)).toBeInTheDocument();
        
    // });

}); 