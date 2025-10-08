import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import * as turf from "@turf/turf";
import { FaArrowUp } from "react-icons/fa";
// Import necessary React Icons
import { FaArrowRight, FaReply, FaChevronCircleUp, FaCrosshairs, FaPlus, FaMinus, FaComments } from "react-icons/fa";
import { endPoint } from "../Components/ForAPIs";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const directionsClient = mbxDirections({ accessToken: mapboxgl.accessToken });

// Real customer fetch from backend
const fetchCustomerData = async (customerId) => {
  try {
    
    const response = await fetch(`${endPoint}/user/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer data');
    }
    const customerData = await response.json();
    console.log(customerData)
    return customerData;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    // Fallback to mock data if backend fails
  }
};

// Map maneuver modifier strings to React Icons
const maneuverIcons = {
  "uturn": <FaReply className="transform rotate-90" />,
  "sharp right": <FaArrowRight className="transform -rotate-45" />,
  "right": <FaArrowRight />,
  "slight right": <FaArrowRight className="transform rotate-45" />,
  "straight": <FaArrowUp />,
  "slight left": <FaArrowRight className="transform rotate-[135deg]" />,
  "left": <FaArrowRight className="transform rotate-180" />,
  "sharp left": <FaArrowRight className="transform rotate-[225deg]" />,
  "roundabout right": <FaChevronCircleUp className="transform rotate-90" />,
  "roundabout left": <FaChevronCircleUp className="transform -rotate-90" />,
  "arrive": <FaArrowUp className="text-green-500" />,
  "depart": <FaArrowUp className="text-blue-500" />,
  "default": <FaArrowUp />, // fallback
};

export default function RideMap() {
  const { state: ride } = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  console.log(ride)
  const [routePath, setRoutePath] = useState([]);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const journeyActiveRef = useRef(false);

  const [instructions, setInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [remaining, setRemaining] = useState({ distance: 0, duration: 0 });
  const [stepSegments, setStepSegments] = useState([]);
  const [customer, setCustomer] = useState(null);
  
  // Initialize directly from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : false; // default = false if nothing saved
  });

  // Save mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const [mapLoaded, setMapLoaded] = useState(false);
  // NEW REFS for animation state
  const traveledRef = useRef(0);
  const animationRef = useRef(null);
  const intervalRef = useRef(null);

  const computeSmoothHeading = useCallback((path, index, lookAhead = 5) => {
    if (!path.length) return 0;
    const start = path[index];
    const end = path[Math.min(index + lookAhead, path.length - 1)];
    return turf.bearing(turf.point(start), turf.point(end));
  }, []);

// In RideMap.jsx - update the handleChatWithCustomer function
const handleChatWithCustomer = () => {
  if (customer && ride) { // Ensure both customer and ride data are available
    // PASS RIDE ID in the query params
    navigate(`/dashboard/chat?user=${customer._id}&rideId=${ride._id}&rideStatus=${ride.status}`);
  }
};

// ------------------------------------------------------------------
// Fetch route (Uses symbol layers for labels)
  const fetchDirections = useCallback(() => {
    if (!mapInstance.current || !ride) return;

    const waypoints = [
      { coordinates: [ride.pickup.lng, ride.pickup.lat] },
      ...(ride.midwayStops || []).map((s) => ({ coordinates: [s.lng, s.lat] })),
      { coordinates: [ride.dropoff.lng, ride.dropoff.lat] },
    ];

    directionsClient
      .getDirections({ profile: "driving", geometries: "geojson", steps: true, waypoints })
      .send()
      .then((res) => {
        if (!res.body.routes.length) {
          console.error("No routes found");
          return;
        }

        const route = res.body.routes[0];
        const path = route.geometry.coordinates;

        // --- Route line (No change) ---
        if (mapInstance.current.getSource("route")) {
  mapInstance.current.getSource("route").setData(route.geometry);
} else {
  mapInstance.current.addSource("route", { type: "geojson", data: route.geometry });

  // 1️⃣ Stroke layer (behind main line)
  mapInstance.current.addLayer({
      id: "route-stroke",
      type: "line",
      source: "route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
          "line-color": "#034880", // stroke color (black)
          "line-width": 16,        // slightly thicker than main line
      },
  });

  // 2️⃣ Main route line on top
  mapInstance.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
          "line-color": "#42A5F5", // main color
          "line-width": 10,
      },
  });
}

        // --- Driver marker (No change) ---
        if (!mapInstance.current.getSource("driver")) {
          mapInstance.current.addSource("driver", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [ride.pickup.lng, ride.pickup.lat] },
                  properties: { bearing: 0 },
                },
              ],
            },
          });

          mapInstance.current.addLayer({
            id: "driver-layer",
            type: "symbol",
            source: "driver",
            layout: {
              "icon-image": "arrow-icon",
              "icon-size": 0.2,
              "icon-rotate": ["get", "bearing"],
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
            },
          });
        }

        // --- Pickup Label/Icon (NEW LAYER with permanent label) ---
        if (!mapInstance.current.getSource("pickup")) {
            mapInstance.current.addSource("pickup", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [ride.pickup.lng, ride.pickup.lat] },
                        properties: { name: `${ride.pickup.address}` }, // Label set
                    }],
                },
            });
            
            mapInstance.current.addLayer({
                id: "pickup-layer",
                type: "symbol",
                source: "pickup",
                layout: {
                    "icon-image": "marker-15", 
                    "icon-size": 1.5,
                    "text-field": ["get", "name"], // Display the 'name' property
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 1.5],
                    "text-anchor": "top",
                    "text-size": 14,
                },
                paint: {
                    "text-color": isDarkMode ? "#FFFFFF" : "#000000",
                    "text-halo-color": isDarkMode ? "#000000" : "#FFFFFF",
                    "text-halo-width": 1.5,
                }
            });
        }
        
        // --- Midway stops (UPDATED Layer with permanent labels) ---
        if (ride.midwayStops?.length && !mapInstance.current.getSource("midway-stops")) {
          mapInstance.current.addSource("midway-stops", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: ride.midwayStops.map((stop, i) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [stop.lng, stop.lat] },
                properties: { name: stop.address || `Stop ${i + 1}` }, // Label set
              })),
            },
          });
          
          mapInstance.current.addLayer({
            id: "midway-layer",
            type: "symbol",
            source: "midway-stops",
            layout: {
              "icon-image": "midway-icon",
              "icon-size": 0.02,
              "icon-allow-overlap": true,
              "text-field": ["get", "name"], // Display the 'name' property
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1.5],
              "text-anchor": "top",
              "text-size": 14,
            },
             paint: { // Text styling
                "text-color": isDarkMode ? "#FFFFFF" : "#000000",
                "text-halo-color": isDarkMode ? "#000000" : "#FFFFFF",
                "text-halo-width": 1.5,
            }
          });
        }

        // --- Drop-off (UPDATED Layer with permanent labels) ---
        if (!mapInstance.current.getSource("dropoff")) {
          mapInstance.current.addSource("dropoff", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: { type: "Point", coordinates: [ride.dropoff.lng, ride.dropoff.lat] },
                  properties: { name: `${ride.dropoff.address}` }, // Label set
                },
              ],
            },
          });
          
          mapInstance.current.addLayer({
            id: "dropoff-layer",
            type: "symbol",
            source: "dropoff",
            layout: {
              "icon-image": "dropoff-icon",
              "icon-size": 0.2,
              "icon-allow-overlap": true,
               "text-field": ["get", "name"], // Display the 'name' property
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1.5],
              "text-anchor": "top",
              "text-size": 14,
            },
             paint: { // Text styling
                "text-color": isDarkMode ? "#FFFFFF" : "#000000",
                "text-halo-color": isDarkMode ? "#000000" : "#FFFFFF",
                "text-halo-width": 1.5,
            }
          });
        }

        // --- Instructions and segments ---
        const stepsData = [];
        const segments = [];
        let idx = 0;

        route.legs.forEach((leg) =>
          leg.steps.forEach((step) => {
               stepsData.push({
    instruction: step.maneuver.instruction,
    distance: step.distance,
    duration: step.duration,
    maneuver: step.maneuver,   // <--- add this line
  });
            segments.push({
              step,
              startIndex: idx,
              endIndex: idx + step.geometry.coordinates.length - 1,
            });
            idx += step.geometry.coordinates.length;
          })
        );

        setRoutePath(path);
        setInstructions(stepsData);
        setStepSegments(segments);

        if (path.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          path.forEach((c) => bounds.extend(c));
          mapInstance.current.fitBounds(bounds, { padding: 80, duration: 1500 });
        }
      })
      .catch((err) => {
        console.error("Directions API error", err);
      });
  }, [ride, isDarkMode]);

// Start navigation
const handleStartJourney = useCallback(() => {
  if (!routePath.length || journeyActiveRef.current) return;

  setJourneyStarted(true);
  journeyActiveRef.current = true;   // mark journey active

  const line = turf.lineString(routePath);
  const routeLength = turf.length(line, { units: "kilometers" });

  let traveled = 0;
  const speed = 0.003;

  const animate = () => {
    if (traveled >= routeLength) {
      setCurrentStep(instructions.length);
      setRemaining({ distance: 0, duration: 0 });
      setJourneyStarted(false);
      journeyActiveRef.current = false;
      return;
    }
  
    // Get current + next point along the route
    const currentPoint = turf.along(line, traveled, { units: "kilometers" });
    const nextPoint = turf.along(line, traveled + 0.01, { units: "kilometers" });
  
    const coords = currentPoint.geometry.coordinates;
    const heading = turf.bearing(
      turf.point(coords),
      turf.point(nextPoint.geometry.coordinates)
    );
  
    // Update driver marker
    const driverSource = mapInstance.current.getSource("driver");
    if (driverSource) {
      driverSource.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: coords },
            properties: { bearing: heading },
          },
        ],
      });
    }
  
    // Update camera
    mapInstance.current.easeTo({
      center: coords,
      zoom: 17,
      pitch: 65,
      bearing: heading,
      duration: 100,
      easing: (t) => t,
    });
  
    // --- Sync step with marker ---
    const snapped = turf.nearestPointOnLine(line, currentPoint, { units: "kilometers" });
    const traveledSoFar = snapped.properties.location; // total km along route
  
    let currentStepIndex = 0;
    let cumulative = 0;
    let remainingDistance = 0;
  
    for (let i = 0; i < stepSegments.length; i++) {
      const segment = stepSegments[i];
      const segmentLine = turf.lineString(
        routePath.slice(segment.startIndex, segment.endIndex + 1)
      );
      const segLength = turf.length(segmentLine, { units: "kilometers" });
  
      if (traveledSoFar >= cumulative && traveledSoFar <= cumulative + segLength) {
        currentStepIndex = i;
        remainingDistance = cumulative + segLength - traveledSoFar;
        break;
      }
      cumulative += segLength;
    }
  
    // Update UI state
    setCurrentStep(currentStepIndex);
    setRemaining({
      distance: remainingDistance * 1000, // meters
      duration: (remainingDistance / 0.06) * 60, // minutes at 60 km/h
    });
  
    // Advance along route
    traveled += speed;
  
    if (journeyActiveRef.current) {
      requestAnimationFrame(animate);
    }
  };  

  animate();
}, [routePath, instructions, stepSegments]);

useEffect(() => {
  return () => {
    journeyActiveRef.current = false;
  };
}, []);

// Camera control functions
const centerOnDriver = useCallback(() => {
  if (!mapInstance.current) return;
  
  const driverSource = mapInstance.current.getSource("driver");
  if (driverSource) {
    const driverData = driverSource._data;
    if (driverData && driverData.features && driverData.features.length > 0) {
      const driverCoords = driverData.features[0].geometry.coordinates;
      mapInstance.current.easeTo({
        center: driverCoords,
        duration: 1000,
      });
    }
  }
}, []);

const zoomIn = useCallback(() => {
  if (!mapInstance.current) return;
  mapInstance.current.zoomIn();
}, []);

const zoomOut = useCallback(() => {
  if (!mapInstance.current) return;
  mapInstance.current.zoomOut();
}, []);

// ------------------------------------------------------------------

  // Fetch customer info
  useEffect(() => {
    if (ride?.customerId) {
      fetchCustomerData(ride.customerId)
        .then(setCustomer)
        .catch(() => setCustomer({ name: ride.riderName || "Customer" }));
    }
  }, [ride]);

  // Init map (Phase 1: Map Instance Creation)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const mapStyle = isDarkMode
        ? "mapbox://styles/mapbox/navigation-night-v1"
        : "mapbox://styles/mapbox/navigation-day-v1";

    mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: mapStyle,
        center: [ride.pickup.lng, ride.pickup.lat],
        zoom: 14,
        pitch: 0,
        bearing: 0,
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapInstance.current.on("load", () => {
        setMapLoaded(true); 

        // --- Load driver arrow ---
        mapInstance.current.loadImage(
            "https://i.ibb.co/Psm5vrxs/Gemini-Generated-Image-aaev1maaev1maaev-removebg-preview.png",
            (error, image) => {
                if (error) throw error;
                if (!mapInstance.current.hasImage("arrow-icon")) {
                    mapInstance.current.addImage("arrow-icon", image);
                }
            }
        );

        // --- Load midway stop icon ---
        mapInstance.current.loadImage(
            "https://i.ibb.co/N6c33bGK/349750.png",
            (error, image) => {
                if (error) throw error;
                if (!mapInstance.current.hasImage("midway-icon")) {
                    mapInstance.current.addImage("midway-icon", image);
                }
            }
        );

        // --- Load drop-off icon ---
        mapInstance.current.loadImage(
            "https://i.ibb.co/MxJckn1b/location-icon-png-4240.png",
            (error, image) => {
                if (error) throw error;
                if (!mapInstance.current.hasImage("dropoff-icon")) {
                    mapInstance.current.addImage("dropoff-icon", image);
                }
            }
        );
    });

    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
}, [ride, isDarkMode]);

// Phase 2: Add static elements and fetch route 
useEffect(() => {
  if (!mapLoaded || !mapInstance.current) return;

  // --- Fetch route (which now includes adding layers with text labels) ---
  fetchDirections();
  
  // --- Setup map event handlers (Hover logic removed in last step as labels are permanent, but leaving the empty handlers for structure) ---
  let hoverPopup = null;
  const currentMap = mapInstance.current;

  currentMap.on('mouseenter', 'midway-layer', (e) => {
      currentMap.getCanvas().style.cursor = 'pointer';
  });
  
  currentMap.on('mouseleave', 'midway-layer', () => {
      currentMap.getCanvas().style.cursor = '';
      if (hoverPopup) {
          hoverPopup.remove();
          hoverPopup = null;
      }
  });
  
  currentMap.on('mouseenter', 'dropoff-layer', (e) => {
      currentMap.getCanvas().style.cursor = 'pointer';
  });

  currentMap.on('mouseleave', 'dropoff-layer', (e) => {
      currentMap.getCanvas().style.cursor = '';
      e.features[0].popupInstance?.remove();
  });

  // Cleanup function for event listeners
  return () => {
      if (currentMap) {
          if (currentMap.listens('mouseenter', 'midway-layer')) currentMap.off('mouseenter', 'midway-layer');
          if (currentMap.listens('mouseleave', 'midway-layer')) currentMap.off('mouseleave', 'midway-layer');
          if (currentMap.listens('mouseenter', 'dropoff-layer')) currentMap.off('mouseenter', 'dropoff-layer');
          if (currentMap.listens('mouseleave', 'dropoff-layer')) currentMap.off('mouseleave', 'dropoff-layer');
      }
  };

}, [mapLoaded, fetchDirections, ride]);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (!ride) return <p>No ride data</p>;

 // Before the return statement, add this safety check
const currentInstruction = instructions[currentStep] || null;
// Add this useEffect for cleanup
useEffect(() => {
  return () => {
    // Clear any ongoing animation when component unmounts
    setJourneyStarted(false);
  };
}, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* TOP NAVIGATION HEADER (MATCHING DESIGN) */}
   {journeyStarted && currentInstruction && (
  <div className="absolute top-0 left-0 right-0 p-3 z-10 flex justify-between items-start">
    {/* Left: Instruction Box */}
    <div
      className={`px-10 py-6 rounded-xl shadow-2xl max-w-sm ${
        isDarkMode ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
      }`}
    >
      <div className="flex items-center gap-8">
        {/* Turn Icon */}
        <span className="text-5xl font-medium">
          {maneuverIcons[currentInstruction.maneuver?.modifier] ||
           maneuverIcons[currentInstruction.maneuver?.type] ||
           maneuverIcons["default"]}
        </span>

        <div>
          {/* Distance until turn - Use remaining.distance instead of currentInstruction.distance */}
          <p className="text-4xl font-semibold mb-2 leading-none">
            {(remaining.distance / 1609.34).toFixed(1)} mi
          </p>
          {/* Instruction text */}
          <p className="text-sm font-normal">
            {currentInstruction.instruction}
          </p>
        </div>
      </div>
    </div>

    {/* Right: Speed Limit Box - REMOVED FROM TOP HEADER */}
  </div>
)}

      {/* RIGHT SIDE SETTINGS/WIDGETS */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-20">
        {/* Settings Icon (Top Right) */}
        <button className={`p-3 text-2xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}>
          ⚙️
        </button>
       {/* { // Dark mode toggle button} */}
<button
  onClick={() => {setIsDarkMode(!isDarkMode);
    window.location.reload(); // reload if you still want it
    }
  }
  className={`p-3 text-2xl rounded-xl shadow-lg ${
    isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
  }`}
>
  {isDarkMode ? "☀️" : "🌙"}
</button>

      </div>

      {/* CAMERA CONTROLS - Bottom Right */}
      <div className="absolute bottom-32 right-4 flex flex-col space-y-2 z-20">
        {/* Center on Driver Button */}
        <button 
          onClick={centerOnDriver}
          className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
          title="Center on driver"
        >
          <FaCrosshairs />
        </button>
        
        {/* Zoom In Button */}
        <button 
          onClick={zoomIn}
          className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
          title="Zoom in"
        >
          <FaPlus />
        </button>
        
        {/* Zoom Out Button */}
        <button 
          onClick={zoomOut}
          className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
          title="Zoom out"
        >
          <FaMinus />
        </button>
      </div>

      {/* SPEED LIMIT - Bottom Left */}
<div className={`absolute bottom-32 left-4 text-center p-3 rounded-xl shadow-lg border-4 
  ${isDarkMode ? "border-white bg-white text-black" : "border-white bg-white text-black"}`}>
  <p className="text-2xl font-extrabold leading-none">
    {journeyStarted ? Math.round((remaining.distance / 1609.34) * 2.23694) : 0}
  </p>
  <p className="text-xs">mph</p>
</div>

      {/* BOTTOM NAVIGATION BAR (MATCHING DESIGN) */}
      <div className={`absolute flex gap-24 flex-row-reverse bottom-0 w-full shadow-2xl z-10 px-10`}>
        
        {/* START JOURNEY BUTTON (When stopped) */}
        {!journeyStarted && routePath.length > 0 && (
          <button
            onClick={handleStartJourney}
            className="text-center flex items-center justify-center
 mb-4 bg-gray-900 text-white w-28 h-24 rounded-full shadow-lg hover:bg-black font-bold"
          >
            <img src="https://i.ibb.co/Psm5vrxs/Gemini-Generated-Image-aaev1maaev1maaev-removebg-preview.png" alt="" 
   className=" w-28"/>
          </button>
        )}

        {/* NAVIGATION INFO BAR (When running or initial state) */}
        <div className={`flex items-center w-full p-5 rounded-xl justify-between h-full 
  ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Left Section: Menu Button */}
            <button className={`p-2 rounded-full text-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                &#x22EE; {/* Three vertical dots (More menu) */}
            </button>
            
            {/* Center Section: Time/Distance/Emoji */}
            <div className="flex-1 flex justify-center items-center">
                {journeyStarted ? (
                    // When Navigating (shows estimated time/arrival)
                    <div className="text-center">
                        <p className="font-semibold text-sm">
                            {(remaining.duration / 60).toFixed(0)} min
                        </p>
                        <p className="opacity-70 text-xs">
                            ETA: {new Date(Date.now() + remaining.duration * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                ) : (
                    // Initial state (shows total route time/distance)
                    <div className="text-center">
                        <p className="font-bold text-lg">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="opacity-70 text-xs">{ride.distance
  ? `${ride.distance} • ${ride.eta} min`
  : `${(remaining.distance / 1609.34).toFixed(1)} mi • ${ride.eta} `
}
                        </p>
                    </div>
                )}
            </div>
            
      {/* CUSTOMER INFO - Top Left */}
      {customer && (
        <div className={` top-4 left-4 p-4 rounded-xl shadow-lg z-20 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
  {customer.firstName?.charAt(0)}
</div>
<div>
  <p className="font-semibold">
    {customer.firstName} {customer.lastName}
  </p>
  <p className="text-sm opacity-75">
    ⭐ {customer.rating || 4.8}
  </p>
</div>

            <button
              onClick={handleChatWithCustomer}
              className={`p-3 rounded-full ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              } text-white ml-2`}
              title="Chat with customer"
            >
              <FaComments />
            </button>
          </div>
        </div>
      )}

          
        </div>
      </div>
    </div>
  );
}