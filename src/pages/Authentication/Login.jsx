import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login with:", formData);
  };

  const handleGoogleLogin = () => {
    console.log("Login with Google");
  };

  const handleFacebookLogin = () => {
    console.log("Login with Facebook");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9FF] px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-4 rounded-2xl shadow-xl">
        <img
          src="https://i.ibb.co/TxC947Cw/thumbnail-Image-2025-07-09-at-2-10-AM-removebg-preview.png"
          alt="Logo"
          className="w-[120px] sm:w-[150px] mx-auto mb-6"
        />

        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#006FFF] mb-6">
          Login to Your Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF] text-sm sm:text-base"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF] text-sm sm:text-base"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div
              className="absolute top-2.5 right-4 text-xl text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#008000] text-white py-2 rounded-full font-semibold hover:bg-green-700 transition text-sm sm:text-base"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2 text-sm font-medium hover:bg-gray-50"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-2 text-sm font-medium text-[#1877F2] hover:bg-gray-50"
          >
            <FaFacebookF className="text-xl" />
            Continue with Facebook
          </button>
        </div>

        {/* Extra Links */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-[#006FFF] font-medium hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
