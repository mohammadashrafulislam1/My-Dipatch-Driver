import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;

  useEffect(() => {
    // Dummy data — Replace with API call
    setReviews([
      {
        id: 1,
        customerName: "John Doe",
        rating: 4,
        comment: "Driver was punctual and friendly.",
        rideDate: "2025-07-05",
      },
      {
        id: 2,
        customerName: "Emily Clark",
        rating: 5,
        comment: "Excellent experience, car was clean.",
        rideDate: "2025-07-04",
      },
      {
        id: 3,
        customerName: "David Lee",
        rating: 3,
        comment: "Ride was okay, but driver took a longer route.",
        rideDate: "2025-07-03",
      },
      {
        id: 4,
        customerName: "Sophia Martinez",
        rating: 5,
        comment: "Very friendly and professional driver.",
        rideDate: "2025-07-02",
      },
      {
        id: 5,
        customerName: "Michael Scott",
        rating: 2,
        comment: "Driver was late and didn't follow map.",
        rideDate: "2025-07-01",
      },
    ]);
  }, []);

  // Pagination calculations
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Driver Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet.</p>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {currentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white shadow rounded-lg p-5 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {review.customerName}
                  </h2>
                  <span className="text-sm text-gray-500">{review.rideDate}</span>
                </div>

                {/* Star Rating */}
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reviews;
