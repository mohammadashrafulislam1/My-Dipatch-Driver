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
import Support from "../pages/Driver/Dashboard/Support";
import RideMap from "../pages/RideMap";
import PrivateRoute from "./PrivateRouter";
import ErrorPage from "../Components/ErrorPage";
import Layout from "../Components/Layout";
import Notification from "../pages/Driver/Profile/Notification";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,     // ⭐ Global wrapper
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <Driver /> },

      {
        path: "dashboard",
        element: <PrivateRoute><Dashboard /></PrivateRoute>,
        children: [
          { index: true, element: <PrivateRoute><Default /> </PrivateRoute>},
          { path: "orders", element: <PrivateRoute><Order /></PrivateRoute> },
          { path: "reviews", element: <PrivateRoute><Reviews /></PrivateRoute> },
          { path: "earnings", element: <PrivateRoute><Earnings /></PrivateRoute>},
          { path: "support", element:<PrivateRoute> <Support /></PrivateRoute> },
          { path: "chat", element:<PrivateRoute> <Chat /></PrivateRoute> },
          { path: "wallet", element: <PrivateRoute><Wallet /></PrivateRoute> },
          { path: "profile", element: <PrivateRoute><Profile /> </PrivateRoute>},
          { path: "settings", element: <PrivateRoute><Settings /> </PrivateRoute>},
          { path: "notifications", element: <PrivateRoute><Notification /></PrivateRoute> }
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
