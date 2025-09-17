import { Clock, MapPin } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import useAuth from "./useAuth";

export default function DriverNotification({ isActive }) {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]); // queue of rides
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const socketRef = useRef(null);

  const DURATION = 20 * 1000; // 20 seconds

  // Connect socket
  useEffect(() => {
    if (!isActive || !user?._id) return;

    socketRef.current = io("https://my-dipatch-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      socket.emit("join", { userId: user._id, role: "driver" });
    });

    socket.on("new-ride-request", (ride) => {
      console.log("🚕 New ride:", ride);
      if (ride.status === "pending") {
        setQueue((prev) => [...prev, ride]); // push to queue
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isActive, user?._id]);

  // Show next ride when queue updates
  useEffect(() => {
    if (queue.length > 0 && !isVisible) {
      showNotification(queue[0]); // show first in queue
    }
  }, [queue, isVisible]);

  function showNotification(ride) {
    setIsVisible(true);
    setProgress(100);

    // Progress countdown
    clearInterval(progressRef.current);
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(percent);
    }, 50);

    // Auto-dismiss after duration
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, DURATION);
  }

  function handleNextRide() {
    // Remove the first ride and show next
    setQueue((prev) => prev.slice(1));
    setIsVisible(false);
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
  }

  function handleAccept() {
    console.log("✅ Ride accepted:", queue[0]?._id);
    // Clear queue once a ride is accepted
    setQueue([]);
    setIsVisible(false);
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
  }

  function handleDismiss() {
    console.log("❌ Ride dismissed:", queue[0]?._id);
    handleNextRide();
  }

  if (queue.length === 0 || !isVisible) return null;

  const ride = queue[0];

  return (
    <div className="fixed bottom-20 md:bottom-8 right-8 z-50 w-96 bg-[#0E2418] text-white rounded-2xl shadow-2xl border-2 border-green-700 overflow-hidden">
      {/* Timer Bar */}
      <div
        className="h-1 bg-green-500 transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      ></div>

      <div className="p-5 space-y-4">
        {/* Delivery label */}
        <div className="flex justify-center">
          <span className="bg-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            Delivery
          </span>
        </div>

        {/* Price */}
        <div className="text-center">
          <p className="text-4xl font-bold">${ride.price}</p>
          <p className="text-sm text-gray-300">includes expected tip</p>
        </div>

        {/* Time & Distance */}
        <div className="flex items-center justify-center space-x-2 text-gray-200">
          <Clock size={18} />
          <span>
            {ride.eta || "15 min"} ({ride.distance || "1.3 mi"}) total
          </span>
        </div>

        {/* Pickup & Dropoff & Midway Stops */}
        <div className="space-y-2">
          {/* Pickup */}
          <div className="flex items-start space-x-2">
            <MapPin size={18} className="text-green-500" />
            <span>{ride.pickup?.address}</span>
          </div>

          {/* Midway Stops */}
          {ride.midwayStops?.length > 0 && (
            <div className="pl-6 space-y-1">
              <h5 className="text-sm font-semibold text-yellow-400">
                Midway{ride.midwayStops.length > 1 ? "s" : ""}
              </h5>
              {ride.midwayStops.map((stop, index) => (
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
            <span>{ride.dropoff?.address}</span>
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
