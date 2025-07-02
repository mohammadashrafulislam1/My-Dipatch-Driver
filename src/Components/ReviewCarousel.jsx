import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const reviews = [
  {
    name: "Jons Sena",
    image: "https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp",
    rating: 4.5,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    daysAgo: "2 days ago",
  },
  {
    name: "Sofia",
    image: "https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp",
    rating: 4.0,
    text: "Lorem Ipsum has been the industry's standard dummy text.",
    daysAgo: "2 days ago",
  },
  {
    name: "Anandreansyah",
    image: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
    rating: 5,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    daysAgo: "2 days ago",
  },
  {
    name: "Anandreansyah3",
    image: "https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp",
    rating: 5,
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    daysAgo: "2 days ago",
  },
];

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push(<FaStar key={i} className="text-yellow-500" />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
    else stars.push(<FaRegStar key={i} className="text-yellow-500" />);
  }
  return stars;
};


const ReviewCarousel = () => {
  return (
    <div className="w-full">
      <Swiper
        slidesPerView={1}
        spaceBetween={24}
        navigation={true}
        modules={[Navigation]}
        className="w-full"
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white shadow-md rounded-xl p-6 h-full flex flex-col justify-between transition-all hover:shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.daysAgo}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{review.text}</p>
              <div className="flex gap-1">{renderStars(review.rating)}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ReviewCarousel;
