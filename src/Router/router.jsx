import { createBrowserRouter } from "react-router-dom";
import Driver from "../pages/Driver/Driver";
import Dashboard from "../pages/Driver/Dashboard/Dashboard";
import Order from "../pages/Driver/Dashboard/Orders";
import Customers from "../pages/Driver/Dashboard/Customers";
import Analytics from "../pages/Driver/Dashboard/Analytics";
import Earnings from "../pages/Driver/Dashboard/Earnings";
import Map from "../pages/Driver/Dashboard/Map";
import Chat from "../pages/Driver/Dashboard/Chat";
import Wallet from "../pages/Driver/Dashboard/Wallet";
import Default from "../pages/Driver/Dashboard/Default";

export const router = createBrowserRouter([
    {
        path:'/dashboard',
        element:<Dashboard/>,
        errorElement:<h1>err</h1>,
        children:[
            {
                path:'',
                element:<Default/>
            },
            {
                path:'orders',
                element:<Order/>
            },
            {
                path:'customers',
                element:<Customers/>
            },
            {
                path:'analytics',
                element:<Analytics/>
            },
            {
                path:'reviews',
                element:<Order/>
            },
            {
                path:'earnings',
                element:<Earnings/>
            },
            {
                path:'map',
                element:<Map/>
            },
            {
                path:'chat',
                element:<Chat/>
            },
            {
                path:'wallet',
                element:<Wallet/>
            },
        ]
    },
    {
        path:'/',
        element:<Driver/>,
        errorElement:<h1>err</h1>
    },
])