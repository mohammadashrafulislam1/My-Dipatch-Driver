// contexts/ActiveRideContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ActiveRideContext = createContext();

export const useActiveRide = () => {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error("useActiveRide must be used within an ActiveRideProvider");
  }
  return context;
};

export const ActiveRideProvider = ({ children }) => {
  const activeStatuses = ["accepted", "on_the_way", "in_progress", "at_stop"];

  // ✅ Load initial ride safely
  const initialRide = (() => {
    try {
      const saved = localStorage.getItem("activeRide");
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && !activeStatuses.includes(parsed.status)) {
        console.log("🧹 Removing inactive ride on init:", parsed.status);
        localStorage.removeItem("activeRide");
        localStorage.removeItem("rideActive");
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn("Failed parsing activeRide from localStorage", e);
      return null;
    }
  })();

  const [activeRide, setActiveRide] = useState(initialRide);
  const [isActive, setIsActive] = useState(
    !!(initialRide?.status && activeStatuses.includes(initialRide.status))
  );

  // 🧠 Keep localStorage synced and ensure cleanup happens immediately
  useEffect(() => {
    if (activeRide && activeStatuses.includes(activeRide.status)) {
      localStorage.setItem("activeRide", JSON.stringify(activeRide));
      localStorage.setItem("rideActive", "true");
      setIsActive(true);
      console.log("💾 Saved active ride:", activeRide.status);
    } else {
      // 🚨 Cleanup triggered
      console.log("🧹 Cleaning localStorage — inactive or null ride");
      localStorage.removeItem("activeRide");
      localStorage.removeItem("rideActive");
      if (isActive) setIsActive(false);
    }
  }, [activeRide?.status, isActive]); // watch both status + flag

  // ✅ Start new ride
  const startRide = (rideData) => {
    if (rideData && activeStatuses.includes(rideData.status)) {
      setActiveRide(rideData);
      setIsActive(true);
      localStorage.setItem("activeRide", JSON.stringify(rideData));
      localStorage.setItem("rideActive", "true");
      console.log("🟢 Ride started:", rideData.status);
    } else {
      endRide();
    }
  };

  // ✅ End ride completely
  const endRide = () => {
    console.log("⛔ Ride ended manually — clearing localStorage");
    setActiveRide(null);
    setIsActive(false);
    localStorage.removeItem("activeRide");
    localStorage.removeItem("rideActive");
  };

  // ✅ Update ride status and instantly apply cleanup if needed
  const updateRideStatus = (status) => {
    if (!activeRide) return;
    console.log("🔄 Updating ride status to:", status);

    if (activeStatuses.includes(status)) {
      const updatedRide = { ...activeRide, status };
      setActiveRide(updatedRide);
      setIsActive(true);
      localStorage.setItem("activeRide", JSON.stringify(updatedRide));
      localStorage.setItem("rideActive", "true");
      console.log("💾 Active status updated:", status);
    } else {
      // 🚨 Cleanup immediately when ride becomes inactive
      console.log("🧹 Status inactive, clearing storage:", status);
      setActiveRide(null);
      setIsActive(false);
      localStorage.removeItem("activeRide");
      localStorage.removeItem("rideActive");
    }
  };

  // Debug log on every change
  useEffect(() => {
    console.log("🪄 ActiveRideContext state changed:", { activeRide, isActive });
  }, [activeRide, isActive]);

  const value = {
    activeRide,
    isActive,
    startRide,
    endRide,
    updateRideStatus,
    setActiveRide,
    setIsActive,
  };

  return (
    <ActiveRideContext.Provider value={value}>
      {children}
    </ActiveRideContext.Provider>
  );
};
