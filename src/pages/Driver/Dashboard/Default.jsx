import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { IoChevronDown } from "react-icons/io5";
import { format } from "date-fns";
import "react-date-range/dist/styles.css"; // main style
import "react-date-range/dist/theme/default.css"; // theme style
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleUp,
  FaClipboardList,
} from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCircleCheck, FaSackDollar } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { GrDeliver } from "react-icons/gr";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Download } from "lucide-react";
import ReviewCarousel from "../../../Components/ReviewCarousel";

import axios from "axios";
import { endPoint } from "../../../Components/ForAPIs";
import useAuth from "../../../Components/useAuth";
import toast from "react-hot-toast";

const COLORS = ["#FF4F4F", "#34D399", "#3B82F6"];

const Default = () => {
  const { user, token } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);

const [range, setRange] = useState([
  {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),   // 👈 today
    key: "selection",
  },
]);


  // 🔹 Rides + stats loading
  const [rides, setRides] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  console.log(rides)
  // 🔹 Fetch driver rides from backend
  useEffect(() => {
    if (!user) return;

    const fetchRides = async () => {
      try {
        const res = await axios.get(
          `${endPoint}/rides/driver/${user._id || user.id}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRides(res.data.rides || []);
      } catch (err) {
        console.error("Error fetching driver rides:", err.response || err);

        // If no rides yet, backend sends 404 → just treat as empty
        if (err?.response?.status === 404) {
          setRides([]);
        } else {
          toast.error("Failed to load ride stats");
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchRides();
  }, [user, token]);

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const formattedRange = `${format(
    range[0].startDate,
    "dd MMMM yyyy"
  )} - ${format(range[0].endDate, "dd MMMM yyyy")}`;

  // 🔹 Filter rides based on selected date range
  const startDate = range[0].startDate;
  const endDate = range[0].endDate;

  const filteredRides = rides.filter((ride) => {
    if (!ride.createdAt) return false;
    const d = new Date(ride.createdAt);
    return d >= startDate && d <= endDate;
  });

  // 🔹 Compute dynamic stats
  const totalOrders = filteredRides.length;

  const totalDelivered = filteredRides.filter(
    (r) => r.status === "completed"
  ).length;

  const totalCancelled = filteredRides.filter(
    (r) => r.status === "cancelled"
  ).length;

  const totalRevenue = filteredRides
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + Number(r.price || 0), 0)
    .toFixed(2);

  // 🔹 Pie chart values (use percentages for visuals)
  const completionRate =
    totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0;
  const cancelRate =
    totalOrders > 0 ? Math.round((totalCancelled / totalOrders) * 100) : 0;
  const avgRevenuePerRide =
    totalDelivered > 0
      ? Math.min(100, Math.round(Number(totalRevenue) / totalDelivered))
      : 0;

  const pieCharts = [
    {
      name: "Total Order",
      value: totalOrders > 0 ? 100 : 0,
      color: COLORS[0],
    },
    {
      name: "Customer Growth",
      value: completionRate,
      color: COLORS[1],
    },
    {
      name: "Total Revenue",
      value: avgRevenuePerRide,
      color: COLORS[2],
    },
  ];

  // 🔹 Dynamic weekly chart data (Sun–Sat)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const chartData = weekDays.map((day, idx) => ({
    day,
    orders: filteredRides.filter((r) => {
      const d = new Date(r.createdAt).getDay();
      return d === idx;
    }).length,
  }));

  // 🔹 Download current chart data as JSON
  const downloadReport = () => {
    const dataStr = JSON.stringify(
      {
        range: {
          start: startDate,
          end: endDate,
        },
        stats: {
          totalOrders,
          totalDelivered,
          totalCancelled,
          totalRevenue,
        },
        chartData,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "driver-dashboard-report.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-hidden">
      {/* Date Range Filter (styled) */}
      <div className="pt-2 relative overflow-visible">
        {/* Header */}
        <button
          onClick={toggleCalendar}
          className="flex items-center gap-2 text-gray-700 text-sm font-medium"
        >
          <span>{formattedRange}</span>
          <IoChevronDown className="text-base" />
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div className="absolute mt-2 z-30 bg-white shadow-lg rounded-md md:p-2">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                setRange([item.selection]);
              }}
              moveRangeOnFirstSelection={false}
              ranges={range}
              rangeColors={["#006FFF"]}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:gap-5 gap-3 mt-6">
        {/* Card 1 - Total Orders */}
        <div className="stat bg-white flex items-center gap-4 lg:p-4 p-2 rounded-xl shadow-sm">
          <div className="stat-title bg-[#006eff2a] rounded-full lg:w-[70px] lg:h-[70px] w-[50px] h-[50px] flex items-center justify-center relative">
            <FaClipboardList className="lg:text-[40px] text-[30px] text-[#006FFF]" />
            <FaArrowAltCircleDown
              className="bg-[#FF0500] text-white lg:text-[20px] text-[15px] px-1 rounded-full absolute lg:top-[14px] 
        top-[8px] lg:right-[8px] right-[10px]"
            />
          </div>
          <div>
            <div className="stat-value">
              {loadingStats ? "..." : totalOrders}
            </div>
            <div className="poppins-light text-[12px]">Total Orders</div>
          </div>
        </div>

        {/* Card 2 - Total Delivered */}
        <div className="stat bg-white flex items-center gap-4 lg:p-4 p-2 rounded-xl shadow-sm">
          <div className="stat-title bg-[#006eff2a] rounded-full lg:w-[70px] lg:h-[70px] w-[50px] h-[50px] flex items-center justify-center relative">
            <TbTruckDelivery className="lg:text-[40px] text-[30px] text-[#006FFF]" />
            <FaCircleCheck
              className="bg-[#008000] text-white lg:text-[20px] text-[15px] px-1 rounded-full absolute lg:top-[14px] 
        top-[8px] lg:right-[8px] right-[10px]"
            />
          </div>
          <div>
            <div className="stat-value">
              {loadingStats ? "..." : totalDelivered}
            </div>
            <div className="poppins-light text-[12px]">Total Delivered</div>
          </div>
        </div>

        {/* Card 3 - Total Cancelled */}
        <div className="stat bg-white flex items-center gap-4 lg:p-4 p-2 rounded-xl shadow-sm">
          <div className="stat-title bg-[#006eff2a] rounded-full lg:w-[70px] lg:h-[70px] w-[50px] h-[50px] flex items-center justify-center relative">
            <GrDeliver className="lg:text-[40px] text-[30px] text-[#006FFF]" />
            <MdCancel
              className="bg-[#FF0500] text-white lg:text-[20px] text-[15px] px-1 rounded-full absolute lg:top-[14px] 
        top-[8px] lg:right-[8px] right-[10px]"
            />
          </div>
          <div>
            <div className="stat-value">
              {loadingStats ? "..." : totalCancelled}
            </div>
            <div className="poppins-light text-[12px]">Total Cancelled</div>
          </div>
        </div>

        {/* Card 4 - Total Revenue */}
        <div className="stat bg-white flex items-center gap-4 lg:p-4 p-2 rounded-xl shadow-sm">
          <div className="stat-title bg-[#006eff2a] rounded-full lg:w-[70px] lg:h-[70px] w-[50px] h-[50px] flex items-center justify-center relative">
            <FaSackDollar className="lg:text-[40px] text-[30px] text-[#006FFF]" />
            <FaArrowAltCircleUp
              className="bg-[#008000] text-white lg:text-[20px] text-[15px] px-1 rounded-full absolute lg:top-[14px] 
        top-[8px] lg:right-[8px] right-[10px]"
            />
          </div>
          <div>
            <div className="stat-value">
              {loadingStats ? "..." : `$${totalRevenue}`}
            </div>
            <div className="poppins-light text-[12px]">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* charts */}
      <div className="flex lg:flex-nowrap flex-wrap gap-6 mt-6">
        {/* Left: Pie Charts Grouped Together */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col lg:w-[45%] w-full">
          <h3 className="text-lg font-semibold mb-4">Pie Chart</h3>
          <div className="flex flex-col md:flex-row justify-around items-center gap-1">
            {pieCharts.map((item) => (
              <div key={item.name} className="flex flex-col items-center">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: item.name, value: item.value },
                        { name: "Remaining", value: 100 - item.value },
                      ]}
                      dataKey="value"
                      outerRadius={50}
                      innerRadius={30}
                      startAngle={90}
                      endAngle={-270}
                      label={({ cx, cy }) => (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg font-bold"
                          fill="#111827"
                        >
                          {item.value}%
                        </text>
                      )}
                      labelLine={false}
                    >
                      <Cell fill={item.color} />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Title below the chart */}
                <h4 className="text-sm font-medium mt-2">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Area Chart */}
        <div className="bg-white rounded-xl shadow p-4 w-full lg:w-[55%] relative">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Chart Order
              </h3>
            </div>

            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-blue-100 text-blue-600 hover:bg-blue-200 px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              <Download size={16} />
              Save Report
            </button>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <CartesianGrid strokeDasharray="0" stroke="transparent" />

              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                fill="url(#colorOrders)"
                strokeWidth={3}
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow p-4 mt-6 w-full relative">
        <h3 className="text-2xl font-semibold">Customer Review</h3>
        <p className="text-md font-light mb-4 text-gray-500">
          Recent customer reviews
        </p>
        <ReviewCarousel />
      </div>
    </div>
  );
};

export default Default;
