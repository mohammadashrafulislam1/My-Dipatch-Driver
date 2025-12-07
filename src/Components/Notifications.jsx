// Notifications.jsx - Updated version with debugging
import { useEffect, useState } from "react";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import io from "socket.io-client";
import useAuth from "./useAuth";
import axios from "axios";
import { endPoint } from "./ForAPIs";

const socket = io("https://my-dipatch-backend.onrender.com", {
  transports: ["websocket"],
});

const NotificationComp = ({ onCountChange = () => {} }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      
      if (!user?._id) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${endPoint}/notification`, {
        headers: { Authorization: `Bearer ${token}` }
      });  
      
      console.log("✅ API Response:", response);

      if (response.data.success) {
        // Check if notifications array exists
        const notificationsData = response.data.notifications || [];
        const unreadCountData = response.data.unreadCount || 0;
        
        
        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
        onCountChange(unreadCountData);
      } else {
        // If API doesn't have success field but returns data directly
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
          const unread = response.data.filter(n => !n.read).length;
          setUnreadCount(unread);
          onCountChange(unread);
        }
      }
    } catch (error) {
      console.error('🔧 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
    } finally {
      setLoading(false);
      console.log("🏁 Loading set to false");
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${endPoint}/notification/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      console.log("📝 Marking all notifications as read");
      await axios.put(`${endPoint}/notification/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      onCountChange(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      console.log("🗑️ Deleting notification:", notificationId);
      await axios.delete(`${endPoint}/notification/${notificationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      // Update unread count if needed
      const deletedNotif = notifications.find(n => n._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const timeAgo = (timeString) => {
    const diff = (Date.now() - new Date(timeString)) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return Math.floor(diff / 60) + " min ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hr ago";
    return Math.floor(diff / 86400) + " days ago";
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    socket.on("connect", () => {
      socket.emit("join", { userId: user._id, role: user.role });
    });

    // Listen for new notifications from socket
    socket.on("new-notification", (notification) => {
      console.log("🎯 Received new-notification via socket:", notification);
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        onCountChange(prev => prev + 1);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    return () => {
      socket.off("new-notification");
      socket.off("new-ride-request");
      socket.off("ride-accepted");
      socket.off("connect_error");
    };
  }, [user]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiBell className="text-2xl text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-md hover:bg-blue-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <FiBell className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg">No notifications yet</p>
          <p className="text-sm mt-2">When you receive notifications, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div
              key={note._id}
              className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md ${
                !note.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-800 text-sm font-medium">{note.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{note.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">{timeAgo(note.createdAt)}</span>
                    {note.rideId && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Ride #{typeof note.rideId === 'string' ? note.rideId.slice(-6) : note.rideId._id?.slice(-6)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      note.type === 'ride_request' ? 'bg-blue-100 text-blue-800' :
                      note.type === 'ride_accepted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {note.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!note.read && (
                    <button
                      onClick={() => markAsRead(note._id)}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck className="text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(note._id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationComp;