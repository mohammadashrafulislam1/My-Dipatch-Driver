import { Outlet, useLocation } from "react-router-dom";
import GlobalRideStatus from "./GlobalRideStatus";

export default function Layout() {
  const location = useLocation();
  const hideOnRidePage = location.pathname.startsWith("/ride");

  return (
    <div className="app-container relative">
      {!hideOnRidePage && <GlobalRideStatus/>}
      <Outlet />
    </div>
  );
}
