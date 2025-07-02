import { useState } from "react";

const Settings = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1 (123) 456-7890",
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved:", formData);
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Preferences</h3>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label htmlFor="notifications" className="text-sm text-gray-700">
              Enable email notifications
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => alert("Cancelled changes.")}
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
