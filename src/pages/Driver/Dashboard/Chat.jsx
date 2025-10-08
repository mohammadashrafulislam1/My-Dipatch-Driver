import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoSend, IoArrowBackOutline } from "react-icons/io5";
import { BsCircleFill, BsPaperclip } from "react-icons/bs";
import { MdImage } from "react-icons/md";
import useAuth from "../../../Components/useAuth";
import axios from "axios";
import { endPoint } from "../../../Components/ForAPIs";


const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [activeRide, setActiveRide] = useState(null); // NEW: To store active ride data

  const { user } = useAuth(); // Assume user object contains the current user's details (driver/customer)

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const userIdFromQuery = searchParams.get("user");
  const rideStatusFromQuery = searchParams.get("rideStatus");
  const rideIdFromQuery = searchParams.get("rideId"); // NEW: Get rideId from query

  // Allowed statuses for messaging
  const allowedStatuses = ["accepted", "on_the_way", "in_progress"];
  const canSendMessages = rideStatus && allowedStatuses.includes(rideStatus);

  // NEW: Fetch active ride and set chat users based on ride
  useEffect(() => {
    const fetchRideAndUser = async () => {
      if (!user?._id || !rideIdFromQuery) {
        setUsers([]);
        return;
      }
      
      try {
        console.log(rideIdFromQuery)
        // 1. Fetch the active ride details
        const rideRes = await axios.get(`${endPoint}/rides/${rideIdFromQuery}`);
        const ride = rideRes.data.ride;
        setActiveRide(ride);
        setRideStatus(ride.status);
        
        // 2. Determine the chat recipient's ID (the other participant in the ride)
        let recipientId = null;
        if (user.role === 'driver' && ride.customerId) {
            recipientId = ride.customerId;
        } else if (user.role === 'customer' && ride.driverId) {
            recipientId = ride.driverId;
        }
        
        if (recipientId) {
            // 3. Fetch the recipient's details
            const userRes = await axios.get(`${endPoint}/user/${recipientId}`);
            const recipientUser = userRes.data;
            
            // Format the user object to match the component's expected structure
            const chatUser = {
                id: recipientUser._id, 
                firstname: recipientUser.firstName, 
                lastname: recipientUser.lastName,
                // Add any other necessary fields
            };
            setUsers([chatUser]);

            // If a user is pre-selected via query param, select them
            if (userIdFromQuery && chatUser.id === userIdFromQuery && !selectedUser) {
                setSelectedUser(chatUser);
            }
        } else {
            setUsers([]);
        }
        
      } catch (err) {
        console.error("Failed to load ride or user:", err);
        setUsers([]); // Clear users on failure
      }
    };
  
    fetchRideAndUser();
  }, [endPoint, user?._id, rideIdFromQuery, userIdFromQuery, selectedUser]); // Include rideIdFromQuery

  // Removed the useEffect that manually sets selectedUser based on query params
  // as the logic is now inside the fetchRideAndUser effect.

  // NEW: Check if the user is selectable (i.e., if messaging is allowed)
  const isUserSelectable = () => canSendMessages;
  
  const handleUserClick = (user) => {
    if (isUserSelectable()) { // Check if selectable before proceeding
        setSelectedUser(user);
        // Updated navigation to include rideId
        navigate(`/dashboard/chat?user=${user.id}&rideId=${rideIdFromQuery}&rideStatus=${rideStatus}`);
    } else {
         alert(`Chat is disabled. Ride status is: "${rideStatus}"`);
    }
  };

  const handleSend = () => {
    // Check if messaging is allowed
    if (!canSendMessages) {
      alert("Messaging is only available when ride status is: accepted, on_the_way, or in_progress");
      return;
    }

    if (!message.trim() && !selectedFile) return;
    
    // TODO: Implement actual message/file sending to backend (ChatController.js) via API or Socket.IO

    let newMessage;
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      const fileType = selectedFile.type.startsWith("image/") ? "image" : "file";

      newMessage = {
        from: "me",
        file: url,
        fileName: selectedFile.name,
        fileType,
        timestamp: new Date().toISOString(),
      };
    } else {
      newMessage = { 
        from: "me", 
        text: message,
        timestamp: new Date().toISOString(),
      };
    }

    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));

    setMessage("");
    if (selectedFile) {
      setSelectedFile(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleBack = () => {
    setSelectedUser(null);
    setRideStatus(null);
    setActiveRide(null);
    // Clear all query params on back
    navigate("/dashboard/chat"); 
    setSelectedFile(null);
    setMessage("");
  };

  const handleFileChange = (e) => {
    if (!canSendMessages) {
      alert("Messaging is only available when ride status is: accepted, on_the_way, or in_progress");
      e.target.value = ""; // Clear the file input
      return;
    }

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

  // Status message component
  const StatusMessage = () => {
    if (!rideStatus) return null;
    
    if (canSendMessages) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded text-sm mb-2">
          ✓ Messaging enabled (Ride status: {rideStatus})
        </div>
      );
    } else {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-sm mb-2">
          ⚠ Messaging disabled. Current ride status: "{rideStatus}". 
          <br />Messaging is only available when ride status is: accepted, on_the_way, or in_progress
        </div>
      );
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

  // NEW: Placeholder for chat recipient name
  const chatRecipientName = selectedUser?.firstname ? `${selectedUser.firstname} ${selectedUser.lastname || ''}` : "User";

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto bg-white shadow-md rounded-xl overflow-hidden relative md:mt-0 mt-6">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-1/3 border-r bg-gray-100 absolute sm:relative z-10 transition-transform duration-300 ${
          selectedUser ? "translate-x-full sm:translate-x-0" : "translate-x-0"
        } sm:translate-x-0`}
      >
                {/* MODIFIED HEADER LINE */}
                <div className="p-4 text-xl font-bold border-b">
            {/* Check for activeRide AND activeRide.status before displaying */}
            {activeRide?.status ? `Active Ride Chat (${activeRide.status})` : 'Chats'}
        </div>
        <ul>
          {users?.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user)}
              // Apply disabled styles if not selectable
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 
                ${selectedUser?.id === user.id ? "bg-gray-200" : ""}
                ${!isUserSelectable() ? "opacity-50 cursor-not-allowed" : ""}
              `}
              title={isUserSelectable() ? `Chat with ${user.firstname}` : `Chat disabled: Ride status is ${rideStatus}`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-lg font-semibold">
                  {user?.firstname?.charAt(0)}
                </div>
              </div>
              <div>
                <div className="font-medium">{user?.firstname} {user?.lastname}</div>
                <div className={`text-sm ${isUserSelectable() ? 'text-green-500' : 'text-red-500'}`}>
                    {isUserSelectable() ? "Active Chat" : "Chat Disabled"}
                </div>
              </div>
            </li>
          ))}
          {!activeRide && (
              <li className="px-4 py-3 text-gray-500">
                  No active ride to chat about.
              </li>
          )}
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
              Chat with {chatRecipientName}
              {rideStatus && (
                <span className={`text-xs px-2 py-1 rounded ${
                  canSendMessages ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  Ride: {rideStatus}
                </span>
              )}
            </div>

            {/* Status Message */}
            {rideStatus && <StatusMessage />}

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
                      className="w-[300px] h-[250px] rounded-md mt-1 object-cover"
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
                  
                  {msg.timestamp && (
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
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
                  <label className={`cursor-pointer ${!canSendMessages ? 'opacity-50' : ''}`}>
                    <BsPaperclip />
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={!canSendMessages}
                    />
                  </label>
                  <label className={`cursor-pointer ${!canSendMessages ? 'opacity-50' : ''}`}>
                    <MdImage />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={imageInputRef}
                      onChange={handleFileChange}
                      disabled={!canSendMessages}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  className={`flex-1 border rounded-full px-4 py-2 outline-none ${
                    !canSendMessages ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={
                    canSendMessages 
                      ? "Type your message..." 
                      : "Messaging disabled for current ride status"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={!!selectedFile || !canSendMessages}
                />
                <button
                  onClick={handleSend}
                  className={`p-2 rounded-full ${
                    canSendMessages 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!canSendMessages}
                  title={
                    !canSendMessages 
                      ? "Messaging only available when ride status is: accepted, on_the_way, or in_progress" 
                      : "Send message"
                  }
                >
                  <IoSend />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden sm:flex flex-1 items-center justify-center text-gray-500">
            {activeRide ? 'Select a user to start chatting' : 'No active ride found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;