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
    name: "Anandreansyah",
    image: "https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp",
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
    <div className="carousel w-fulls">
      {reviews.map((review, index) => (
        <div key={index} id={`slide${index + 1}`} className="carousel-item w-full">
          <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-md w-full">
            <img src={review.image} className="w-24 h-24 rounded-full mb-4" alt={review.name} />
            <h1 className="text-2xl font-bold">{review.name}</h1>
            <p className="py-2 text-center max-w-xl">{review.text}</p>
            <p className="text-sm text-gray-500">{review.daysAgo}</p>
            <div className="flex gap-1 my-2">{renderStars(review.rating)}</div>

          </div>

          {/* Navigation */}
          <div className="absolute right-12 top-12 flex -translate-y-1/2 transform justify-center gap-2">
            <a href={`#slide${(index - 1 + reviews.length) % reviews.length + 1}`} className="btn">
              ❮
            </a>
            <a href={`#slide${(index + 1) % reviews.length + 1}`} className="btn">
              ❯
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewCarousel;
