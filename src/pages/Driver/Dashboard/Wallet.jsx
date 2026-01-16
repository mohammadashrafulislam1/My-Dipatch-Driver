import { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { IoChevronDown } from "react-icons/io5";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { endPoint } from "../../../Components/ForAPIs";
import useAuth from "../../../Components/useAuth";

const Wallet = () => {
  const { user, token } = useAuth();

  // UI states
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
const [showBankModal, setShowBankModal] = useState(false);
const [bankName, setBankName] = useState("");
const [accountNumber, setAccountNumber] = useState("");
const [routingNumber, setRoutingNumber] = useState("");

const handleSaveBankAccount = async () => {
  if (!bankName || !accountNumber || !routingNumber) {
    toast.error("Please fill all bank details");
    return;
  }

  try {
    const res = await axios.post(
      `${endPoint}/driver/square-payout`,
      { bankName, accountNumber, routingNumber, currency: "CAD" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      toast.success("Bank account saved!");
      setHasBankAccount(true);
      setShowBankModal(false);
    } else {
      toast.error(res.data.message || "Failed to save bank account");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error saving bank account");
  }
};

  // Wallet & transactions
  const [transactions, setTransactions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  const [loading, setLoading] = useState(true);

  // Date range (last 30 days by default)
  const [range, setRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const formattedRange = `${format(
    range[0].startDate,
    "dd MMM yyyy"
  )} - ${format(range[0].endDate, "dd MMM yyyy")}`;

  // Square Payment form instances
  const [squarePayments, setSquarePayments] = useState(null);
  const [cardInstance, setCardInstance] = useState(null);

  const APPLICATION_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID;
  const LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

useEffect(() => {
  const fetchBankStatus = async () => {
    try {
      const res = await axios.get(`${endPoint}/payment/square-payout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res)
      setHasBankAccount(res.data?.cards?.length > 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBankStatus();
}, [token]);


  // Fetch wallet & transactions
  useEffect(() => {
    if (!user) return;

    const fetchWalletData = async () => {
      try {
        setLoading(true);

        // Ride history
        const rideRes = await axios.get(
          `${endPoint}/rides/driver/${user?._id || user.id}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const rides = rideRes.data.rides || [];
        const rideTransactions = rides
          .filter((r) => r.status === "completed")
          .map((r) => ({
            id: r._id,
            type: `Ride #${r._id.slice(-4)}`,
            method: "Cash", // Or use r.paymentMethod from backend
            amount: Number(r.price),
            date: new Date(r.createdAt),
          }));

        // Total earnings
        const earningsRes = await axios.get(
          `${endPoint}/rides/driver/${user?._id || user.id}/earnings`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setTotalEarnings(earningsRes.data.totalEarnings || 0);
        setTransactions(rideTransactions);
        setTotalWithdraw(0); // Placeholder
      } catch (err) {
        console.error(err);
        toast.error("Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user, token]);

  // Filter transactions by date range
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

  const handleWithdrawToBank = async () => {
  if (!withdrawAmount || Number(withdrawAmount) <= 0) {
    toast.error("Enter valid amount");
    return;
  }

  try {
    const res = await axios.post(
      `${endPoint}/payment/withdraw-bank`,
      { amount: Number(withdrawAmount) },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.data.success) {
      toast.error(res.data.message || "Bank withdrawal failed");
      return;
    }

    toast.success("Withdrawal sent to your bank!");
    setWithdrawAmount("");
    setShowWithdraw(false);

    setTotalEarnings((prev) => prev - Number(withdrawAmount));
    setTotalWithdraw((prev) => prev + Number(withdrawAmount));
  } catch (err) {
    console.error(err);
    toast.error("Withdrawal failed");
  }
};

 
  return (
    <div className="md:max-w-3xl flex flex-col md:gap-3 gap-2 mx-auto p-4 relative md:mt-0 mt-6">
       <Toaster/>
      {/* Driver Balance */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
        <div className="text-sm">Total Earnings</div>
        <div className="text-3xl font-bold mt-1">
          {loading ? "..." : `$${totalEarnings.toFixed(2)}`}
        </div>
        <div className="text-xs text-blue-100 mt-1">Updated just now</div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
  onClick={() => setShowWithdraw(true)}
  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow"
>
  Withdraw to Bank
</button>

<button
  onClick={() => setShowBankModal(true)}
  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow"
>
  {hasBankAccount ? "Update Bank" : "Add Bank"}
</button>
      </div>

      {/* Withdraw Modal */}
    {/* Withdraw Modal */}
{showWithdraw && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
      <h2 className="text-xl font-semibold mb-4">Withdraw to Bank</h2>

      {!hasBankAccount && (
        <div className="mb-3 text-sm text-red-600">
          Please add a bank account first.
        </div>
      )}

      <div className="flex w-full gap-2 mb-3">
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          className="md:w-[70%] w-[60%] border px-3 py-2 rounded-lg"
          placeholder="Enter amount"
          disabled={!hasBankAccount}
        />
        <button
          type="button"
          onClick={() => setWithdrawAmount(totalEarnings.toFixed(2))}
          disabled={!hasBankAccount || totalEarnings <= 0}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {`Full ${totalEarnings.toFixed(2)}` || 0}
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowWithdraw(false)}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleWithdrawToBank}
          disabled={!hasBankAccount || !withdrawAmount || Number(withdrawAmount) <= 0}
          className={`px-4 py-2 text-white rounded-lg ${
            hasBankAccount
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


      {/* Earnings Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Today's Earnings</div>
          <div className="text-xl font-semibold">${todayEarnings.toFixed(2)}</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">This Week</div>
          <div className="text-xl font-semibold">${weeklyEarnings.toFixed(2)}</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Earning</div>
          <div className="text-xl font-semibold">${totalEarnings.toFixed(2)}</div>
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
                {t.date.toDateString()} · {t.method}
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

      {/* Square Payout Modal */}
   {showBankModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6 space-y-4 relative">
      {/* Lock icon */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c.828 0 1.5.672 1.5 1.5v2.5H10.5v-2.5c0-.828.672-1.5 1.5-1.5zM6 11V8a6 6 0 1112 0v3"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-800">
          Add Bank Account
        </h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Your bank details are securely encrypted and used only for withdrawals.
      </p>

      {/* Bank Form */}
      <div className="space-y-3">
        <div className="flex flex-col">
          <label className="text-gray-500 text-sm mb-1">Bank Name</label>
          <input
            type="text"
            placeholder="Royal Bank of Canada"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-500 text-sm mb-1">Account Number</label>
          <input
            type="text"
            placeholder="123456789"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-500 text-sm mb-1">Routing Number</label>
          <input
            type="text"
            placeholder="987654321"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowBankModal(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveBankAccount}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          {/* Lock icon inside button for security feel */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 11c.828 0 1.5.672 1.5 1.5v2.5H10.5v-2.5c0-.828.672-1.5 1.5-1.5zM6 11V8a6 6 0 1112 0v3"
            />
          </svg>
          Save Bank
        </button>
      </div>

      {/* Optional small note */}
      <p className="text-xs text-gray-400 mt-2">
        We never store your full account number for security reasons.
      </p>
    </div>
  </div>
)}

    </div>
  );
};

export default Wallet;
