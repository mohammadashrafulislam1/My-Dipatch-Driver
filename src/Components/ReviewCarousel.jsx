import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const reviews = [
  {
    name: "Jons Sena",
    image: "/avatar1.jpg",
    rating: 4.5,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    daysAgo: "2 days ago",
  },
  {
    name: "Sofia",
    image: "/avatar2.jpg",
    rating: 4.0,
    text: "Lorem Ipsum has been the industry's standard dummy text.",
    daysAgo: "2 days ago",
  },
  {
    name: "Anandreansyah",
    image: "/avatar3.jpg",
    rating: 5,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    daysAgo: "2 days ago",
  },
];

const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(full)].map((_, i) => <FaStar key={`f-${i}`} />)}
      {half && <FaStarHalfAlt key="half" />}
      {[...Array(empty)].map((_, i) => <FaRegStar key={`e-${i}`} />)}
    </div>
  );
};

const ReviewCarousel = () => {
  return (
    <div className="mt-6 w-full">
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
        }}
        className="!px-1"
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white shadow-md p-4 rounded-xl h-full min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-sm">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.daysAgo}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{review.text}</p>
              <div className="flex items-center justify-between">
                {renderStars(review.rating)}
                <span className="text-sm font-medium text-gray-600">{review.rating}</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewCarousel;
