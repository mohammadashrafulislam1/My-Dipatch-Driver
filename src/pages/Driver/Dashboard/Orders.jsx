import React, { useEffect, useState } from "react";
import useAuth from "../../../Components/useAuth";
import axios from "axios";
import { endPoint } from "../../../Components/ForAPIs";

const ITEMS_PER_PAGE = 20;

const Order = () => {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // ✅ Fetch orders from database
  useEffect(() => {
  if (!user?._id) return;

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${endPoint}/rides`);
      const orders = res.data.rides || [];

      console.log(orders);

      // ✅ Show only completed rides for this driver
      const myOrders = orders.filter(
        (order) =>
          order.driverId === user._id &&
          order.status === "completed"
      );

      setAllOrders(myOrders);
    } catch (error) {
      console.log("❌ Error fetching orders:", error);
    }
  };

  fetchOrders();
}, [user]);

  const totalItems = allOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Pagination slice
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentOrders = allOrders.slice(startIndex, endIndex);

  return (
    <div className="p-4">
      <div className="mb-2 text-sm font-medium">
        Showing {startIndex + 1} to {endIndex} of {totalItems} entries
      </div>

      <div className="overflow-x-auto bg-white rounded-xl">
        <table className="table w-full">
          <thead className="text-black">
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Midway</th>
              <th>Distance</th>
              <th>Earning</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={order._id} className="bg-base-200">
                <td>{startIndex + index + 1}</td>
                <td>{order.customerId}</td>
                <td>{order.pickup?.address}</td>
                <td>{order.dropoff?.address}</td>
                <td>
                  {order.midwayStops?.length > 0
                    ? order.midwayStops.map((s) => s.address).join(", ")
                    : "No Midway"}
                </td>
                <td>{order.distance}</td>
                <td>${order.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="join mt-4 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <input
            key={page}
            type="radio"
            name="options"
            aria-label={page}
            className="join-item btn btn-square"
            checked={currentPage === page}
            onChange={() => setCurrentPage(page)}
          />
        ))}
      </div>
    </div>
  );
};

export default Order;
