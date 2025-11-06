import { useEffect, useState } from "react";

export default function useLocationPermission({ setDriverLocation }) {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  console.log(setDriverLocation)
  // 🔹 Ask for location permission manually (user-initiated)
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("✅ Location granted:", pos);
        setLocationEnabled(true);
        setShowLocationModal(false);
        if (setDriverLocation)
          setDriverLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      (err) => {
        console.error("❌ Location error:", err);
        alert("Please enable location in your browser settings.");
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🔹 Watch permission changes (works in most modern browsers)
  useEffect(() => {
    if (!navigator.geolocation) {
      setShowLocationModal(true);
      setLocationEnabled(false);
      return;
    }

    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((res) => {
        if (res.state === "denied") {
          setShowLocationModal(true);
          setLocationEnabled(false);
        }
        res.onchange = () => {
          if (res.state === "denied") {
            setShowLocationModal(true);
            setLocationEnabled(false);
          } else {
            setShowLocationModal(false);
            setLocationEnabled(true);
          }
        };
      })
      .catch(() => {});
  }, []);

  // 🔹 Handle geolocation watch errors (use this inside your watchPosition)
  const handleGeoError = (err) => {
    console.warn("Geolocation error:", err);
    if (err.code === 1 || err.code === 2 || err.code === 3) {
      setLocationEnabled(false);
      setShowLocationModal(true);
    }
  };

  // 🔹 Location Modal (reusable UI)
  const LocationModal = () =>
    showLocationModal ? (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-[90%] text-center">
          <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
            Enable Location Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            To use live tracking and navigation, please allow this app to access
            your location. This is required for route updates and real-time tracking.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={requestLocationPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              Enable Location
            </button>
            <button
              onClick={() => setShowLocationModal(false)}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return {
    locationEnabled,
    showLocationModal,
    setShowLocationModal,
    requestLocationPermission,
    handleGeoError,
    LocationModal,
  };
}
