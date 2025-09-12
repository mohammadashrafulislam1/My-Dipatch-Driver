import { useState } from "react";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import useAuth from "../../Components/useAuth";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";

const Signup = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
    role: "driver",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const cityName = place.formatted_address || place.name;
      setFormData((prev) => ({ ...prev, city: cityName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    const [firstName, ...lastNameParts] = formData.name.trim().split(" ");
    const lastName = lastNameParts.length > 0 ? lastNameParts.join(" ") : "N/A";

    const formPayload = new FormData();
    formPayload.append("firstName", firstName);
    formPayload.append("lastName", lastName);
    formPayload.append("email", formData.email);
    formPayload.append("phone", formData.phone);
    formPayload.append("city", formData.city);
    formPayload.append("password", formData.password);
    formPayload.append("role", formData.role);
    if (profileImage) formPayload.append("profileImage", profileImage);

    try {
      await signup(formPayload);
      toast.success("Driver signup successful 🚖 Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Driver Signup error:", err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || "Error signing up ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F9FF] px-4 relative">
      <Toaster position="top-right" />
  {/* Background */}
  <div className="absolute inset-0">
    <img
      src="https://i1.pickpik.com/photos/255/726/486/city-dashboard-driver-driving-preview.jpg" 
      alt="City Background"
      className="w-full h-full object-cover"
    />
    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
  </div>

      <div className="w-full max-w-md bg-white md:p-8 p-6 rounded-2xl shadow-2xl relative my-10">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src="https://i.ibb.co/TxC947Cw/thumbnail-Image-2025-07-09-at-2-10-AM-removebg-preview.png"
          alt="Logo"
          className="w-[120px] mx-auto mb-6"
        />

        <h2 className="text-2xl font-bold text-center text-[#006FFF] mb-6">
          Sign Up as Driver
        </h2>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute top-3 left-3 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* City with Google Autocomplete */}
          <div className="relative">
            <FaMapMarkerAlt className="absolute top-3 left-3 text-gray-400" />
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Enter your city/location"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
                  value={formData.city}
                  onChange={handleChange}
                  name="city"
                  required
                />
              </Autocomplete>
            </LoadScript>
          </div>

          {/* Profile Image */}
          <div className="relative">
            <FaImage className="absolute top-4 left-3 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full pl-10 pr-4 py-3 h-[55px] border rounded-xl"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div
              className="absolute top-3 right-3 text-xl text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006FFF]"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <div
              className="absolute top-3 right-3 text-xl text-gray-600 cursor-pointer"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <IoEyeOffSharp /> : <IoEyeSharp />}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-[#006FFF] font-medium hover:underline">
            Log in
          </a>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          Want to ride?{" "}
          <a href="/signup" className="text-[#006FFF] font-medium hover:underline">
            Sign up as Customer
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
