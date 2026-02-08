import { useNotifications } from "./Notifications";
import { FiBell, FiX, FiCheck } from "react-icons/fi";

const NotificationComp = () => {
  const { notifications, unreadCount, markAsRead, deleteNotification } =useNotifications();

  return (
    <div className="p-4 w-full bg-white dark:bg-gray-900 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FiBell className="text-blue-500" />
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {unreadCount} New
          </span>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          No notifications
        </p>
      ) : (
        <ul className="space-y-2 max-h-full overflow-y-auto">
          {notifications.map((n, idx) => (
            <li
              key={n._id}
              className={`relative border rounded-lg p-3 flex flex-col gap-1 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${
                !n.read
                  ? "bg-blue-50 dark:bg-gray-800 animate-fade-in"
                  : "bg-white dark:bg-gray-900"
              }`}
            >
              {/* Badge for unread */}
              {!n.read && (
                <span className="absolute top-2 right-2 bg-blue-500 w-2 h-2 rounded-full animate-pulse"></span>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {n.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {n.message}
                  </p>
                </div>

                <div className="flex flex-col gap-1 ml-2 items-end">
                  {/* Mark as read */}
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <FiCheck /> Mark
                    </button>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => deleteNotification(n._id)}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm flex items-center gap-1"
                  >
                    <FiX /> Delete
                  </button>
                </div>
              </div>

              {/* Timestamp (optional) */}
              {n.createdAt && (
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationComp;
