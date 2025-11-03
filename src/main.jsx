// main.jsx - UPDATED
// Check saved preference first
const savedTheme = localStorage.getItem("theme");
const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
const root = document.documentElement;

if (savedTheme === "dark" || (!savedTheme && prefersDarkMode)) {
  root.classList.add("dark");
  root.setAttribute("data-theme", "dark");
} else {
  root.classList.remove("dark");
  root.setAttribute("data-theme", "light");
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router/router.jsx';
import AuthProvider from './Router/AuthProvider.jsx';
import { ActiveRideProvider } from './contexts/ActiveRideContext.jsx';
import GlobalRideStatus from './Components/GlobalRideStatus';

// Create a wrapper component that includes the global status
const AppWrapper = ({ children }) => {
  return (
    <div className="app-container relative">
      <GlobalRideStatus />
      {children}
    </div>
  );
};
document.body.setAttribute("data-page", window.location.pathname);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ActiveRideProvider>
        <AppWrapper>
          <RouterProvider router={router} />
        </AppWrapper>
      </ActiveRideProvider>
    </AuthProvider> 
  </StrictMode>,
);