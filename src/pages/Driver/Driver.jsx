// Driver.jsx - UPDATED
import { useEffect, useState } from "react";
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
import { Link, NavLink } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import DriverNotification from "../../Components/DriverNotification";
import useAuth from "../../Components/useAuth";
import { endPoint } from "../../Components/ForAPIs";
import FloatingDeactivateBtn from "../../Components/FloatingDeactivateBtn";
import axios from "axios";
import { useActiveRide } from "../../contexts/ActiveRideContext";
import LoadingScreen from "../../Components/LoadingScreen";

// Fix Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Driver = () => {
  const [position, setPosition] = useState([50.4452, -104.6189]);
  const [cityName, setCityName] = useState("Regina, SK");
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, loading, logout } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  
  const { isActive: globalActive, activeRide, startRide, endRide } = useActiveRide();
 if(loading){
  <LoadingScreen/>
 }
  const handleStartRide = async () => {
    try {
      await axios.put(`${endPoint}/user/${user._id}/status`, { status: "active" });
      setIsActive(true);
      // Start global ride with driver info
      startRide({
        status: "active",
        driverId: user._id,
        driverName: `${user.firstName} ${user.lastName}`,
        type: "driver_available",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error activating driver:", err);
    }
  };

  const handleLogout = async () => {
    try {
      // End any active ride on logout
      if (isActive || globalActive) {
        endRide();
      }
      await logout();
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

 // In the Driver component, modify the isActive logic:
// Sync local state with global state
useEffect(() => {
  if (globalActive && activeRide) {
    // Only set active if it's a real ride, not just driver available
    if (activeRide.type === "active_ride" && 
        ["accepted", "on_the_way", "in_progress"].includes(activeRide.status)) {
      setIsActive(true);
    } else if (activeRide.driverId === user?._id && activeRide.type === "driver_available") {
      setIsActive(true);
    }
  }
}, [globalActive, activeRide, user?._id]);
useEffect(() => {
  if (user && !globalActive) {
    startRide({
      driverId: user._id,
      driverName: `${user.firstName} ${user.lastName}`,
      type: "driver_available",
      status: user.status === "active" ? "active" : "inactive",
      timestamp: new Date().toISOString()
    });
  }
}, [user, globalActive]);
// ✅ Auto reload ONCE if ride state isn't showing after login
useEffect(() => {
  const hasReloaded = sessionStorage.getItem("driverPageReloaded");

  if (user && !activeRide && !hasReloaded) {
    console.log("🔄 Reloading once to fix missing ride state...");
    sessionStorage.setItem("driverPageReloaded", "true");
    window.location.reload();
  }
}, [user, activeRide]);

  // Use the global active ride context

  // Fetch city coordinates and user status
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user) {
        setStatusLoading(false);
        return;
      }

      setStatusLoading(true);
      try {
        // Set city position if available
        if (user?.city) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(user?.city)}`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              setPosition([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
              setCityName(user?.city);
            }
          } catch (err) {
            console.error("Error fetching city coordinates:", err);
          }
        }

        // Set active status
        if (user?.status === "active") {
          setIsActive(true);
        } else {
          setIsActive(false);
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
        setIsActive(false);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchUserStatus();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans bg-white">
      <DriverNotification isActive={isActive} />

      {/* GlobalRideStatus is now in main.jsx, so we don't need it here */}

      {isActive && (
        <FloatingDeactivateBtn
          userId={user?._id}
          onDeactivated={() => {
            setIsActive(false);
            endRide(); // Also end the global ride
          }}
        />
      )}
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
              {user ? (
  <div
    className="pl-[12px] pt-[6px] poppins-regular flex gap-2 items-center btn cursor-pointer"
    onClick={handleLogout}
  >
    {user.profileImage ? (
      <img
        src={user.profileImage}
        alt="Profile"
        className="w-7 h-7 rounded-full object-cover"
      />
    ) : (
      <VscSignOut className="text-[16px]" />
    )}
    <span className="ml-2">
      {loading ? "Signing Out..." : "Sign Out"}
    </span>
  </div>
) : (
  <Link
    to="/signup"
    className="pl-[12px] pt-[6px] pb-[6px] poppins-regular flex gap-2 items-center btn cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Get Started
  </Link>
)}


            </ul>
          </div>
        </div>

      {/* Center Card */}
      {/* === Center UI === */}
 {statusLoading ? (
  // Show loader while fetching status
  <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30">
    <span className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full shadow-lg font-semibold animate-pulse">
      Checking status...
    </span>
  </div>
) : user ? (
  isActive ? (
    <>
      {/* ✅ Active Status Badge */}
      <div className="absolute top-6 left-10 md:left-1/2 md:-translate-x-1/2 z-30">
        <span className="bg-green-600 text-white px-6 py-2 rounded-full shadow-lg font-semibold">
          🚖 You are Active – Waiting for Rides
        </span>
      </div>

      {/* ✅ Floating Deactivate Button */}
      <FloatingDeactivateBtn
        userId={user._id}
        onDeactivated={() => setIsActive(false)}
      />
    </>
  ) : (
    /* ✅ Glass Card (only when inactive) */
    <div
      className="absolute left-1/2 transform -translate-x-1/2 top-32
        max-w-lg md:w-[90vw] w-[90%] 
        bg-white/40 backdrop-blur-md border border-white/30
        rounded-3xl md:p-10 p-5 shadow-2xl text-center z-20"
    >
      <img
        src="https://i.ibb.co/TxC947Cw/thumbnail-Image-2025-07-09-at-2-10-AM-removebg-preview.png"
        alt="Logo"
        className="md:w-40 w-20 mx-auto md:mb-6 mb-2"
      />
      <h1 className="md:text-4xl text-2xl font-bold text-gray-900 md:mb-4 mb-2 poppins-semibold">
        Welcome, <br />
        <span className="md:text-3xl text-xl font-semibold">
          {user.firstName} {user.lastName}!
        </span>
      </h1>
      <p className="md:text-[16px] text-[14px] text-gray-700 poppins-regular md:mb-2 mb-3 px-6">
        Your city: {cityName}.
      </p>
      <button
        onClick={handleStartRide}
        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 
          hover:to-green-600 text-white md:text-lg text-md font-semibold 
          poppins-regular py-3 px-8 rounded-full shadow-lg transition 
          duration-300 transform hover:scale-105"
      >
        Start Ride
      </button>
    </div>
  )
) : (
  /* Guest / Not Logged In */
  <div
    className="absolute left-1/2 transform -translate-x-1/2 md:top-32 top-56
      max-w-lg md:w-[90vw] w-[90%] 
      bg-white/40 backdrop-blur-md border border-white/30
      rounded-3xl md:p-10 p-5 shadow-2xl text-center z-20"
  >
    
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
    <Link to="/login">
      <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 
        hover:to-blue-600 text-white md:text-lg text-md font-semibold poppins-regular py-3 px-8 
        rounded-full shadow-lg transition duration-300 transform hover:scale-105">
        Get Started
      </button>
    </Link>
  </div>
)}


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


{/* Live Map */}
      <div className="absolute bottom-0 w-full h-[80%] lg:h-[540px] md:h-[430px] overflow-hidden z-0 rounded-t-3xl shadow-inner">
        <MapContainer center={position} zoom={13} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{cityName} - Start Driving!</Popup>
          </Marker>
        </MapContainer>

        {/* Car Icon */}
        <div className="absolute left-12 md:bottom-12 bottom-16 z-[1000] bg-blue-600 p-4 rounded-full 
        text-white text-3xl shadow-xl animate-bounce">
          <FaCar />
        </div>

        {/* Location Pin */}
        <div className="absolute right-12 top-12 z-[1000] bg-black p-4 rounded-full text-white text-3xl shadow-xl animate-pulse">
          <FaMapMarkerAlt />
        </div>
      </div>
    </div>
  );
};

export default Driver;
