import { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format, isWithinInterval } from "date-fns";
import { FaDollarSign, FaCar, FaClock } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import useAuth from "../../../Components/useAuth";
import axios from "axios";
import { endPoint } from "../../../Components/ForAPIs";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const Earnings = () => {
  const { user } = useAuth();
console.log("USER FROM AUTH:", user);

  const [range, setRange] = useState([
    {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2026-12-31"),
      key: "selection",
    },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [completedRides, setCompletedRides] = useState([]);

  // 🔥 Fetch COMPLETED rides
  useEffect(() => {
    if (!user?._id) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${endPoint}/rides`);
        const orders = res.data.rides || [];

        // Filter only completed rides for this driver
        const myCompleted = orders.filter(
          (order) => order.driverId === user._id && order.status === "completed"
        );

        console.log("Completed Rides:", myCompleted);
        setCompletedRides(myCompleted);
      } catch (error) {
        console.log("Error loading earnings:", error);
      }
    };

    fetchOrders();
  }, [user]);

  const formattedRange = `${format(
    range[0].startDate,
    "MMM d, yyyy"
  )} - ${format(range[0].endDate, "MMM d, yyyy")}`;

  // 🔥 Filter rides within selected date range
  const filteredTrips = useMemo(() => {
    return completedRides.filter((ride) =>
      isWithinInterval(new Date(ride.updatedAt), {
        start: range[0].startDate,
        end: new Date(range[0].endDate.getTime() + 86400000),
      })
    );
  }, [range, completedRides]);

  // 🔥 Calculate earnings
  const totalEarnings = filteredTrips
    .reduce((sum, r) => sum + Number(r.price || 0), 0)
    .toFixed(2);

  // 🛑 Fix: Calculate Hours Online using timestamps
const calculateHoursOnline = (timestamps) => {
  if (!timestamps?.acceptedAt || !timestamps?.dropoffAt) return 0;

  const start = new Date(timestamps.acceptedAt).getTime();
  const end = new Date(timestamps.dropoffAt).getTime();

  if (!end || end < start) return 0;

  const diffMs = end - start;
  const hours = diffMs / (1000 * 60 * 60);

  return Number(hours.toFixed(2));
};


  // Total Rides
  const totalRides = filteredTrips.length;

  // Total Hours Online
  const totalHours = filteredTrips
    .reduce((sum, ride) => sum + calculateHoursOnline(ride.timestamps), 0)
    .toFixed(2);

  return (
    <div className="p-6 mt-5 bg-gray-100 min-h-screen rounded-2xl relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Earnings Dashboard
        </h1>

        <div className="pt-2 relative overflow-visible">
          <button
            onClick={() => setShowCalendar((p) => !p)}
            className="flex items-center gap-2 text-gray-700 text-sm font-medium border px-3 py-2 rounded-md shadow-sm bg-white hover:bg-gray-50"
          >
            <span>{formattedRange}</span>
            <IoChevronDown className="text-base" />
          </button>

          {showCalendar && (
            <div className="absolute mt-2 left-[0.2px] md:left-auto md:right-0 z-30 bg-white shadow-lg rounded-md p-2">
              <DateRange
                editableDateInputs={true}
                onChange={(item) => setRange([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={range}
                rangeColors={["#006FFF"]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          icon={<FaDollarSign size={24} />}
          color="green"
          label="Total Earnings"
          value={`$${totalEarnings}`}
        />
        <SummaryCard
          icon={<FaCar size={24} />}
          color="blue"
          label="Rides Completed"
          value={totalRides}
        />
        <SummaryCard
          icon={<FaClock size={24} />}
          color="purple"
          label="Hours Online"
          value={`${totalHours} hrs`}
        />
      </div>

      {/* Recent Trips */}
      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Pickup</th>
              <th className="px-6 py-4 text-left">Dropoff</th>
              <th className="px-6 py-4 text-left">Fare</th>
              <th className="px-6 py-4 text-left">Distance</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((ride, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition"
                >
                  <td className="px-6 py-4">
                    {format(new Date(ride.updatedAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">{ride.pickup?.address}</td>
                  <td className="px-6 py-4">{ride.dropoff?.address}</td>
                  <td className="px-6 py-4">${ride.price}</td>
                  <td className="px-6 py-4">{ride.distance}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400"
                >
                  No completed rides in this date range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, color, label, value }) => {
  const bg = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  }[color];

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 flex items-center gap-4">
      <div className={`${bg} p-3 rounded-full`}>{icon}</div>
      <div>
        <h2 className="text-sm text-gray-500">{label}</h2>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default Earnings;
