import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import io from "socket.io-client";
import useAuth from "./useAuth";

const socket = io("https://my-dipatch-backend.onrender.com", {
  transports: ["websocket"],
});

const NotificationComp = ({ onCountChange = () => {} }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const addNotif = (text) => {
    setNotifications((prev) => {
      const updated = [
        { id: Date.now(), text, time: new Date().toISOString() },
        ...prev,
      ];
      
      onCountChange(updated.length); // 🔥 send count to Dashboard
      return updated;
    });
  };

  const timeAgo = (timeString) => {
    const diff = (Date.now() - new Date(timeString)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return Math.floor(diff / 86400) + " days ago";
  };
  useEffect(() => {
  onCountChange(notifications.length);
}, [notifications]);


  useEffect(() => {
    if (!user?._id) return;

    socket.on("connect", () => {
      socket.emit("join", { userId: user._id, role: user.role });
    });

    socket.on("new-ride-request", (ride) => {
      addNotif(`New ride request from ${ride.pickup?.address}`);
    });

    socket.on("ride-accepted", () => {
      addNotif("Your ride has been accepted.");
    });

    socket.on("driver-location-update", ({ location }) => {
      addNotif(
        `Driver moved to (${location.lat.toFixed(4)}, ${location.lng.toFixed(
          4
        )})`
      );
    });

    socket.on("driver-location-disconnected", () => {
      addNotif("Driver went offline.");
    });

    return () => {
      socket.off("new-ride-request");
      socket.off("ride-accepted");
      socket.off("driver-location-update");
      socket.off("driver-location-disconnected");
    };
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <FiBell className="text-2xl text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
      </div>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div
            key={note.id}
            className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md"
          >
            <p className="text-gray-800 text-sm">{note.text}</p>
            <span className="text-xs text-gray-400">{timeAgo(note.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationComp;
