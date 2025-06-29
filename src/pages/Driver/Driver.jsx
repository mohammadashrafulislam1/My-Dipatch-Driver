import { BiWalletAlt } from "react-icons/bi";
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

const Driver = () => {
  const mapImage = `https://i.ibb.co/zTNNQ3vf/Chat-GPT-Image-Jun-26-2025-12-48-33-PM.png`;

  return (
    <div className="bg-[#f9f9f9] min-h-screen flex flex-col justify-between relative overflow-hidden">
      {/* Top Bar with Nav and Center Text */}
      <div className="absolute top-0 w-full z-10 flex justify-between items-start p-6">
        {/* Nav Icon - Left */}
        <div className="drawer">
  <input id="my-drawer" type="checkbox" className="drawer-toggle" />
  <div className="drawer-content">
    {/* Page content here */}
    <label htmlFor="my-drawer" className="cursor-pointer">
        <div className="text-2xl text-black">
          <RiMenu2Line />
        </div></label>
  </div>
  <div className="drawer-side">
    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
    <ul className="menu bg-white text-base-content min-h-full w-72 p-4 overflow-y-auto">
      {/* Sidebar content here */}
      <img
        src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
        alt=""
        className="w-[150px] mx-auto mb-5"
      />

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <SlHome className="text-[16px]" />
        Dashboard
      </NavLink>

      <NavLink
        to="/driver"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <IoCarSportOutline className="text-[16px]" />
        Start Working
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <TfiAlignLeft className="text-[16px]" />
        Order Lists
      </NavLink>

      <NavLink
        to="/customers"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <FiUsers className="text-[16px]" />
        Customers
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <TbBrandGoogleAnalytics className="text-[16px]" />
        Analytics
      </NavLink>

      <NavLink
        to="/reviews"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <MdOutlineReviews className="text-[16px]" />
        Reviews
      </NavLink>

      <NavLink
        to="/earnings"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <BsCashCoin className="text-[16px]" />
        Earnings
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <RiRoadMapLine className="text-[16px]" />
        Map
      </NavLink>

      <NavLink
        to="/chat"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <BsChatLeftDots className="text-[16px]" />
        Chat
      </NavLink>

      <NavLink
        to="/wallet"
        className={({ isActive }) =>
          `menu-items poppins-regular flex gap-2 items-center mb-[2px] ${
            isActive ? 'bg-[#006eff2a] text-[#006FFF]' : ''
          }`
        }
      >
        <BiWalletAlt className="text-[16px]" />
        Wallet
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

        {/* Center Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
        <img src="https://i.ibb.co/6R7N010X/Logo-transparent.png" alt="" className="w-[150px] mx-auto" />
          <h1 className="text-2xl md:text-4xl text-black poppins-semibold mb-1">Become a Driver</h1>
          <p className="text-sm md:text-lg text-black poppins-regular mb-2">
          Start earning now by errands or making deliveries.
          </p>
          <button className="bg-blue-600 hover:bg-blue-800 text-white poppins-regular py-2 px-4 rounded-lg transition">
            Get Started
          </button>
        </div>
      </div>

      {/* Map Background */}
      <div className="absolute bottom-0 w-full h-[300px] sm:h-[400px] overflow-hidden z-0">
        <img
          src={mapImage}
          alt="Map background"
          className="w-full h-full object-cover opacity-70"
        />

        {/* Car Icon */}
        <div className="absolute left-10 bottom-10 bg-blue-600 p-3 rounded-full text-white text-xl shadow-lg z-10">
          <FaCar />
        </div>

        {/* Location Pin Icon */}
        <div className="absolute right-10 top-10 bg-black p-3 rounded-full text-white text-xl shadow-lg z-10">
          <FaMapMarkerAlt />
        </div>
      </div>
    </div>
  );
};

export default Driver;
