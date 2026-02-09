import { useEffect, useState } from "react";

export default function useLocationPermission({ setDriverLocation }) {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
        setShowLocationModal(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🔹 Platform-specific help for enabling location
  const openLocationSettings = () => {
    const ua = navigator.userAgent;

    if (/Android/i.test(ua)) {
      alert(
        "📱 Android:\nGo to Settings → Apps → [Your App/Browser] → Permissions → Enable Location."
      );
    } else if (/iPhone|iPad/i.test(ua)) {
      alert(
        "🍎 iPhone/iPad:\nGo to Settings → Privacy → Location Services → Enable for Safari or your browser."
      );
    } else {
      alert(
        "💻 Desktop:\nPlease enable location in your browser settings:\n\nChrome: Settings → Privacy and Security → Site Settings → Location\n\nFirefox: Settings → Privacy & Security → Permissions → Location"
      );
    }
  };

  // 🔹 Watch permission changes (works in most modern browsers)
 useEffect(() => {
  if (!navigator.geolocation) {
    setShowLocationModal(true);
    setLocationEnabled(false);
    return;
  }

  // 🔥 REAL permission check
  navigator.geolocation.getCurrentPosition(
    () => {
      // Location works → hide modal
      setLocationEnabled(true);
      setShowLocationModal(false);
    },
    () => {
      // Location blocked/denied
      setLocationEnabled(false);
      setShowLocationModal(true);
    },
    { timeout: 5000 }
  );
}, []);


  // 🔹 Handle geolocation watch errors
  const handleGeoError = (err) => {
    console.warn("Geolocation error:", err);
    if (err.code === 1 || err.code === 2 || err.code === 3) {
      setLocationEnabled(false);
      setShowLocationModal(true);
    }
  };

  // 🔹 Modal UI
const LocationModal = () => {
  if (!showLocationModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-[90%] text-center">

        <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">
          Enable Location Access
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          To use live tracking, allow location access.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={requestLocationPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Enable Location
          </button>

          <button
            onClick={openLocationSettings}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Open Settings
          </button>

          <button
            onClick={() => setShowLocationModal(false)}
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 
                       text-gray-900 dark:text-white px-5 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};


  return {
    locationEnabled,
    showLocationModal,
    setShowLocationModal,
    requestLocationPermission,
    openLocationSettings,
    handleGeoError,
    LocationModal,
  };
}
