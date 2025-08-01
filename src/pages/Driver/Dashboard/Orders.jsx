import React, { useState } from "react";

const allOrders = [
  { id: 1, name: "Cy Ganderton", from: "Desktop Support Technician", midway: "Quality Control Specialist", to: "Quality Control Specialist", distance: "0.8 km", earning: "$444" },
  { id: 2, name: "Hart Hagerty", from: "Desktop Support Technician", midway: "Desktop Support Technician", to: "Desktop Support Technician", distance: "1.8 km", earning: "$567" },
  { id: 3, name: "Brice Swyre", from: "Tax Accountant", midway: "Desktop Support Technician", to: "Tax Accountant", distance: "2.7 km", earning: "$367" },
  // ... add more orders here to get 100+ items for example
];

// Generate dummy orders for demonstration if you want more than 20
for(let i = 4; i <= 100; i++) {
  allOrders.push({
    id: i,
    name: `Customer ${i}`,
    from: "Location A",
    midway: "Location B",
    to: "Location C",
    distance: (i * 0.5).toFixed(1) + " km",
    earning: "$" + (i * 10),
  });
}

const ITEMS_PER_PAGE = 20;

const Order = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = allOrders.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Calculate slice of orders to show
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentOrders = allOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      {/* Showing info */}
      <div className="mb-2 text-sm font-medium">
        Showing {startIndex + 1} to {endIndex} of {totalItems} entries
      </div>

      <div className="overflow-x-auto bg-white dark:bg-white  rounded-xl">
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>Customer Name</th>
              <th>From</th>
              <th>Midway</th>
              <th>To</th>
              <th>Total Distance</th>
              <th>Total Earning</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={order.id} className={index % 2 === 0 ? "bg-base-200 dark:bg-base-100 dark:text-white text-white" : ""}>
                <th>{startIndex + index + 1}</th>
                <td>{order.name}</td>
                <td>{order.from}</td>
                <td>{order.midway}</td>
                <td>{order.to}</td>
                <td>{order.distance}</td>
                <td>{order.earning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="join mt-4 mx-auto w-full justify-center flex gap-1">
        {[...Array(totalPages).keys()].map((pageNum) => {
          const page = pageNum + 1;
          return (
            <input
              key={page}
              type="radio"
              name="options"
              aria-label={page}
              className="join-item btn btn-square"
              checked={currentPage === page}
              onChange={() => handlePageChange(page)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Order;
