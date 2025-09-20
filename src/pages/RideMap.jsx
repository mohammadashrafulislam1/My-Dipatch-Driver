import {
    GoogleMap,
    LoadScript,
    DirectionsRenderer,
    Marker,
  } from "@react-google-maps/api";
  import { useEffect, useState, useRef } from "react";
  import { useLocation } from "react-router-dom";
  
  export default function RideMap() {
    const { state: ride } = useLocation(); // ride data passed from navigate
    const [directions, setDirections] = useState(null);
    const [journeyStarted, setJourneyStarted] = useState(false);
    const [driverPosition, setDriverPosition] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);
  
    // Load directions from pickup -> midway -> dropoff
    const handleLoad = (map) => {
      if (!ride) return;
  
      const directionsService = new window.google.maps.DirectionsService();
  
      const waypoints =
        ride.midwayStops?.map((stop) => ({
          location: stop.address,
          stopover: true,
        })) || [];
  
      directionsService.route(
        {
          origin: ride.pickup.address,
          destination: ride.dropoff.address,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
  
            // Extract route path as an array of LatLng
            const path = [];
            result.routes[0].legs.forEach((leg) => {
              leg.steps.forEach((step) => {
                step.path.forEach((point) => path.push(point));
              });
            });
            setRoutePath(path);
  
            // Set initial driver position at pickup
            if (path.length > 0) setDriverPosition(path[0]);
          } else {
            console.error("❌ Directions request failed:", status);
          }
        }
      );
    };
  
    // Start journey simulation
    const handleStartJourney = () => {
      if (!routePath.length) return;
  
      setJourneyStarted(true);
      setCurrentIndex(0);
  
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= routePath.length - 1) {
            clearInterval(intervalRef.current);
            return prev;
          }
          setDriverPosition(routePath[prev + 1]);
          return prev + 1;
        });
      }, 500); // move marker every 0.5 seconds
    };
  
    // Cleanup interval on unmount
    useEffect(() => {
      return () => clearInterval(intervalRef.current);
    }, []);
  
    if (!ride) return <p>No ride data</p>;
  
    return (
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <div className="relative w-full h-screen">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={driverPosition || { lat: 37.7749, lng: -122.4194 }}
            zoom={14}
            onLoad={handleLoad}
          >
            {directions && <DirectionsRenderer directions={directions} />}
  
            {/* 🚖 Driver moving marker */}
            {journeyStarted && driverPosition && (
              <Marker position={driverPosition} label="🚖" />
            )}
          </GoogleMap>
  
          {/* 🚀 Start Journey Button */}
          {!journeyStarted && routePath.length > 0 && (
            <button
              onClick={handleStartJourney}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
            >
              🚀 Start Journey
            </button>
          )}
        </div>
      </LoadScript>
    );
  }
  