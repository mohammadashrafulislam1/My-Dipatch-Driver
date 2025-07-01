import { useState } from "react";
import { DateRange } from "react-date-range";
import { IoChevronDown } from "react-icons/io5";
import { format } from "date-fns";
import "react-date-range/dist/styles.css"; // main style
import "react-date-range/dist/theme/default.css"; // theme style
import { FaArrowAltCircleDown, FaArrowAltCircleUp, FaClipboardList } from "react-icons/fa";
import { TbTruckDelivery } from "react-icons/tb";
import { FaCircleCheck, FaSackDollar } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import { GrDeliver } from "react-icons/gr";
import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  Area,
  AreaChart
} from 'recharts';
  import { Download } from 'lucide-react'; 
import ReviewCarousel from "../../../Components/ReviewCarousel";

const pieData = {
  totalOrder: 81,
  customerGrowth: 22,
  totalRevenue: 62,
};
const downloadReport = () => {
    const dataStr = JSON.stringify(chartData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chart-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
const COLORS = ['#FF4F4F', '#34D399', '#3B82F6'];

const chartData = [
  { day: 'Sun', orders: 100 },
  { day: 'Mon', orders: 150 },
  { day: 'Tues', orders: 456 },
  { day: 'Wed', orders: 120 },
  { day: 'Thu', orders: 110 },
  { day: 'Fri', orders: 180 },
  { day: 'Sat', orders: 240 },
];
const Default = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date("2024-04-17"),
      endDate: new Date("2025-05-21"),
      key: "selection",
    },
  ]);


  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const formattedRange = `${format(range[0].startDate, "dd MMMM yyyy")} - ${format(
    range[0].endDate,
    "dd MMMM yyyy"
  )}`;
  const pieCharts = [
    { name: 'Total Order', value: pieData.totalOrder, color: COLORS[0] },
    { name: 'Customer Growth', value: pieData.customerGrowth, color: COLORS[1] },
    { name: 'Total Revenue', value: pieData.totalRevenue, color: COLORS[2] },
  ];
  
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
          <div className="absolute mt-2 z-50 bg-white shadow-lg rounded-md md:p-2">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => {
                console.log("DateRange onChange", item);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6">
  {/* Card 1 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <FaClipboardList className="text-[40px] text-[#006FFF]" />
      <FaArrowAltCircleDown
        className="bg-[#FF0500] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">75</div>
      <div className="poppins-light text-[12px]">Total Orders</div>
    </div>
  </div>

  {/* Card 2 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <TbTruckDelivery className="text-[40px] text-[#006FFF]" />
      <FaCircleCheck
        className="bg-[#008000] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">85</div>
      <div className="poppins-light text-[12px]">Total Delivered</div>
    </div>
  </div>

  {/* Card 3 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <GrDeliver className="text-[40px] text-[#006FFF]" />
      <MdCancel
        className="bg-[#FF0500] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">95</div>
      <div className="poppins-light text-[12px]">Total Cancelled</div>
    </div>
  </div>

  {/* Card 4 */}
  <div className="stat bg-white flex items-center gap-4 p-4 rounded shadow-sm">
    <div className="stat-title bg-[#006eff2a] rounded-full w-[70px] h-[70px] flex items-center justify-center relative">
      <FaSackDollar className="text-[40px] text-[#006FFF]" />
      <FaArrowAltCircleUp
        className="bg-[#008000] text-white text-[20px] px-1 rounded-full absolute top-[14px] right-[8px]"
      />
    </div>
    <div>
      <div className="stat-value">$175</div>
      <div className="poppins-light text-[12px]">Total Revenue</div>
    </div>
  </div>
</div>

{/* charts */}
<div className="flex gap-6 mt-6">

  {/* Left: Pie Charts Grouped Together */}
  <div className="bg-white rounded-xl shadow p-4 flex flex-col w-[45%]">
    <h3 className="text-lg font-semibold mb-4">Pie Chart</h3>
    <div className="flex flex-col md:flex-row justify-around items-center gap-1">
      {pieCharts.map((item) => (
       <div key={item.name} className="flex flex-col items-center">
       <ResponsiveContainer width={100} height={100}>
         <PieChart>
           <Pie
             data={[
               { name: item.name, value: item.value },
               { name: 'Remaining', value: 100 - item.value },
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

  {/* Right: Line Chart */}
  <div className="bg-white rounded-xl shadow p-4 w-full lg:w-[55%] relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Chart Order</h3>
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

    {/* Hide all axis lines and ticks */}
    <XAxis
      dataKey="day"
      axisLine={false}
      tickLine={false}
      padding={{ left: 10, right: 10 }}
      tick={{ fill: "#6B7280", fontSize: 12 }} // Optional styling for ticks
    />
    {/* No YAxis at all */}

    {/* Remove background grid lines */}
    <CartesianGrid strokeDasharray="0" stroke="transparent" />

    <Tooltip  className="rounded-xl"/>
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
  <p className="text-md font-light mb-4 text-gray-500">Recent customer reviews</p>
 <ReviewCarousel />
</div>



   </div>
  );
};

export default Default;
