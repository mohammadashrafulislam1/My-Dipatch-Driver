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

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const Driver = () => {
  const position = [50.4452, -104.6189]; // Regina, SK

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Top Bar and Menu */}
      <div className="absolute top-0 w-full z-10 flex justify-between items-start p-6">
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content bg-[#f9f9f9] w-fit">
            <label htmlFor="my-drawer" className="cursor-pointer">
              <div className="text-2xl text-black">
                <RiMenu2Line />
              </div>
            </label>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-white text-base-content min-h-full w-72 p-4 overflow-y-auto">
              <img
                src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
                alt=""
                className="w-[150px] mx-auto mb-5"
              />
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <SlHome className="text-[16px]" />
                Dashboard
              </NavLink>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <IoCarSportOutline className="text-[16px]" />
                Start Working
              </NavLink>
              <NavLink
                to="/dashboard/orders"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <TfiAlignLeft className="text-[16px]" />
                Order Lists
              </NavLink>
              <NavLink
                to="/dashboard/reviews"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <MdOutlineReviews className="text-[16px]" />
                Reviews
              </NavLink>
              <NavLink
                to="/dashboard/earnings"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <BsCashCoin className="text-[16px]" />
                Earnings
              </NavLink>
              <NavLink
                to="/dashboard/chat"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <BsChatLeftDots className="text-[16px]" />
                Chat
              </NavLink>
              <NavLink
                to="/dashboard/wallet"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <BiWalletAlt className="text-[16px]" />
                Wallet
              </NavLink>
              <NavLink
                to="/dashboard/support"
                className={({ isActive }) =>
                  `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
                    isActive ? "bg-[#006eff2a] text-[#006FFF]" : ""
                  }`
                }
              >
                <BiSupport
                 className="text-[16px]" />
                Support
              </NavLink>
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
        <div className="absolute left-1/2 transform -translate-x-1/2 top-24 max-w-lg w-[90vw] bg-white bg-opacity-90 backdrop-blur-md rounded-3xl p-10 shadow-2xl text-center z-20">
          <img
            src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
            alt="Logo"
            className="w-40 mx-auto mb-6"
          />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 poppins-semibold">
            Become a Driver
          </h1>
          <p className="text-lg text-gray-700 poppins-regular mb-8 px-6">
            Start earning now by errands or making deliveries.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold poppins-regular py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
            Get Started
          </button>
        </div>
      </div>

      {/* Live Map - Regina SK */}
      <div className="absolute bottom-0 w-full h-[350px] sm:h-[450px] overflow-hidden z-0 rounded-t-3xl shadow-inner">
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
        <div className="absolute left-12 bottom-12 bg-blue-600 p-4 rounded-full text-white text-3xl shadow-xl animate-bounce z-10">
          <FaCar />
        </div>

        {/* Location Pin Icon */}
        <div className="absolute right-12 top-12 bg-black p-4 rounded-full text-white text-3xl shadow-xl z-10 animate-pulse">
          <FaMapMarkerAlt />
        </div>
      </div>
    </div>
  );
};

export default Driver;