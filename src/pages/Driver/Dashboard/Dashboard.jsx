import { useState } from "react";
import {
  BiWalletAlt,
} from "react-icons/bi";
import {
  BsCashCoin,
  BsChatLeftDots,
} from "react-icons/bs";
import {
  FiBell,
  FiMessageSquare,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import {
  IoCarSportOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { MdOutlineReviews } from "react-icons/md";
import { RiRoadMapLine } from "react-icons/ri";
import { SlHome } from "react-icons/sl";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { TfiAlignLeft } from "react-icons/tfi";
import { VscSignOut } from "react-icons/vsc";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/dashboard/orders": "Order Lists",
    "/dashboard/customers": "Customers",
    "/dashboard/analytics": "Analytics",
    "/dashboard/reviews": "Reviews",
    "/dashboard/earnings": "Earnings",
    "/dashboard/map": "Map",
    "/dashboard/chat": "Chat",
    "/dashboard/wallet": "Wallet",
  };
  const matchedPath = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((path) => location.pathname.startsWith(path));

  const currentTitle = pageTitles[matchedPath] || "Dashboard";

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <SlHome /> },
    { path: "/", label: "Start Working", icon: <IoCarSportOutline /> },
    { path: "orders", label: "Order Lists", icon: <TfiAlignLeft /> },
    { path: "customers", label: "Customers", icon: <FiUsers /> },
    { path: "analytics", label: "Analytics", icon: <TbBrandGoogleAnalytics /> },
    { path: "reviews", label: "Reviews", icon: <MdOutlineReviews /> },
    { path: "earnings", label: "Earnings", icon: <BsCashCoin /> },
    { path: "map", label: "Map", icon: <RiRoadMapLine /> },
    { path: "chat", label: "Chat", icon: <BsChatLeftDots /> },
    { path: "wallet", label: "Wallet", icon: <BiWalletAlt /> },
  ];

  return (
    <div className="flex w-full overflow-hidden">

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="absolute top-4 left-4 z-30 p-1 rounded-md bg-[#FDFDFD] text-gray-700 lg:hidden"
        aria-label="Open menu"
      >
        <IoMenuOutline size={24} />
      </button>
      {/* Sidebar */}
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen w-72 fixed bg-white shadow-[0_0_36.2px_rgba(0,0,0,0.05)] p-4 z-20 flex-col">
        <img
          src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
          alt="Logo"
          className="w-[150px] mx-auto mb-6"
        />
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {menuItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md transition font-medium ${
                  isActive
                    ? "bg-[#006eff2a] text-[#006FFF]"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              onClick={() => setSidebarOpen(false)} // close on click
            >
              <span className="text-[16px]">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
        <div className="divider mt-6 mb-2" />
        <NavLink
          to="/logout"
          className="flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-100 rounded-md"
          onClick={() => setSidebarOpen(false)}
        >
          <VscSignOut className="text-[16px]" />
          Sign Out
        </NavLink>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="relative bg-white w-64 p-4 flex flex-col overflow-y-auto shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="mb-6 self-end text-gray-700 hover:text-gray-900"
              aria-label="Close menu"
            >
              <IoCloseOutline size={28} />
            </button>

            <img
              src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
              alt="Logo"
              className="w-[150px] mx-auto mb-6"
            />
            <div className="flex flex-col gap-1 flex-1">
              {menuItems.map(({ path, label, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md transition font-medium ${
                      isActive
                        ? "bg-[#006eff2a] text-[#006FFF]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-[16px]">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="divider mt-6 mb-2" />
            <NavLink
              to="/logout"
              className="flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              <VscSignOut className="text-[16px]" />
              Sign Out
            </NavLink>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 lg:ml-72 min-h-screen bg-[#FDFDFD] overflow-hidden">
        {/* Topbar */}
        <div className="absolute md:ml-6 ml-12 mr-2 fixed md:bg-[#FDFDFD] top-6 md:top-0 left-0 right-0 h-14 
        flex flex-col-reverse md:flex-row md:items-center items-end justify-between lg:px-6 md:pr-3 md:pl-14 lg:pl-0 z-10 lg:left-72">
          <h1 className="text-xl font-semibold text-gray-800 md:mt-0 mt-2">{currentTitle}</h1>
          <div className="flex items-center md:gap-4 text-gray-600">
           <div className="flex gap-4">
           <div className="bg-[#006eff2a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
              <FiBell className="text-xl cursor-pointer text-[#006FFF]" />
              <div className="bg-[#006FFF] text-white poppins-light text-[10px] px-1 rounded-full absolute top-[-7px] right-[-7px] border-[#fff] border-2">
                0
              </div>
            </div>
            <div className="bg-[#006eff2a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
              <FiMessageSquare className="text-xl cursor-pointer text-[#006FFF]" />
              <div className="bg-[#006FFF] text-white poppins-light text-[10px] px-1 rounded-full absolute top-[-7px] right-[-7px] border-[#fff] border-2">
                0
              </div>
            </div>
            <div className="bg-[#ff04002a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
              <FiSettings className="text-xl cursor-pointer text-[#FF0500]" />
              <div className="bg-[#FF0500] text-white poppins-light text-[10px] px-1 rounded-full absolute top-[-7px] right-[-7px] border-[#fff] border-2">
                0
              </div>
            </div>
           </div>
            <div className="divider lg:divider-horizontal mx-0 my-0 block md:hidden"></div>
            <div className="md:flex items-center gap-2 hidden">
              <span className="text-sm font-medium">John Doe</span>
              <div className="avatar avatar-online">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="avatar"
                  className="w-8 h-8 rounded-full "
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:hidden mt-10 pl-5">
              <span className="text-sm font-medium">John Doe</span>
              <div className="avatar avatar-online">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="avatar"
                  className="w-8 h-8 rounded-full "
                />
              </div>
            </div>
      
        {/* Dynamic Page Content */}
        <main className="pt-3 md:pt-14 mt-0 md:mt-2 lg:mt-0 px-6 pb-6 min-h-screen bg-[#FDFDFD]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
