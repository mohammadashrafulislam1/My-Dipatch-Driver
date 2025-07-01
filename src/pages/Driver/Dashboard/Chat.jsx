import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { BsCircleFill, BsPaperclip } from "react-icons/bs";
import { MdImage } from "react-icons/md";

const users = [
  { id: 1, name: "John Doe", online: true },
  { id: 2, name: "Jane Smith", online: false },
  { id: 3, name: "Mike Johnson", online: true },
];

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [
        ...(prev[selectedUser.id] || []),
        { from: "me", text: message },
      ],
    }));
    setMessage("");
  };

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-gray-100">
        <div className="p-4 text-xl font-bold border-b">Chats</div>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 ${
                selectedUser?.id === user.id ? "bg-gray-200" : ""
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-lg font-semibold">
                  {user.name.charAt(0)}
                </div>
                <BsCircleFill
                  className={`absolute -bottom-1 -right-1 text-xs ${
                    user.online ? "text-green-500" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">
                  {user.online ? "Online" : "Offline"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold">
              Chat with {selectedUser.name}
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {(messages[selectedUser.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                    msg.from === "me"
                      ? "ml-auto bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t flex items-center gap-2">
              {/* Icons */}
              <div className="flex items-center gap-2 text-xl text-gray-600">
                <label className="cursor-pointer">
                  <BsPaperclip />
                  <input type="file" hidden />
                </label>
                <label className="cursor-pointer">
                  <MdImage />
                  <input type="file" accept="image/*" hidden />
                </label>
              </div>

              {/* Input */}
              <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 outline-none"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="p-2 bg-blue-500 text-white rounded-full"
              >
                <IoSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
