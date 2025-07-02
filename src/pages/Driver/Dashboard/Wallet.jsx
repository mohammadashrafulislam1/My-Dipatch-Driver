import { useState } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { IoChevronDown } from "react-icons/io5";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const transactions = [
  {
    id: 1,
    type: "Ride #3257",
    method: "Cash",
    amount: 12.8,
    date: new Date("2025-06-30"),
  },
  {
    id: 2,
    type: "Ride #3253",
    method: "Card",
    amount: 18.2,
    date: new Date("2025-06-29"),
  },
  {
    id: 3,
    type: "Withdrawal",
    method: "",
    amount: -100,
    date: new Date("2025-06-28"),
  },
  {
    id: 4,
    type: "Ride #3248",
    method: "Cash",
    amount: 22.5,
    date: new Date("2025-06-28"),
  },
];

const Wallet = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date("2025-06-28"),
      endDate: new Date("2025-06-30"),
      key: "selection",
    },
  ]);

  const formattedRange = `${format(range[0].startDate, "dd MMMM yyyy")} - ${format(
    range[0].endDate,
    "dd MMMM yyyy"
  )}`;
  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const filteredTransactions = transactions.filter((t) => {
    const { startDate, endDate } = range[0];
    return t.date >= startDate && t.date <= endDate;
  });

  return (
    <div className="md:max-w-3xl mx-auto p-4 space-y-6 relative">
      {/* Driver Balance */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
        <div className="text-sm">Total Earnings</div>
        <div className="text-3xl font-bold mt-1">$4,120.75</div>
        <div className="text-xs text-blue-100 mt-1">Updated 1 hour ago</div>
      </div>

      {/* Withdraw Button */}
      <div className="flex justify-end">
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow">
          Withdraw to Bank
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Today's Earnings</div>
          <div className="text-xl font-semibold">$85.40</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-xl font-semibold">$412.75</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Earning</div>
          <div className="text-xl font-semibold">$4120.75</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Withdraw</div>
          <div className="text-xl font-semibold text-red-500">– $1100.75</div>
        </div>
      </div>

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
          <div className="absolute mt-2 md:right-0 right-0 z-30 bg-white shadow-lg rounded-md md:p-2">
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

      {/* Transactions List */}
      <ul className="space-y-3 mt-4">
        {filteredTransactions.length === 0 && (
          <div className="text-gray-500">No transactions found.</div>
        )}
        {filteredTransactions.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
          >
            <div>
              <div className="font-medium">{t.type}</div>
              <div className="text-sm text-gray-500">
                {t.date.toDateString()} {t.method && `· ${t.method}`}
              </div>
            </div>
            <div
              className={`font-semibold ${
                t.amount > 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {t.amount > 0
                ? `+ $${t.amount.toFixed(2)}`
                : `– $${Math.abs(t.amount).toFixed(2)}`}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Wallet;
