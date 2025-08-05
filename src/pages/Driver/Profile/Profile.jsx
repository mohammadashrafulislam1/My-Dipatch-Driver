import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-2xl mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Personal Info</h2>

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-600 shadow-md">
          <img
            src="https://i.pravatar.cc/150?img=3"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info Fields */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <p className="text-lg text-gray-800 font-medium">John Doe</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Phone Number</label>
          <p className="text-lg text-gray-800 font-medium">+1 (123) 456-7890</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-lg text-gray-800 font-medium">johndoe@example.com</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <NavLink to="/dashboard/settings">
          <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </NavLink>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200 border transition"
        >
          Change Password
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="relative">
                <label className="text-sm text-gray-600">Current Password</label>
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 pr-10"
                  placeholder="Enter current password"
                />
                <span
                  className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPassword.current ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="text-sm text-gray-600">New Password</label>
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 pr-10"
                  placeholder="Enter new password"
                />
                <span
                  className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="text-sm text-gray-600">Confirm New Password</label>
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 pr-10"
                  placeholder="Re-enter new password"
                />
                <span
                  className="absolute right-3 top-[38px] text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
