import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { IoChevronDown } from "react-icons/io5";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import axios from "axios";
import toast from "react-hot-toast";
import { endPoint } from "../../../Components/ForAPIs";
import useAuth from "../../../Components/useAuth";

const Wallet = () => {
  const { user, token } = useAuth();

  const [showCalendar, setShowCalendar] = useState(false);

  // Date range: last 30 days → today
  const [range, setRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const formattedRange = `${format(range[0].startDate, "dd MMM yyyy")} - ${format(
    range[0].endDate,
    "dd MMM yyyy"
  )}`;

  const [transactions, setTransactions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalWithdraw, setTotalWithdraw] = useState(0); // future expansion

  // Fetch all driver rides
  useEffect(() => {
    if (!user) return;

    const fetchWalletData = async () => {
      try {
        // Get ride history
        const rideRes = await axios.get(
          `${endPoint}/rides/driver/${user?._id || user.id}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rides = rideRes.data.rides || [];

        // Convert rides into transaction format
        const rideTransactions = rides
          .filter((r) => r.status === "completed")
          .map((r) => ({
            id: r._id,
            type: `Ride #${r._id.slice(-4)}`,
            method: "Cash", // or from DB: r.paymentMethod ?
            amount: Number(r.price),
            date: new Date(r.createdAt),
          }));

        // GET total earnings from backend
        const earningsRes = await axios.get(
          `${endPoint}/rides/driver/${user?._id || user.id}/earnings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTotalEarnings(earningsRes.data.totalEarnings || 0);
        setTransactions(rideTransactions);

        // withdrawals (if future DB added)
        setTotalWithdraw(0);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user]);

  // Filter transactions by selected range
  const filteredTransactions = transactions.filter((t) => {
    const { startDate, endDate } = range[0];
    return t.date >= startDate && t.date <= endDate;
  });

  // Daily & weekly earnings
  const today = new Date().toDateString();
  const todayEarnings = transactions
    .filter((t) => t.date.toDateString() === today)
    .reduce((sum, t) => sum + t.amount, 0);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyEarnings = transactions
    .filter((t) => t.date >= oneWeekAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  return (
    <div className="md:max-w-3xl mx-auto p-4 space-y-6 relative md:mt-0 mt-6">
      {/* Driver Balance */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
        <div className="text-sm">Total Earnings</div>
        <div className="text-3xl font-bold mt-1">
          {loading ? "..." : `$${totalEarnings.toFixed(2)}`}
        </div>
        <div className="text-xs text-blue-100 mt-1">Updated just now</div>
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
          <div className="text-xl font-semibold">
            ${todayEarnings.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-xl font-semibold">
            ${weeklyEarnings.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Earning</div>
          <div className="text-xl font-semibold">
            ${totalEarnings.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Withdraw</div>
          <div className="text-xl font-semibold text-red-500">
            – ${totalWithdraw.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="pt-2 relative overflow-visible">
        <button
          onClick={toggleCalendar}
          className="flex items-center gap-2 text-gray-700 text-sm font-medium"
        >
          <span>{formattedRange}</span>
          <IoChevronDown className="text-base" />
        </button>

        {showCalendar && (
          <div className="absolute mt-2 md:right-0 right-0 z-30 bg-white shadow-lg rounded-md md:p-2">
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
