import { useState, useMemo } from "react";
import { DateRange } from "react-date-range";
import { format, isWithinInterval, parse } from "date-fns";
import { FaDollarSign, FaCar, FaClock } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const allTrips = [
  {
    date: "2025-06-05",
    from: "Downtown",
    to: "Airport",
    fare: 25.0,
    distance: 12,
    duration: 30, // in minutes
  },
  {
    date: "2025-06-18",
    from: "Station",
    to: "Mall",
    fare: 16.8,
    distance: 7.4,
    duration: 20,
  },
  {
    date: "2025-07-05",
    from: "Park Ave",
    to: "University",
    fare: 12.5,
    distance: 5.3,
    duration: 18,
  },
  {
    date: "2025-07-22",
    from: "Central Park",
    to: "Tech Hub",
    fare: 19.6,
    distance: 9.1,
    duration: 25,
  },
];

const Earnings = () => {
  const [range, setRange] = useState([
    {
      startDate: new Date("2025-06-02"),
      endDate: new Date("2025-07-20"),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  const formattedRange = `${format(range[0].startDate, "MMM d, yyyy")} - ${format(
    range[0].endDate,
    "MMM d, yyyy"
  )}`;

  // Filter trips based on selected range
  const filteredTrips = useMemo(() => {
    return allTrips.filter((trip) =>
      isWithinInterval(new Date(trip.date), {
        start: range[0].startDate,
        end: range[0].endDate,
      })
    );
  }, [range]);

  // Calculate earnings summary
  const totalEarnings = filteredTrips.reduce((sum, t) => sum + t.fare, 0).toFixed(2);
  const totalRides = filteredTrips.length;
  const totalMinutes = filteredTrips.reduce((sum, t) => sum + t.duration, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div className="p-6 mt-5 bg-gray-100 min-h-screen rounded-2xl relative">
      {/* Header and Calendar Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Earnings Dashboard
        </h1>

        {/* Date and Year */}
        <div className="pt-2 relative overflow-visible">
          <button
            onClick={toggleCalendar}
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

      {/* Recent Trips Table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">From</th>
              <th className="px-6 py-4 text-left">To</th>
              <th className="px-6 py-4 text-left">Fare</th>
              <th className="px-6 py-4 text-left">Distance</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-100 transition"
                >
                  <td className="px-6 py-4">
                    {format(new Date(trip.date), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">{trip.from}</td>
                  <td className="px-6 py-4">{trip.to}</td>
                  <td className="px-6 py-4">${trip.fare.toFixed(2)}</td>
                  <td className="px-6 py-4">{trip.distance} km</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No trips in selected date range.
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
