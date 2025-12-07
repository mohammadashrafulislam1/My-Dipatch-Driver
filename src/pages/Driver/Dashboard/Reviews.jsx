import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import useAuth from "../../../Components/useAuth";
import { endPoint } from "../../../Components/ForAPIs";

const Reviews = () => {
  const { user, token } = useAuth(); // token needed for auth
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  // console.log(user)
useEffect(() => {
  if (!user) return;

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${endPoint}/review/driver/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        const reviewsData = res.data.reviews || [];

        // Fetch customer info for each review
        const reviewsWithUser = await Promise.all(
          reviewsData.map(async (review) => {
            try {
              const customerId = review.customerId._id || review.customerId;
              const userRes = await axios.get(`${endPoint}/user/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return { ...review, customerInfo: userRes.data.user || userRes.data }; // attach customer info
            } catch (err) {
              console.error("Error fetching user info:", err);
              return { ...review, customerInfo: null };
            }
          })
        );

        setReviews(reviewsWithUser);
      } else {
        console.error("Error fetching reviews:", res.data.message);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  fetchReviews();
}, [user, token]);



  // Pagination calculations
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  
// Pagination calculations (safe)
const currentReviews = (reviews || []).slice(indexOfFirstReview, indexOfLastReview);
const totalPages = Math.ceil((reviews?.length || 0) / reviewsPerPage);
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
                key={review._id}
                className="bg-white shadow rounded-lg p-5 border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                 <h2 className="text-lg font-semibold text-gray-800">
  {review.customerInfo ? `${review.customerInfo.firstName} ${review.customerInfo.lastName}` : "Anonymous"}
</h2>

                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
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
