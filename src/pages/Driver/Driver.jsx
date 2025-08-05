import { useState } from "react";
import { BiSupport, BiWalletAlt } from "react-icons/bi";
import { BsCashCoin, BsChatLeftDots } from "react-icons/bs";
import { FaCar, FaMapMarkerAlt } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { IoCarSportOutline } from "react-icons/io5";
import { MdOutlineReviews } from "react-icons/md";
import { RiMenu2Line, RiRoadMapLine } from "react-icons/ri";
import { SlHome } from "react-icons/sl";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { TfiAlignLeft } from "react-icons/tfi";
import { VscSignOut } from "react-icons/vsc";
import { NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Driver = () => {
  const position = [50.4452, -104.6189]; // Regina, SK
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans bg-white">
      {/* Top Bar and Menu */}
      <div className="absolute top-0 w-full z-10 flex justify-between items-start p-6 ">
        <div className="drawer hidden md:block">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content w-full p-6">
            <label htmlFor="my-drawer" className="cursor-pointer">
              <div className="text-2xl text-black">
                <RiMenu2Line />
              </div>
            </label>
          </div>
          <div className="drawer-side z-30">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-white text-base-content min-h-full w-72 p-4 overflow-y-auto">
              <img
                src="https://i.ibb.co/TxC947Cw/thumbnail-Image-2025-07-09-at-2-10-AM-removebg-preview.png"
                alt=""
                className="w-[150px] mx-auto mb-5"
              />
              {[
                { to: "/dashboard", icon: <SlHome />, label: "Dashboard" },
                { to: "/", icon: <IoCarSportOutline />, label: "Start Working" },
                { to: "/dashboard/orders", icon: <TfiAlignLeft />, label: "Order Lists" },
                { to: "/dashboard/reviews", icon: <MdOutlineReviews />, label: "Reviews" },
                { to: "/dashboard/earnings", icon: <BsCashCoin />, label: "Earnings" },
                { to: "/dashboard/chat", icon: <BsChatLeftDots />, label: "Chat" },
                { to: "/dashboard/wallet", icon: <BiWalletAlt />, label: "Wallet" },
                { to: "/dashboard/support", icon: <BiSupport />, label: "Support" },
              ].map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `menu-items poppins-regular text-black  dark:text-black  flex gap-2 items-center mb-[2px] ${
                      isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                    }`
                  }
                >
                  {icon}
                  {label}
                </NavLink>
              ))}
              <div className="divider mt-[20px] mb-0"></div>
              <NavLink
                to="/logout"
                className="pl-[12px] pt-[6px] poppins-regular flex gap-2 items-center"
              >
                <VscSignOut className="text-[16px]" />
                Sign Out
              </NavLink>
            </ul>
          </div>
        </div>

        {/* Center Card */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-32 
         max-w-lg md:w-[90vw] w-[90%] bg-white bg-opacity-90 backdrop-blur-md rounded-3xl md:p-10 p-5 shadow-2xl text-center z-20">
          <img
            src="https://i.ibb.co/TxC947Cw/thumbnail-Image-2025-07-09-at-2-10-AM-removebg-preview.png"
            alt="Logo"
            className="md:w-40 w-20 mx-auto md:mb-6 mb-2"
          />
          <h1 className="md:text-4xl text-2xl font-extrabold text-gray-900 md:mb-4 mb-2 poppins-semibold">
            Become a Driver
          </h1>
          <p className="md:text-lg text-[14px] text-gray-700 poppins-regular md:mb-8 mb-3 px-6">
            Start earning now by errands or making deliveries.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 
          hover:to-blue-600 text-white md:text-lg text-md font-semibold poppins-regular py-3 px-8 rounded-full shadow-lg 
          transition duration-300 transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>

      {/* ==== MOBILE BOTTOM NAVIGATION ==== */}
<div className="fixed bottom-0 left-0 right-0 bg-white shadow border-t border-gray-200 md:hidden z-50">
  <div className="flex justify-between items-center px-6 py-2">

    {/* Dashboard */}
    <NavLink
      to="/dashboard"
      className={({ isActive }) =>
        `flex flex-col items-center text-sm ${
          isActive ? "text-blue-600" : "text-gray-500"
        }`
      }
      onClick={() => setShowDropdown(false)}
    >
      <SlHome className="text-2xl" />
      <span>Dashboard</span>
    </NavLink>

    {/* Start Working */}
    <NavLink
      to="/"
      className={({ isActive }) =>
        `flex flex-col items-center text-sm ${
          isActive ? "text-blue-600" : "text-gray-500"
        }`
      }
      onClick={() => setShowDropdown(false)}
    >
      <IoCarSportOutline className="text-2xl" />
      <span className="text-xs mt-1">Start</span>
    </NavLink>

    {/* Chat */}
    <NavLink
      to="/dashboard/chat"
      className={({ isActive }) =>
        `flex flex-col items-center text-sm ${
          isActive ? "text-blue-600" : "text-gray-500"
        }`
      }
      onClick={() => setShowDropdown(false)}
    >
      <BsChatLeftDots className="text-2xl" />
      <span>Chat</span>
    </NavLink>

    {/* Avatar Dropdown */}
    <div className="relative group">
      <div
        className="cursor-pointer flex flex-col items-center text-sm text-gray-500"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <img
          src="https://i.pravatar.cc/40"
          alt="Avatar"
          className="w-7 h-7 rounded-full"
        />
        <span>More</span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute bottom-12 right-0 w-48 bg-white border rounded-lg shadow-lg p-2 space-y-1 z-50">
          <NavLink
            to="/dashboard/orders"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <TfiAlignLeft className="text-orange-500 text-lg" />
            Orders
          </NavLink>
          <NavLink
            to="/dashboard/reviews"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <MdOutlineReviews className="text-purple-600 text-lg" />
            Reviews
          </NavLink>
          <NavLink
            to="/dashboard/earnings"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <BsCashCoin className="text-yellow-500 text-lg" />
            Earnings
          </NavLink>
          <NavLink
            to="/dashboard/wallet"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <BiWalletAlt className="text-blue-500 text-lg" />
            Wallet
          </NavLink>
          <NavLink
            to="/dashboard/support"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <BiSupport className="text-green-600 text-lg" />
            Support
          </NavLink>
          <NavLink
            to="/logout"
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => setShowDropdown(false)}
          >
            <VscSignOut className="text-red-600 text-lg" />
            Sign Out
          </NavLink>
        </div>
      )}
    </div>
  </div>
</div>


      {/* Live Map - Regina, SK */}
      <div className="absolute bottom-0 w-full h-[100%] lg:h-[540px] md:h-[430px] overflow-hidden z-0 rounded-t-3xl shadow-inner">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>Regina, SK - Start Driving!</Popup>
          </Marker>
        </MapContainer>

        {/* Car Icon */}
  <div className="absolute left-12 bottom-12 z-[1000] bg-blue-600 p-4 rounded-full text-white text-3xl shadow-xl animate-bounce">
    <FaCar />
  </div>

  {/* Location Pin Icon */}
  <div className="absolute right-12 top-12 z-[1000] bg-black p-4 rounded-full text-white text-3xl shadow-xl animate-pulse">
    <FaMapMarkerAlt />
  </div>
      </div>
    </div>
  );
};

export default Driver;
