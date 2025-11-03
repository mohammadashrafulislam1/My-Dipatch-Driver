import { useActiveRide } from '../contexts/ActiveRideContext';
import { FaCar, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

const GlobalRideStatus = () => {
  const { isActive, activeRide } = useActiveRide();
   console.log(activeRide)
  const shouldShow =
    isActive &&
    activeRide &&
    ["accepted", "on_the_way", "in_progress"].includes(activeRide.status);

  if (!shouldShow) return null;

  // (only the relevant part)
const handleClick = () => {
    if (activeRide && activeRide._id) {
      // full page load fallback (works even outside Router)
      window.location.href = `/ride/${activeRide._id}`;
      // or: window.location.assign(`/ride/${activeRide._id}`);
    }
  };

  const getStatusText = () => {
    switch (activeRide.status) {
      case 'accepted':
        return 'Ride Accepted';
      case 'on_the_way':
        return 'On the Way';
      case 'in_progress':
        return 'Ride in Progress';
      default:
        return 'Active Ride';
    }
  };

  // fallback values
  const etaText = activeRide?.eta ? `${activeRide.eta} min` : '';
  const distanceText = activeRide?.distance ? `${activeRide.distance}` : '';

  return (
    <>
      {/* Desktop / large screens */}
      <button
        onClick={handleClick}
        aria-label="Open active ride"
        className="hidden sm:flex fixed bottom-12 left-4 z-[9999] items-center gap-3
                   bg-gradient-to-r from-green-500 to-green-600 text-white
                   px-4 py-3 rounded-2xl shadow-2xl transform transition-transform
                   hover:scale-105 focus:scale-105 focus:outline-none cursor-pointer"
      >
        {/* Animated pulse / vehicle */}
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute w-10 h-10 rounded-full bg-white/20 animate-ping"></div>
          <div className="z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <FaCar className="text-white text-lg" />
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide">{getStatusText()}</span>
            <span
              className={`ml-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                activeRide.status === 'in_progress'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white'
              }`}
            >
              {activeRide.status.replaceAll('_', ' ')}
            </span>
          </div>

          <div className="text-[13px] opacity-90 mt-1 flex items-center gap-3">
            {activeRide?.riderName ? (
              <span className="font-medium">{activeRide.riderName}</span>
            ) : null}
            {distanceText ? (
              <span className="flex items-center gap-1 text-xs opacity-90">
                <FaMapMarkerAlt className="text-white/90" />
                {distanceText}
              </span>
            ) : null}
            {etaText ? <span className="text-xs opacity-90">• {etaText}</span> : null}
          </div>
        </div>

        <div className="ml-4 opacity-90">
          <FaChevronRight />
        </div>
      </button>

      {/* Mobile */}
      <button
        onClick={handleClick}
        aria-label="Open active ride"
        className="sm:hidden fixed top-3 left-3 z-[9999] flex items-center gap-2
                   bg-gradient-to-r from-green-500 to-green-600 text-white
                   px-3 py-2 rounded-xl shadow-lg transform transition-transform
                   hover:scale-105 focus:scale-105 focus:outline-none cursor-pointer"
      >
        <div className="relative w-8 h-8">
          <div className="absolute w-8 h-8 rounded-full bg-white/20 animate-ping"></div>
          <div className="relative z-10 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
            <FaCar className="text-white text-sm" />
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight">{getStatusText()}</span>
          <span className="text-[11px] opacity-90">
            {distanceText ? `${distanceText} • ` : ''}
            {etaText}
          </span>
        </div>
      </button>
    </>
  );
};

export default GlobalRideStatus;