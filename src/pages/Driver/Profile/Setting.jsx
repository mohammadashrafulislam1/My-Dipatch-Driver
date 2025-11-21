import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../Components/useAuth";
import { endPoint } from "../../../Components/ForAPIs";
import { FaPen } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import GoogleAddressInput from "../../../Components/GoogleAddressInput";

const Settings = () => {
  const { user, loading, logout, token } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
  });

  const [notifications, setNotifications] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Load user data only once
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
      });
      setImagePreview(user.profileImage || "");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        form.append(key, value)
      );

      if (selectedFile) form.append("profileImage", selectedFile);
      form.append("notifications", notifications);

      // choose correct URL based on role
      const updateUrl =
        user.role === "driver"
          ? `${endPoint}/user/update/driver`
          : `${endPoint}/user/update/customer`;

      const res = await axios.put(updateUrl, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Profile updated successfully!");
      console.log(res.data.user);

    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Error updating your profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">Loading account settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-500 mb-4">User not found. Please log in again.</p>
        <button
          onClick={logout}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h2>
      <Toaster position="top-right" />

      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={imagePreview}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-2 rounded-full cursor-pointer">
            <FaPen />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-800">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-sm text-gray-500">{user.role?.toUpperCase()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Profile Information
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600">City / Address</label>
            <GoogleAddressInput
  value={formData.city}
  onSelect={(address) => {
    setFormData((prev) => ({
      ...prev,
      city: address, // 🎯 ONLY STORE ADDRESS
    }));
  }}
/>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Preferences
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5"
            />
            <label className="text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white ${
              saving
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                city: user.city || "",
              });
              setImagePreview(user.profileImage || "");
              setSelectedFile(null);
            }}
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
