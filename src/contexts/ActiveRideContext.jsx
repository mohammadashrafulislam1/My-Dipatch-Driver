// contexts/ActiveRideContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { endPoint } from "../Components/ForAPIs";
import useAuth from "../Components/useAuth";

const ActiveRideContext = createContext();

export const useActiveRide = () => {
  const context = useContext(ActiveRideContext);
  if (!context) {
    throw new Error("useActiveRide must be used within an ActiveRideProvider");
  }
  return context;
};

export const ActiveRideProvider = ({ children }) => {
  const { user } = useAuth();
  const activeStatuses = ["accepted", "on_the_way", "in_progress", "at_stop"];

  // ✅ Initial load from localStorage (if still active)
  const initialRide = (() => {
    try {
      const saved = localStorage.getItem("activeRide");
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed && !activeStatuses.includes(parsed.status)) {
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

  // ✅ Fetch rides from backend and match by driverId
  const fetchRides = async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(`${endPoint}/rides`);
      const data = await response.json();

      // Adjust if API returns { rides: [...] }
      const rides = Array.isArray(data) ? data : data.rides || [];

      const myActiveRide = rides.find(
        (ride) =>
          ride.driverId === user._id && activeStatuses.includes(ride.status)
      );

      if (myActiveRide) {
        setActiveRide(myActiveRide);
        setIsActive(true);
        localStorage.setItem("activeRide", JSON.stringify(myActiveRide));
        localStorage.setItem("rideActive", "true");
        // console.log("✅ Loaded active ride from backend:", myActiveRide.status);
      } else {
        console.log("🧹 No active rides for user — clearing localStorage");
        setActiveRide(null);
        setIsActive(false);
        localStorage.removeItem("activeRide");
        localStorage.removeItem("rideActive");
      }
    } catch (err) {
      console.error("❌ Failed to fetch rides:", err);
    }
  };

  // 🔄 Fetch rides on load and every 10 seconds
  useEffect(() => {
    if (!user?._id) return;
    fetchRides();
    const interval = setInterval(fetchRides, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, [user?._id]);

  // 🧠 Keep localStorage synced with activeRide state
  useEffect(() => {
    if (activeRide && activeStatuses.includes(activeRide.status)) {
      localStorage.setItem("activeRide", JSON.stringify(activeRide));
      localStorage.setItem("rideActive", "true");
      if (!isActive) setIsActive(true);
    } else {
      localStorage.removeItem("activeRide");
      localStorage.removeItem("rideActive");
      if (isActive) setIsActive(false);
    }
  }, [activeRide, isActive]);

  // ✅ Start ride manually
  const startRide = (rideData) => {
    if (rideData && activeStatuses.includes(rideData.status)) {
      setActiveRide(rideData);
      setIsActive(true);
      localStorage.setItem("activeRide", JSON.stringify(rideData));
      localStorage.setItem("rideActive", "true");
      console.log("🟢 Ride started manually:", rideData.status);
    } else {
      endRide();
    }
  };

  // ✅ End ride manually
  const endRide = () => {
    console.log("⛔ Ride ended manually — clearing localStorage");
    setActiveRide(null);
    setIsActive(false);
    localStorage.removeItem("activeRide");
    localStorage.removeItem("rideActive");
  };

  // ✅ Update status dynamically
  const updateRideStatus = (status) => {
    if (!activeRide) return;
    console.log("🔄 Updating ride status to:", status);

    if (activeStatuses.includes(status)) {
      const updatedRide = { ...activeRide, status };
      setActiveRide(updatedRide);
      setIsActive(true);
      localStorage.setItem("activeRide", JSON.stringify(updatedRide));
      localStorage.setItem("rideActive", "true");
    } else {
      console.log("🧹 Status inactive, clearing storage:", status);
      endRide();
    }
  };

  // 🪄 Debug log (optional)
  // useEffect(() => {
  //   console.log("🪄 ActiveRideContext updated:", { activeRide, isActive });
  // }, [activeRide, isActive]);

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
