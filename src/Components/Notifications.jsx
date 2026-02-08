import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import useAuth from "./useAuth";
import { endPoint } from "./ForAPIs";

const NotificationContext = createContext();

const normalizeNotification = (n) => ({
  _id: n._id,
  rideId: n.rideId || null,
  title: n.title || "Notification",
  message: n.message || "",
  read: n.read || false,
  createdAt: n.createdAt || new Date().toISOString(),
});

// Prevent duplicates (same ride or same _id)
const mergeNotifications = (existing, incoming) => {
  const map = new Map();

  // Always key by _id
  [...existing, ...incoming].forEach((n) => {
    map.set(n._id, { ...map.get(n._id), ...n }); 
    // merge updates instead of duplicating
  });

  return Array.from(map.values()).sort((a, b) => {
  // Unread first
  if (a.read !== b.read) return a.read ? 1 : -1;

  // Then newest first
  return new Date(b.createdAt) - new Date(a.createdAt);
});

};


export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user || !token) return;

    try {
      const res = await axios.get(`${endPoint}/notification`, {
        params: { limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const dbNotifications = res.data.notifications.map(normalizeNotification);

        setNotifications((prev) => mergeNotifications(prev, dbNotifications));
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    if (!user || !token) return;

    // Initial fetch
    fetchNotifications();

    // Auto refresh every 10 seconds
    intervalRef.current = setInterval(fetchNotifications, 100);

    return () => clearInterval(intervalRef.current);
  }, [user?._id, token]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${endPoint}/notification/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) => {
  const updated = prev.map((n) =>
    n._id === notificationId ? { ...n, read: true } : n
  );

  return updated.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
});

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`${endPoint}/notification/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications, // manual refresh option
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
