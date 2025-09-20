import { FaCarSide } from "react-icons/fa";

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      
      {/* Animated Car */}
      <div className="relative w-24 h-24 mb-6">
        <FaCarSide className="w-16 h-16 text-orange-500 animate-bounce" />
      </div>

      {/* Loading Text */}
      <p className="text-gray-700 text-lg font-semibold animate-pulse">
        Loading your ride…
      </p>

      {/* Optional Dots */}
      <div className="flex mt-4 space-x-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-75"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></span>
        <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}
