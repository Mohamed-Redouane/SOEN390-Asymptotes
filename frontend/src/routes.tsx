// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { requireAuthLoader, requireNotAuthLoader } from './loaders/authLoader';

import CampusMap from './pages/Campus';
import CalendarPage from './pages/CalendarPage';
import WelcomePage from './pages/WelcomePage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { RequestPasswordResetPage } from './pages/Auth/RequestPasswordResetPage';
import { ResetPasswordPage } from './pages/Auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/Auth/VerifyEmailPage';
import IndoorDirections from './pages/IndoorDirections';
import Directions from './pages/Directions';
import ConcordiaSchedule from './pages/Shuttle';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/map",
        loader: requireAuthLoader,
        element: (
          <div style={{ height: '86vh', width: '100vw' }}>
            <CampusMap />
          </div>
        ),
      },
      {
        path: "/shuttle",
        loader: requireAuthLoader,
        element: (
          <div style={{ height: '86vh', width: '100vw' }}>
            <ConcordiaSchedule/>
          </div>
        ),
      },
      {
        path: "/directions",
        loader: requireAuthLoader,
        element: (
          <div style={{ height: '86vh', width: '100vw' }}>
            <Directions />
          </div>
        ),
      },
      {
        path: "/indoordirections",
        loader: requireAuthLoader,
        element: (
          <div style={{ height: '86vh', width: '100vw' }}>
            <IndoorDirections />
          </div>
        ),
      },
      {
        path: "/schedule",
        loader: requireAuthLoader,
        element: (
          <div style={{ height: '86vh', width: '100vw' }}>
            <CalendarPage />
          </div>
        ),
      },
      // The welcome page route now checks if the user is not authenticated.
      {
        path: "/",
        loader: requireNotAuthLoader,
        element: <WelcomePage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <RequestPasswordResetPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
    ],
  },
]);
