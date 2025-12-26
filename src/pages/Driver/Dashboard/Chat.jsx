import { useState, useEffect, useRef, useMemo } from "react";
import { IoSend } from "react-icons/io5";
import { BsPaperclip } from "react-icons/bs";
import { MdImage, MdOutlineSupportAgent } from "react-icons/md";
import useAuth from "../../../Components/useAuth";
import axios from "axios";
import { endPoint } from "../../../Components/ForAPIs";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const allowedStatuses = ["accepted", "on_the_way", "in_progress"];

const Chat = () => {
  const { user, token } = useAuth();
const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [ride, setRide] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [customer, setCustomer] = useState(null);

  const [activeChat, setActiveChat] = useState("customer");
  const [adminIds, setAdminIds] = useState([]);

  const socket = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ------------------ helpers ------------------ */
  const dedupeByClientMessageId = (msgs) => {
    const map = new Map();

    for (const msg of msgs) {
      const key = msg.clientMessageId || msg._id;
      if (!map.has(key)) {
        map.set(key, msg);
      } else if (map.get(key).optimistic && !msg.optimistic) {
        map.set(key, msg);
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  };

  /* ------------------ socket ------------------ */
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io("https://my-dipatch-backend.onrender.com/", {
      query: { userId: user._id, role: user.role },
      headers: { Authorization: `Bearer ${token}` },
    });

    socket.current.emit("join", { userId: user._id, role: user.role });

    socket.current.on("chat-message", (msg) => {
      console.log(msg)
  setMessages((prev) => dedupeByClientMessageId([...prev, msg]));
});


    socket.current.on("support-message", (msg) => {
      if (msg.senderId === user._id || msg.recipientId === user._id) {
        setMessages((prev) => dedupeByClientMessageId([...prev, msg]));
      }
    });

    return () => socket.current.disconnect();
  }, [user?._id]);

  /* ------------------ admins ------------------ */
  useEffect(() => {
    const fetchAdmins = async () => {
      const res = await axios.get(`${endPoint}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdminIds(res.data.filter(u => u.role === "admin").map(a => a._id));
    };

    fetchAdmins();
  }, []);

  /* ------------------ can chat ------------------ */
  const canChat = useMemo(() => {
    if (activeChat === "cs") return true;
    if (activeChat === "customer" && rideStatus) {
      return allowedStatuses.includes(rideStatus);
    }
    return false;
  }, [activeChat, rideStatus]);

  /* ------------------ fetch support chat ------------------ */
  useEffect(() => {
    const fetchSupportChat = async () => {
      if (activeChat !== "cs" || !user?._id) return;

      try {
        const res = await axios.get(`${endPoint}/chat/support`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages((prev) =>
          dedupeByClientMessageId([
            ...prev,
            ...res.data.messages.map(msg => ({ ...msg, clientMessageId: msg.clientMessageId }))
          ])
        );
      } catch (err) {
        console.error("Failed to fetch support chat:", err);
      }
    };

    fetchSupportChat();
  }, [activeChat, user?._id]);

  /* ------------------ fetch active ride ------------------ */
  useEffect(() => {
    if (!user?._id || activeChat !== "customer") return;

    const loadRide = async () => {
      try {
        const res = await axios.get(`${endPoint}/rides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
     const driverRides = res.data.rides?.filter(r => r.driverId === user._id) || [];
        const activeRide = driverRides?.find(r =>
          allowedStatuses.includes(r.status)
        );

        if (!activeRide) {
          setRide(null);
          setCustomer(null);
          setMessages([]);
          return;
        }

        setRide(activeRide);
        setRideStatus(activeRide.status);

        const customerRes = await axios.get(
          `${endPoint}/user/${activeRide.customerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCustomer(customerRes.data);

        const chatRes = await axios.get(
          `${endPoint}/chat/driver/${activeRide._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(dedupeByClientMessageId(chatRes.data.messages || []));
      } catch (err) {
        console.error("Failed to fetch ride/chat:", err);
      }
    };

    loadRide();
  }, [user?._id, activeChat]);

  /* ------------------ scroll ------------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  console.log("message", messages)
  /* ------------------ displayed messages ------------------ */
 const displayedMessages = messages.filter((msg) => {
  if (activeChat === "customer") {
    return (
      (msg.senderId === user._id && msg.recipientId === customer?._id) ||
      (msg.senderId === customer?._id && msg.recipientId === user._id)
    );
  }

  if (activeChat === "cs") {
    // Only include messages sent/received by admins
    return (
      (msg.senderRole === "admin" && msg.recipientId === user._id) || // from admin to me
      (msg.senderId === user._id && adminIds.includes(msg.recipientId)) // from me to admin
    );
  }

  return false;
});


  /* ------------------ dedupe displayed messages ------------------ */
const dedupedMessages = (() => {
  const map = new Map();

  for (const msg of displayedMessages) {
    const key = msg.clientMessageId || msg._id;
    if (!map.has(key)) {
      map.set(key, msg);
    } else if (map.get(key).optimistic && !msg.optimistic) {
      map.set(key, msg);
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
})();

  /* ------------------ send message ------------------ */
  const handleSend = async () => {
     if (sending) return; // prevent double sending
    if (!canChat || (!message.trim() && !selectedFile)) return;
setSending(true); // disable butto
    const recipientIds = activeChat === "cs" ? adminIds : [customer?._id];
    
    if (!recipientIds || recipientIds.length === 0) {
       setSending(false);
      return alert("No recipients available");
    }

    try {
      if (selectedFile) {
        // File upload logic
        const tempUrl = URL.createObjectURL(selectedFile);
        const clientMessageId = uuidv4();

        const optimisticMsgs = recipientIds.map((id) => ({
          senderId: user._id,
          recipientId: id,
          fileUrl: tempUrl,
          fileType: selectedFile.type.startsWith("image/") ? "image" : "file",
          createdAt: new Date().toISOString(),
          optimistic: true,
        }));
        // setMessages((prev) => [...prev, ...optimisticMsgs]);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("senderId", user._id);
        formData.append("senderRole", user.role);
        formData.append("clientMessageId", clientMessageId);

        const endpoint = activeChat === "cs" 
          ? `${endPoint}/chat/support/upload`  // You'll need to create this endpoint
          : `${endPoint}/chat/upload`;

        for (let id of recipientIds) {
          formData.set("recipientId", id);
          if (activeChat === "customer") {
            formData.set("rideId", ride?._id);
          }

          const fileRes = await axios.post(endpoint, formData, {
            headers: { 
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            },
          });

          setMessages((prev) =>
            prev.map(m => 
              m.optimistic && m.recipientId === id 
                ? { ...fileRes.data.chat, createdAt: new Date().toISOString() }
                : m
            ).filter(m => !m.optimistic || m.recipientId !== id)
          );
        }

        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (imageInputRef.current) imageInputRef.current.value = "";
      } else {
        // Text message logic
        const clientMessageId = uuidv4();
        
        const optimisticTexts = recipientIds.map((id) => ({
          senderId: user._id,
          recipientId: id,
          message: message.trim(),
          createdAt: new Date().toISOString(),
          optimistic: true,
          rideId: activeChat === "customer" ? ride?._id : null,
        }));
        
        // setMessages((prev) => [...prev, ...optimisticTexts]);

        if (activeChat === "cs") {
          const textData = {
            text: message.trim(),
            recipientId: adminIds,
            clientMessageId,
          };

          const savedMsg = await axios.post(`${endPoint}/chat/support/send`, textData, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMessages((prev) =>
            prev.filter((m) => !m.optimistic).concat(savedMsg.data.chat)
          );
        } else {
          for (let id of recipientIds) {
            const textData = {
  rideId: ride?._id,
  senderId: user._id,        // ✅ REQUIRED
  senderRole: user.role,     // ✅ REQUIRED
  recipientId: id,
  text: message.trim(),
  clientMessageId,
};
            
            const savedMsg = await axios.post(`${endPoint}/chat/send`, textData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setMessages((prev) =>
              prev.map(m => 
                m.optimistic && m.recipientId === id 
                  ? savedMsg.data.chat 
                  : m
              ).filter(m => !m.optimistic || m.recipientId !== id)
            );
          }
        }
      }

      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter(m => !m.optimistic));
    }finally {
    setSending(false); // re-enable button
    setMessage("");     // clear input
  }
  };

  /* ------------------ file handling ------------------ */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  /* ------------------ message bubble component ------------------ */
  const MessageBubble = ({ msg }) => {
    const fromMe = msg.senderId === user._id;
    const isCustomerService = msg.senderRole === "admin";
    const isRightAligned = fromMe;

    return (
      <div
        className={`max-w-[300px] px-3 py-2 rounded-xl text-sm break-words ${
          isRightAligned ? "ml-auto" : "mr-auto"
        } ${
          fromMe
            ? "bg-blue-500 text-white"
            : isCustomerService
            ? "bg-purple-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {isCustomerService && (
          <div className="font-bold text-xs mb-1 opacity-90">Customer Service</div>
        )}

        {msg.fileUrl ? (
          msg.fileType === "image" ? (
            <img
              src={msg.fileUrl}
              alt="Shared"
              className="w-[250px] h-[200px] rounded-md object-cover"
            />
          ) : (
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline flex items-center gap-1"
            >
              <BsPaperclip /> {msg.fileName || "Download File"}
            </a>
          )
        ) : (
          msg.message
        )}

        <div className="text-xs opacity-70 mt-1 text-right">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    );
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="flex md:mt-10 border border-1 h-[600px] max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 font-semibold text-lg border-b">Chats</div>

        {/* Customer Service */}
        <div
          onClick={() => setActiveChat("cs")}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 transition-all mt-2 ${
            activeChat === "cs" ? "bg-gray-100" : ""
          }`}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-lg font-semibold">
              <MdOutlineSupportAgent className="text-3xl"/>
            </div>
          </div>
          <div>
            <div className="font-medium">Customer Service</div>
            <div className="text-sm text-green-500">Admin</div>
          </div>
        </div>
        
        <div className="divider"></div>
        
        {/* Customer */}
        {customer && (
          <div
            onClick={() => setActiveChat("customer")}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 transition-all ${
              activeChat === "customer" ? "bg-gray-100" : ""
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-lg font-semibold">
                {customer?.firstName?.charAt(0)}
              </div>
            </div>
            <div>
              <div className="font-medium">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="text-sm text-green-500">Customer</div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Ride status */}
        {rideStatus && (
          <div
            className={`px-4 py-1 text-sm text-center ${
              canChat ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            Ride status: {rideStatus} {canChat ? "(Messaging enabled)" : "(Messaging disabled)"}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {dedupedMessages.length === 0 && (
            <div className="text-gray-500 text-center mt-20">No messages yet</div>
          )}

          {dedupedMessages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {canChat && (
          <div className="p-3 border-t flex flex-col gap-2">
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
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xl text-gray-600">
                <BsPaperclip />
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </label>
              <label className="cursor-pointer text-xl text-gray-600">
                <MdImage />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={imageInputRef}
                  onChange={handleFileChange}
                />
              </label>

              <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 outline-none"
                placeholder={
                  canChat
                    ? "Type your message..."
                    : "Messaging disabled for current ride status"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={!!selectedFile || !canChat}
              />
                 <button
  onClick={handleSend}
  className={`p-2 rounded-full flex items-center justify-center gap-1 ${
    canChat && !sending
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
  disabled={!canChat || sending}
>
  {sending ? (
   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  ) : (
    <IoSend />
  )}
</button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;