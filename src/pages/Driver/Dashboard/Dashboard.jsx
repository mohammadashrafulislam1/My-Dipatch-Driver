import { BiWalletAlt } from "react-icons/bi";
import { BsCashCoin, BsChatLeftDots } from "react-icons/bs";
import { FiBell, FiMessageSquare, FiSettings, FiUsers } from "react-icons/fi";
import { IoCarSportOutline } from "react-icons/io5";
import { MdOutlineReviews } from "react-icons/md";
import { RiRoadMapLine } from "react-icons/ri";
import { SlHome } from "react-icons/sl";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { TfiAlignLeft } from "react-icons/tfi";
import { VscSignOut } from "react-icons/vsc";
  import { NavLink, Outlet, useLocation } from "react-router-dom";
  
  const Dashboard = () => {
    const location = useLocation();
  
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


    
      console.log(currentTitle)
  
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
      <div className="flex">
        {/* Sidebar */}
        <div className="h-screen w-72 fixed bg-white shadow-[0_0_36.2px_rgba(0,0,0,0.05)] p-4 z-20">
          <img
            src="https://i.ibb.co/6R7N010X/Logo-transparent.png"
            alt="Logo"
            className="w-[150px] mx-auto mb-6"
          />
          <div className="flex flex-col gap-1">
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
          >
            <VscSignOut className="text-[16px]" />
            Sign Out
          </NavLink>
        </div>
  
        {/* Content Area */}
        <div className="flex-1 ml-72">
          {/* Topbar */}
          <div className="fixed top-0 left-72 right-0 h-16 flex items-center justify-between px-6 z-10">
            <h1 className="text-xl font-semibold text-gray-800">{currentTitle}</h1>
            <div className="flex items-center gap-4 text-gray-600">
                <div className=" bg-[#006eff2a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
                <FiBell className="text-xl cursor-pointer text-[#006FFF]" />
                <div className="bg-[#006FFF] text-white poppins-light text-[10px] px-1 rounded-full
                absolute top-[-7px] right-[-7px] border-[#fff] border-2">0</div>
                </div>
                <div className=" bg-[#006eff2a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
              <FiMessageSquare className="text-xl cursor-pointer text-[#006FFF]" />
                <div className="bg-[#006FFF] text-white poppins-light text-[10px] px-1 rounded-full
                absolute top-[-7px] right-[-7px] border-[#fff] border-2">0</div></div>
              <div className=" bg-[#ff04002a] w-[36px] h-[36px] flex items-center justify-center rounded-lg relative">
              <FiSettings className="text-xl cursor-pointer text-[#FF0500]" />
                <div className="bg-[#FF0500] text-white poppins-light text-[10px] px-1 rounded-full
                absolute top-[-7px] right-[-7px] border-[#fff] border-2">0</div></div>
              <div className="divider lg:divider-horizontal mx-0 my-0"></div>
              <div className="flex items-center gap-2">
              <span className="text-sm font-medium">John Doe</span>
              <div className="avatar avatar-online">
                <img
                  src="https://i.pravatar.cc/40"
                  alt="avatar"
                  className="w-8 h-8 rounded-full "
                /></div>
              </div>
            </div>
          </div>
  
          {/* Dynamic Page Content */}
          <main className="pt-12 px-6 pb-6 min-h-screen bg-[#FDFDFD]">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  