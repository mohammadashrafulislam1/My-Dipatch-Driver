const Profile = () => {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-xl mt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500">
            <img
              src="https://i.pravatar.cc/150?img=3"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
  
          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
            <p className="text-gray-600">johndoe@example.com</p>
            <p className="text-gray-600 mt-1">+1 (123) 456-7890</p>
  
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                Edit Profile
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200">
                Change Password
              </button>
            </div>
          </div>
        </div>
  
        {/* Additional Info */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">About</h3>
          <p className="text-gray-600 text-sm">
            Hello! I'm John, a professional driver with 5+ years of experience in safe, efficient
            transportation. I’m always on time and prioritize customer satisfaction.
          </p>
        </div>
      </div>
    );
  };
  
  export default Profile;
  