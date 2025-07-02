import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoSend, IoArrowBackOutline } from "react-icons/io5";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Load user from URL if exists
  const userIdFromQuery = searchParams.get("user");

  useEffect(() => {
    if (userIdFromQuery && !selectedUser) {
      const foundUser = users.find((u) => u.id === Number(userIdFromQuery));
      if (foundUser) {
        setSelectedUser(foundUser);
      }
    }
  }, [userIdFromQuery, selectedUser]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    navigate(`/dashboard/chat?user=${user.id}`);
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

  const handleBack = () => {
    setSelectedUser(null);
    navigate("/dashboard/chat"); // clear query param
  };

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-1/3 border-r bg-gray-100 absolute sm:relative z-10 transition-transform duration-300 ${
          selectedUser ? "translate-x-full sm:translate-x-0" : "translate-x-0"
        } sm:translate-x-0`}
      >
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
      <div
        className={`w-full sm:flex-1 flex flex-col transition-transform duration-300 ${
          selectedUser ? "translate-x-0" : "translate-x-full sm:translate-x-0"
        }`}
      >
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold flex items-center gap-2">
              {/* Back Button for Mobile */}
              <button
                onClick={handleBack}
                className="sm:hidden text-xl text-gray-600"
              >
                <IoArrowBackOutline />
              </button>
              Chat with {selectedUser.name}
            </div>

            {/* Messages */}
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
          <div className="hidden sm:flex flex-1 items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
