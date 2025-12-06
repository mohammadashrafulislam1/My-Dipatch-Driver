import { createBrowserRouter } from "react-router-dom";
import Driver from "../pages/Driver/Driver";
import Dashboard from "../pages/Driver/Dashboard/Dashboard";
import Order from "../pages/Driver/Dashboard/Orders";
import Earnings from "../pages/Driver/Dashboard/Earnings";
import Chat from "../pages/Driver/Dashboard/Chat";
import Wallet from "../pages/Driver/Dashboard/Wallet";
import Default from "../pages/Driver/Dashboard/Default";
import Reviews from "../pages/Driver/Dashboard/Reviews";
import Login from "../pages/Authentication/Login";
import Signup from "../pages/Authentication/Signup";
import Profile from "../pages/Driver/Profile/Profile";
import Settings from "../pages/Driver/Profile/Setting";
import Notification from "../pages/Driver/Profile/Notification";
import Support from "../pages/Driver/Dashboard/Support";
import RideMap from "../pages/RideMap";
import PrivateRoute from "./PrivateRouter";
import ErrorPage from "../Components/ErrorPage";
import Layout from "../Components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,     // ⭐ Global wrapper
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Driver /> },

      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Default /> },
          { path: "orders", element: <Order /> },
          { path: "reviews", element: <Reviews /> },
          { path: "earnings", element: <Earnings /> },
          { path: "support", element: <Support /> },
          { path: "chat", element: <Chat /> },
          { path: "wallet", element: <Wallet /> },
          { path: "profile", element: <Profile /> },
          { path: "settings", element: <Settings /> },
          { path: "notifications", element: <Notification /> }
        ]
      },

      {
        path: "ride/:id",
        element: (
          <PrivateRoute>
            <RideMap />
          </PrivateRoute>
        )
      },

      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
    ]
  }
]);
