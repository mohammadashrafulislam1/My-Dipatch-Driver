import { Clock, MapPin } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

export default function DriverNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100); // % for timer bar
  const timerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const progressRef = useRef(null);

  const driverId = "6897f362d0b0f0a2da455188";
  const DURATION = 20 * 1000; // 10 seconds

  const socketRef = useRef(null);

useEffect(() => {
  socketRef.current = io('https://my-dipatch-backend.onrender.com', {
    transports: ["websocket"],
    withCredentials: true,
  });

  const socket = socketRef.current;
  socket.emit('join', { userId: driverId, role: 'driver' });

  socket.on('new-ride-request', (ride) => {
    console.log(ride)
    if (ride.status === "pending") {
      showNotification(ride);
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  return () => {
    socket.disconnect();
  };
}, []);


  function showNotification(ride) {
    setNotification({ ...ride, timestamp: Date.now() });
    setIsVisible(true);
    setProgress(100);

    // Progress bar animation
    clearInterval(progressRef.current);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(percent);
    }, 50);

    // Auto-hide after 10 seconds
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      clearInterval(progressRef.current);
    }, DURATION);

    // Retry check
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      checkRideStatusAndRetry(ride._id);
    }, DURATION);
  }

  async function checkRideStatusAndRetry(rideId) {
    try {
      const res = await fetch(`https://my-dipatch-backend.onrender.com/api/rides/${rideId}`);
      console.log(res);
      const ride = await res.json();
      console.log(ride);
      if (ride.status === "pending") {
        showNotification(ride);
      }
    } catch (err) {
      console.error("Error checking ride status", err);
    }
  }

  const handleAccept = () => {
    console.log('Accepting ride:', notification._id);
    setIsVisible(false);
    clearTimeout(timerRef.current);
    clearTimeout(retryTimerRef.current);
    clearInterval(progressRef.current);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    clearTimeout(timerRef.current);
    clearTimeout(retryTimerRef.current);
    clearInterval(progressRef.current);
  };

  if (!notification || !isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-8 z-50 w-96 bg-[#0E2418] text-white rounded-2xl shadow-2xl border-2 border-green-700 overflow-hidden">
      
      {/* Timer Bar */}
      <div className="h-1 bg-green-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>

      <div className="p-5 space-y-4">
        {/* Delivery label */}
        <div className="flex justify-center">
          <span className="bg-green-800 px-3 py-1 rounded-full text-sm font-semibold">Delivery</span>
        </div>

        {/* Price */}
        <div className="text-center">
          <p className="text-4xl font-bold">${notification.price}</p>
          <p className="text-sm text-gray-300">includes expected tip</p>
        </div>

        {/* Time & Distance */}
        <div className="flex items-center justify-center space-x-2 text-gray-200">
          <Clock size={18} />
          <span>{notification.eta || "15 min"} ({notification.distance || "1.3 mi"}) total</span>
        </div>

        {/* Pickup & Dropoff & Midway Stops */}
<div className="space-y-2">
  {/* Pickup */}
  <div className="flex items-start space-x-2">
    <MapPin size={18} className="text-green-500" />
    <span>{notification.pickup?.address}</span>
  </div>

  {/* Midway Stops */}
  {notification.midwayStops?.length > 0 && (
    <div className="pl-6 space-y-1">
      <h5 className="text-sm font-semibold text-yellow-400">Midway:{notification.midwayStops.length > 1 ? "s" : ""}</h5>
      {notification.midwayStops.map((stop, index) => (
        <div key={index} className="flex items-start space-x-2">
          <MapPin size={18} className="text-yellow-500" />
          <span>{stop.address}</span>
        </div>
      ))}
    </div>
  )}

  {/* Dropoff */}
  <div className="flex items-start space-x-2">
    <MapPin size={18} className="text-red-500" />
    <span>{notification.dropoff?.address}</span>
  </div>
</div>


        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Accept
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
