import { FiBell } from "react-icons/fi";

const notifications = [
  { id: 1, text: "You have a new message from Alex.", time: "2 hours ago" },
  { id: 2, text: "New comment on your post.", time: "3 hours ago" },
  { id: 3, text: "System update completed.", time: "6 hours ago" },
  { id: 4, text: "Your password was changed.", time: "Yesterday" },
  { id: 5, text: "Weekly summary is ready.", time: "2 days ago" },
];

const Notification = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FiBell className="text-2xl text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Notifications</h2>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <div
              key={note.id}
              className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition"
            >
              <p className="text-gray-800 text-sm">{note.text}</p>
              <span className="text-xs text-gray-400 mt-1 block">{note.time}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-20">
            <FiBell className="text-4xl mx-auto mb-4" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
