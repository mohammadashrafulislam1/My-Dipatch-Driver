import { useState } from "react";
import axios from "axios";
import { FaPowerOff } from "react-icons/fa";
import { endPoint } from "./ForAPIs";

const FloatingDeactivateBtn = ({ userId, onDeactivated }) => {
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await axios.put(`${endPoint}/user/${userId}/status`, { status: "inactive" });
      if (onDeactivated) onDeactivated(); // callback to parent
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Error deactivating driver:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeactivate}
      disabled={loading}
      className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 
        text-white p-5 rounded-full shadow-xl z-[1000] transition 
        duration-300 transform hover:scale-105 flex items-center justify-center"
    >
      <FaPowerOff className="text-2xl" />
    </button>
  );
};

export default FloatingDeactivateBtn;
