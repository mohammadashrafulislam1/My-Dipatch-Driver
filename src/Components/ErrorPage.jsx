import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

export default function ErrorPage({ message = "Oops! Something went wrong." }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-100 via-white to-red-200 px-6 text-center">
      
      {/* Error Icon */}
      <FaExclamationTriangle className="text-red-600 w-24 h-24 mb-6 animate-pulse" />
      
      {/* Error Message */}
      <h1 className="text-4xl font-bold text-red-700 mb-4">Error</h1>
      <p className="text-gray-700 text-lg mb-8">{message}</p>
      
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition"
      >
        <FaHome className="w-5 h-5" />
        Go Home
      </button>
    </div>
  );
}
