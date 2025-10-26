// contexts/ActiveRideContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ActiveRideContext = createContext();

export const useActiveRide = () => {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error('useActiveRide must be used within an ActiveRideProvider');
  }
  return context;
};

export const ActiveRideProvider = ({ children }) => {
  // Read localStorage synchronously so initial state is correct on first render
  const initialRide = (() => {
    try {
      const saved = localStorage.getItem('activeRide');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed parsing activeRide from localStorage', e);
      return null;
    }
  })();

  const initialIsActive = (() => {
    const savedStatus = localStorage.getItem('rideActive');
    if (savedStatus !== null) {
      return savedStatus === 'true';
    }
    // If there's a saved ride, infer active from its status
    if (initialRide && initialRide.status && ["accepted", "on_the_way", "in_progress"].includes(initialRide.status)) {
      return true;
    }
    return false;
  })();

  const [activeRide, setActiveRide] = useState(initialRide);
  const [isActive, setIsActive] = useState(initialIsActive);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (activeRide) {
      try {
        localStorage.setItem('activeRide', JSON.stringify(activeRide));
      } catch (e) {
        console.warn('Failed writing activeRide to localStorage', e);
      }
    } else {
      localStorage.removeItem('activeRide');
    }
    try {
      localStorage.setItem('rideActive', isActive.toString());
    } catch (e) {
      console.warn('Failed writing rideActive to localStorage', e);
    }
  }, [activeRide, isActive]);

  // Small debug log to confirm what we loaded (remove in production)
  useEffect(() => {
    console.debug('ActiveRideProvider initialized:', { activeRide, isActive });
  }, []); // run once

  const startRide = (rideData) => {
    setActiveRide(rideData);
    setIsActive(true);
  };

  const endRide = () => {
    setActiveRide(null);
    setIsActive(false);
  };

  const updateRideStatus = (status) => {
    if (activeRide) {
      const updatedRide = { ...activeRide, status };
      setActiveRide(updatedRide);

      if (["accepted", "on_the_way", "in_progress"].includes(status)) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }
  };

  const value = {
    activeRide,
    isActive,
    startRide,
    endRide,
    updateRideStatus,
    setIsActive,
    setActiveRide,
  };

  return (
    <ActiveRideContext.Provider value={value}>
      {children}
    </ActiveRideContext.Provider>
  );
};