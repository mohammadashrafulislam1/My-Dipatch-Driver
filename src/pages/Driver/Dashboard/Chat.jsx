import { useState, useEffect, useRef } from "react";
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
  const [selectedFile, setSelectedFile] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
    if (!message.trim() && !selectedFile) return;

    let newMessage;
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const fileType = selectedFile.type.startsWith("image/") ? "image" : "file";

      newMessage = {
        from: "me",
        file: url,
        fileName: selectedFile.name,
        fileType,
      };
    } else {
      newMessage = { from: "me", text: message };
    }

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));

    setMessage("");
    if (selectedFile) {
      // Do NOT revoke here immediately, revoke on component unmount or when removing file
      // URL.revokeObjectURL(selectedFile);
      setSelectedFile(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleBack = () => {
    setSelectedUser(null);
    navigate("/dashboard/chat"); // clear query param
    setSelectedFile(null);
    setMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleRemoveFile = () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Cleanup created object URLs on unmount or when selectedFile changes
  useEffect(() => {
    let objectUrl;
    if (selectedFile) {
      objectUrl = URL.createObjectURL(selectedFile);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [selectedFile]);

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
                className={`max-w-[300px] max-h-[300px] px-2 py-2 rounded-xl text-sm break-words ${
                  msg.from === "me"
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text && <span>{msg.text}</span>}
              
                {msg.fileType === "image" && (
                  <img
                    src={msg.file}
                    alt={msg.fileName}
                    className="w-[300px] h-[250px]  rounded-md mt-1 object-cover"
                  />
                )}
              
                {msg.fileType === "file" && (
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {msg.fileName}
                  </a>
                )}
              </div>
              
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t flex flex-col gap-2">
              {/* Preview of selected file */}
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt={selectedFile.name}
                      className="h-16 rounded"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <BsPaperclip className="text-2xl text-gray-600" />
                      <span className="truncate max-w-xs">{selectedFile.name}</span>
                    </div>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-600 font-bold px-2"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-xl text-gray-600">
                  <label className="cursor-pointer">
                    <BsPaperclip />
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                  <label className="cursor-pointer">
                    <MdImage />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={imageInputRef}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  className="flex-1 border rounded-full px-4 py-2 outline-none"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={!!selectedFile} // disable text input if a file is selected
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-blue-500 text-white rounded-full"
                >
                  <IoSend />
                </button>
              </div>
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
