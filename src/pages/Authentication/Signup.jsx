import { useState } from "react";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation or API call here
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9FF] px-4">
      <div className="w-full max-w-md bg-white md:p-8 p-4 rounded-2xl shadow-2xl">
        <img
          src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
          alt="Logo"
          className="w-[150px] mx-auto mb-6"
        />

        <h2 className="text-2xl font-bold text-center text-[#006FFF] mb-6">
          Sign Up As Driver
        </h2>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {/* Password Field with Toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
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

          {/* Confirm Password Field with Toggle */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <div
              className="absolute top-2.5 right-4 text-xl text-gray-600 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#008000] text-white py-2 rounded-full font-semibold hover:bg-green-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#006FFF] font-medium hover:underline">
            Log in
          </a>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          Want to order?{" "}
          <a href="/signup" className="text-[#006FFF] font-medium hover:underline">
            Signup as Customer
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
