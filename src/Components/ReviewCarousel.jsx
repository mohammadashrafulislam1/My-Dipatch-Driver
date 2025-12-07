import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import axios from "axios";
import useAuth from "./useAuth";
import { endPoint } from "./ForAPIs";

const ReviewCarousel = () => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${endPoint}/review/driver/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          const reviewsData = res.data.reviews || [];

          // Attach customer info
          const reviewsWithUser = await Promise.all(
            reviewsData.map(async (review) => {
              try {
                const customerId = review.customerId._id || review.customerId;
                const userRes = await axios.get(`${endPoint}/user/${customerId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                return {
                  ...review,
                  customerInfo: userRes.data.user || userRes.data,
                };
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<FaStar key={i} className="text-yellow-500" />);
      else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      else stars.push(<FaRegStar key={i} className="text-yellow-500" />);
    }
    return stars;
  };

  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-600 text-center mt-6">No reviews yet.</p>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Swiper
        slidesPerView={1}
        spaceBetween={24}
        navigation={true}
        modules={[Navigation]}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {reviews.map((review) => (
          <SwiperSlide key={review._id}>
            <div className="bg-white shadow-md rounded-xl p-6 h-full flex flex-col justify-between transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={review.customerInfo?.profileImage || "https://plfa.org.za/wp-content/uploads/2019/06/Faceless-Avatar-e1578304088497.jpg"}
                  alt={review.customerInfo?.firstName || "Anonymous"}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {review.customerInfo
                      ? `${review.customerInfo.firstName} ${review.customerInfo.lastName}`
                      : "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{review.comment}</p>
              <div className="flex gap-1">{renderStars(review.rating)}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewCarousel;
