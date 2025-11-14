import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // ADD THIS LINE - IMPORT MAPBOX CSS
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import * as turf from "@turf/turf";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowRight, FaReply, FaChevronCircleUp, FaCrosshairs, FaPlus, FaMinus, FaComments } from "react-icons/fa";
import { endPoint } from "../Components/ForAPIs";
import { useActiveRide } from "../contexts/ActiveRideContext";
import io from "socket.io-client";
import useAuth from "../Components/useAuth";
import useLocationPermission from "../Components/useLocationPermission.jsx";

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
    return customerData;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }
};

// --- Helper to fetch ride by id from backend ---
const fetchRideById = async (id) => {
  try {
    const res = await fetch(`${endPoint}/rides/${id}`);
    if (!res.ok) throw new Error('ride not found');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch ride by id', err);
    return null;
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
  "default": <FaArrowUp />,
};

export default function RideMap() {
  // Router hooks & params
  const location = useLocation();
  const params = useParams(); // expects route /ride/:id
  const navigate = useNavigate();
  const {user} = useAuth();
  const [driverLocation, setDriverLocation] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [rideFinished, setRideFinished] = useState(false);
const [followDriver, setFollowDriver] = useState(false);
const [atPickup, setAtPickup] = useState(false);
const [atDropoff, setAtDropoff] = useState(false);
const [dropoffStarted, setDropoffStarted] = useState(false);
const {
  locationEnabled,
  handleGeoError,
  LocationModal,
} = useLocationPermission({ setDriverLocation });
const [currentZoom, setCurrentZoom] = useState(14);
const [showMainRoute, setShowMainRoute] = useState(true);


  // Add driverMarker ref definition
  const driverMarker = useRef(null);

  // ActiveRideContext functions and globalActiveRide
  const { startRide, endRide, setIsActive, updateRideStatus, activeRide: globalActiveRide } = useActiveRide();

  // Local state that holds the ride object we will use in this component
  const [rideData, setRideData] = useState(() => location.state ?? null);
const [rideStatus, setRideStatus] = useState(rideData?.status || "accepted");

// 🧭 Restore ride progress after reload
useEffect(() => {
  if (!rideData?._id) return;
  const saved = localStorage.getItem(`rideProgress_${rideData._id}`);
  console.log("🔄 RESTORING FROM STORAGE:", saved);
  if (saved) {
    try {
      const progress = JSON.parse(saved);
      console.log("📦 PARSED PROGRESS:", progress);
      if (progress.rideStatus) {
        console.log("🔄 Restoring rideStatus:", progress.rideStatus);
        setRideStatus(progress.rideStatus);
      }
      if (progress.atPickup) {
        console.log("🔄 Restoring atPickup:", progress.atPickup);
        setAtPickup(progress.atPickup);
      }
      if (progress.dropoffStarted) {
        console.log("🔄 Restoring dropoffStarted:", progress.dropoffStarted);
        setDropoffStarted(progress.dropoffStarted);
      }
      if (progress.atDropoff) {
        console.log("🔄 Restoring atDropoff:", progress.atDropoff);
        setAtDropoff(progress.atDropoff);
      }
      if (progress.rideFinished) {
        console.log("🔄 Restoring rideFinished:", progress.rideFinished);
        setRideFinished(progress.rideFinished);
      }
      if (progress.journeyStarted) {
        console.log("🔄 Restoring journeyStarted:", progress.journeyStarted);
        setJourneyStarted(progress.journeyStarted);
      }
    } catch (e) {
      console.warn("Failed to parse ride progress:", e);
    }
  } else {
    console.log("📭 No saved progress found, starting fresh");
  }
}, [rideData?._id]);


  // Map refs and other UI state (all hooks declared unconditionally)
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [routePath, setRoutePath] = useState([]);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const journeyActiveRef = useRef(false);

  const [instructions, setInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [remaining, setRemaining] = useState({ distance: 0, duration: 0 });
  const [stepSegments, setStepSegments] = useState([]);
  const [customer, setCustomer] = useState(null);
const hasFittedBounds = useRef(false);

  // Initialize directly from localStorage for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? saved === "true" : false;
  });
  
  useEffect(() => {
    console.log(rideData)
  if (rideData?.status === "completed") {
    setRideFinished(true);
    setRideStatus("completed");
  }
}, [rideData]);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const traveledRef = useRef(0);
  const animationRef = useRef(null);
  const intervalRef = useRef(null);

  const computeSmoothHeading = useCallback((path, index, lookAhead = 5) => {
    if (!path.length) return 0;
    const start = path[index];
    const end = path[Math.min(index + lookAhead, path.length - 1)];
    return turf.bearing(turf.point(start), turf.point(end));
  }, []);

// Resolve rideData when component mounts or when relevant sources change
useEffect(() => {
  let mounted = true;

  const resolveRide = async () => {
    // If we already have rideData, don't resolve again
    if (rideData) return;

    // 1) If location.state is present use that
    if (location.state) {
      if (mounted) setRideData(location.state);
      // Only set status to completed if the ride is actually completed
      if (location.state.status === "completed") {
        setRideStatus("completed");
        setRideFinished(true);
      }
      return;
    }

    const id = params.id;

    // 2) If there's a globalActiveRide that matches the param id, use that
    if (globalActiveRide && id && globalActiveRide._id === id) {
      if (mounted) setRideData(globalActiveRide);
      if (globalActiveRide.status === "completed") {
        setRideStatus("completed");
        setRideFinished(true);
      }
      return;
    }

    // 3) Try reading from localStorage (persisted by ActiveRideContext)
    try {
      const saved = localStorage.getItem('activeRide');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed._id === id) {
          if (mounted) setRideData(parsed);
          if (parsed.status === "completed") {
            setRideStatus("completed");
            setRideFinished(true);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse activeRide from localStorage', e);
    }

    // 4) As a last resort fetch the ride from server by id
    if (id) {
      const fetched = await fetchRideById(id);
      if (fetched && mounted) {
        setRideData(fetched);
        if (fetched.status === "completed") {
          setRideStatus("completed");
          setRideFinished(true);
        }
      }
    }
  };

  resolveRide();

  return () => {
    mounted = false;
  };
}, [location.state, params.id, globalActiveRide, rideData]);

  // Update fetch customer when rideData changes
  useEffect(() => {
    if (rideData?.customerId) {
      fetchCustomerData(rideData.customerId)
        .then(setCustomer)
        .catch(() => setCustomer({ firstName: rideData.riderName || "Customer" }));
    } else if (rideData?.riderName) {
      setCustomer({ firstName: rideData.riderName });
    } else {
      setCustomer(null);
    }
  }, [rideData]);
// 🧭 Calculate remaining distance & duration live
useEffect(() => {
  if (!driverLocation || instructions.length === 0) return;

  try {
    // 🧹 Filter out invalid coords
    const routeCoords = instructions
      .flatMap((s) => s.coords || [])
      .filter(
        (c) =>
          Array.isArray(c) &&
          c.length === 2 &&
          typeof c[0] === "number" &&
          typeof c[1] === "number" &&
          !isNaN(c[0]) &&
          !isNaN(c[1])
      );

    if (routeCoords.length < 2) {
      console.warn("Skipping remaining-distance calc: not enough coords");
      return;
    }

    const routeLine = turf.lineString(routeCoords);
    const driverPoint = turf.point(driverLocation);

    // Find nearest point on route
    const snapped = turf.nearestPointOnLine(routeLine, driverPoint, {
      units: "meters",
    });

    const totalDistance = turf.length(routeLine, { units: "meters" });
    const traveledDistance = snapped.properties.location * totalDistance;
    const remainingDistance = totalDistance - traveledDistance;

    // Estimate remaining duration
    const totalDuration = instructions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const remainingDuration =
      totalDuration * (remainingDistance / totalDistance);

    setRemaining({
      distance: remainingDistance || 0, // meters
      duration: remainingDuration || 0, // seconds
    });
  } catch (err) {
    console.warn("Failed to compute remaining distance:", err);
  }
}, [driverLocation, instructions]);

  // Fix the pickup/dropoff reference error by moving this inside a useEffect that depends on rideData
useEffect(() => {
  if (!driverLocation || !rideData?.pickup) return;

  const pickupDist = getDistance(driverLocation, [rideData.pickup.lng, rideData.pickup.lat]);

  // ❌ Never auto-set atPickup here
  if (rideStatus === "in_progress" && pickupDist < 50) {
    console.log("Near pickup");
    setFollowDriver(false);
  }
}, [driverLocation, rideData, rideStatus]);


  const socketRef = useRef(null);
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io("https://my-dipatch-backend.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join", { userId: user._id, role: "driver" });
    });

    return () => socket.disconnect();
  }, [user?._id]);
  // 🔧 Reusable status update helper
const updateRideStat = async (id, status) => {
  try {
    const res = await fetch(`${endPoint}/rides/status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Failed to update: ${status}`);
    console.log(`✅ Ride status updated to: ${status}`);
  } catch (err) {
    console.error("❌ Ride status update failed:", err);
  }
};

// ===== THESE HANDLERS =====
// Show route from current location to next destination (midway or dropoff)
const showRouteToNextDestination = useCallback(async () => {
  if (!driverLocation || !rideData || !mapInstance.current) return;

  let destination;
  let destinationName = "";

  // Determine next destination
  if (rideData?.midwayStops?.length > 0) {
    // Going to midway stop
    destination = [rideData.midwayStops[0].lng, rideData.midwayStops[0].lat];
    destinationName = "midway stop";
  } else {
    // Going directly to dropoff
    destination = [rideData.dropoff.lng, rideData.dropoff.lat];
    destinationName = "dropoff";
  }

  console.log(`🔄 Showing route from current location to ${destinationName}`);

  try {
    // Fetch and display route
    const directions = await directionsClient
      .getDirections({
        profile: "driving",
        geometries: "geojson",
        steps: true,
        waypoints: [
          { coordinates: driverLocation },
          { coordinates: destination },
        ],
      })
      .send();

    const route = directions.body.routes[0];
    
    // Extract steps for instructions
    const stepsData = [];
    route.legs.forEach((leg) =>
      leg.steps.forEach((step) => {
        stepsData.push({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
          coords: step.geometry.coordinates,
        });
      })
    );

    // 🗺️ ADD THE ROUTE TO THE MAP
    const geojson = {
      type: "Feature",
      geometry: route.geometry,
    };

    // Remove existing route if any
    if (mapInstance.current.getSource("current-to-destination")) {
      mapInstance.current.getSource("current-to-destination").setData(geojson);
    } else {
      mapInstance.current.addSource("current-to-destination", {
        type: "geojson",
        data: geojson,
      });

      // Add stroke line
      mapInstance.current.addLayer(
        {
          id: "current-to-destination-stroke",
          type: "line",
          source: "current-to-destination",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#034880",
            "line-width": 14,
          },
        },
        "driver-layer"
      );

      // Add inner bright line
      mapInstance.current.addLayer(
        {
          id: "current-to-destination-line",
          type: "line",
          source: "current-to-destination",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#42A5F5",
            "line-width": 8,
          },
        },
        "driver-layer"
      );
    }

    setInstructions(stepsData);
    setCurrentStep(0);
   
    setFollowDriver(true);

  } catch (error) {
    console.error("Failed to fetch route to next destination:", error);
  }

}, [driverLocation, rideData]);

// Move from current location → Pickup
const handleStartToPickup = useCallback(async () => {
  if (!driverLocation || !rideData?.pickup) return;

  setRideStatus("in_progress");
  setJourneyStarted(true);
  setFollowDriver(true); // ✅ enable camera follow
        await updateRideStat(rideData._id, "in_progress");
updateRideStatus("in_progress"); // ✅ Sync context


  const directions = await directionsClient
    .getDirections({
      profile: "driving",
      geometries: "geojson",
      steps: true, // ✅ must be true
      waypoints: [
        { coordinates: driverLocation },
        { coordinates: [rideData.pickup.lng, rideData.pickup.lat] },
      ],
    })
    .send();

  const route = directions.body.routes[0];
  const path = route.geometry.coordinates;
  const line = turf.lineString(path);
  const totalDistance = turf.length(line, { units: "kilometers" });

  // ✅ Extract instructions
  const stepsData = [];
  route.legs.forEach((leg) =>
    leg.steps.forEach((step) => {
      stepsData.push({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration,
        maneuver: step.maneuver,
        coords: step.geometry.coordinates,
      });
    })
  );
  setInstructions(stepsData);
  setCurrentStep(0);

}, [driverLocation, rideData]);


// Stop at midway stop
const handleAtMidwayStop = async () => {
  setRideStatus("at_stop");
  await fetch(`${endPoint}/rides/status/${rideData._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "at_stop" }),
  });
  console.log("🛑 Reached midway stop");
};


//-------
// Update the handlePickupToMidway function
const handlePickupToMidway = useCallback(async () => {
  if (!driverLocation || !rideData?.midwayStops?.length || !mapInstance.current) return;

  setRideStatus("on_the_way");
  setFollowDriver(true);

  await updateRideStat(rideData._id, "on_the_way");
  updateRideStatus("on_the_way");

  try {
    // 🧹 REMOVE MAIN ROUTE FIRST
    const map = mapInstance.current;
    if (map.getLayer("route")) map.removeLayer("route");
    if (map.getLayer("route-stroke")) map.removeLayer("route-stroke");
    if (map.getSource("route")) map.removeSource("route");
    console.log("✅ Main route removed");

    // ✅ Fetch route from CURRENT LOCATION to midway stop
    const directions = await directionsClient
      .getDirections({
        profile: "driving",
        geometries: "geojson",
        steps: true,
        waypoints: [
          { coordinates: driverLocation },
          { coordinates: [rideData.midwayStops[0].lng, rideData.midwayStops[0].lat] },
        ],
      })
      .send();

    const route = directions.body.routes[0];
    
    // ✅ Extract maneuver steps
    const stepsData = [];
    route.legs.forEach((leg) =>
      leg.steps.forEach((step) => {
        stepsData.push({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
          coords: step.geometry.coordinates,
        });
      })
    );

    // 🗺️ ADD THE NEW ROUTE TO THE MAP
    const geojson = {
      type: "Feature",
      geometry: route.geometry,
    };

    if (mapInstance.current.getSource("current-to-destination")) {
      mapInstance.current.getSource("current-to-destination").setData(geojson);
    } else {
      mapInstance.current.addSource("current-to-destination", {
        type: "geojson",
        data: geojson,
      });

      mapInstance.current.addLayer(
        {
          id: "current-to-destination-stroke",
          type: "line",
          source: "current-to-destination",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#034880", "line-width": 14 },
        },
        "driver-layer"
      );

      mapInstance.current.addLayer(
        {
          id: "current-to-destination-line",
          type: "line",
          source: "current-to-destination",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#42A5F5", "line-width": 8 },
        },
        "driver-layer"
      );
    }

    setInstructions(stepsData);
    setCurrentStep(0);

  } catch (error) {
    console.error("Failed to fetch route to midway:", error);
  }
}, [driverLocation, rideData, mapInstance, user]);
// Add this function to update current-to-pickup route when driver location changes
const updateCurrentToPickupRoute = useCallback(async () => {
  if (!mapInstance.current || !driverLocation || !rideData?.pickup || atPickup) return;

  try {
    console.log("🔄 Updating current-to-pickup route with latest driver location");
    
    const directions = await directionsClient
      .getDirections({
        profile: "driving",
        geometries: "geojson",
        steps: false,
        waypoints: [
          { coordinates: driverLocation },
          { coordinates: [rideData.pickup.lng, rideData.pickup.lat] },
        ],
      })
      .send();

    if (!directions.body.routes.length) {
      console.error("No current-to-pickup route found");
      return;
    }

    const pickupRoute = directions.body.routes[0];
    const geojson = {
      type: "Feature",
      geometry: pickupRoute.geometry,
    };

    const map = mapInstance.current;
    
    // Update or create the current-to-pickup source
    if (map.getSource("current-to-pickup")) {
      map.getSource("current-to-pickup").setData(geojson);
    } else {
      map.addSource("current-to-pickup", {
        type: "geojson",
        data: geojson,
      });

      // Add stroke line first (darker blue outline)
      if (!map.getLayer("current-to-pickup-stroke")) {
        map.addLayer(
          {
            id: "current-to-pickup-stroke",
            type: "line",
            source: "current-to-pickup",
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#1e3a8a",
              "line-width": 8,
              "line-opacity": 0.8,
            },
          },
          "driver-layer"
        );
      }

      // Add inner bright blue line
      if (!map.getLayer("current-to-pickup-line")) {
        map.addLayer(
          {
            id: "current-to-pickup-line",
            type: "line",
            source: "current-to-pickup",
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#3b82f6",
              "line-width": 5,
              "line-opacity": 0.9,
            },
          },
          "driver-layer"
        );
      }

      // Add dashed line effect
      if (!map.getLayer("current-to-pickup-dash")) {
        map.addLayer(
          {
            id: "current-to-pickup-dash",
            type: "line",
            source: "current-to-pickup",
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#ffffff",
              "line-width": 2,
              "line-dasharray": [1, 2],
              "line-opacity": 0.7,
            },
          },
          "driver-layer"
        );
      }
    }
    
    console.log("✅ Current-to-pickup route updated with latest location");
  } catch (err) {
    console.error("Failed to update current→pickup route:", err);
  }
}, [driverLocation, rideData, atPickup]);

// Update the handlePickupToDropoff function
const handlePickupToDropoff = useCallback(async () => {
  if (!driverLocation || !rideData?.dropoff || !mapInstance.current) return;

  setRideStatus("on_the_way");
  setFollowDriver(true);

  await updateRideStat(rideData._id, "on_the_way");
  updateRideStatus("on_the_way");

  try {
    // 🧹 REMOVE MAIN ROUTE FIRST
    const map = mapInstance.current;
    if (map.getLayer("route")) map.removeLayer("route");
    if (map.getLayer("route-stroke")) map.removeLayer("route-stroke");
    if (map.getSource("route")) map.removeSource("route");
    console.log("✅ Main route removed");

    // ✅ Fetch route from CURRENT LOCATION to dropoff
    const directions = await directionsClient
      .getDirections({
        profile: "driving",
        geometries: "geojson",
        steps: true,
        waypoints: [
          { coordinates: driverLocation },
          { coordinates: [rideData.dropoff.lng, rideData.dropoff.lat] },
        ],
      })
      .send();

    const route = directions.body.routes[0];
    const stepsData = [];
    route.legs.forEach((leg) =>
      leg.steps.forEach((step) => {
        stepsData.push({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
          coords: step.geometry.coordinates,
        });
      })
    );

    // 🗺️ ADD THE NEW ROUTE TO THE MAP
    const geojson = {
      type: "Feature",
      geometry: route.geometry,
    };

    if (mapInstance.current.getSource("current-to-destination")) {
      mapInstance.current.getSource("current-to-destination").setData(geojson);
    } else {
      mapInstance.current.addSource("current-to-destination", {
        type: "geojson",
        data: geojson,
      });

      mapInstance.current.addLayer(
        {
          id: "current-to-destination-stroke",
          type: "line",
          source: "current-to-destination",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#034880", "line-width": 14 },
        },
        "driver-layer"
      );

      mapInstance.current.addLayer(
        {
          id: "current-to-destination-line",
          type: "line",
          source: "current-to-destination",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#42A5F5", "line-width": 8 },
        },
        "driver-layer"
      );
    }

    setInstructions(stepsData);
    setCurrentStep(0);
  } catch (error) {
    console.error("Failed to fetch route to dropoff:", error);
  }
}, [driverLocation, rideData]);

// Update the handleMidwayToDropoff function as well
const handleMidwayToDropoff = useCallback(async () => {
  if (!driverLocation || !rideData.dropoff || !mapInstance.current) return;

  setRideStatus("on_the_way");
  setFollowDriver(true);

  await updateRideStat(rideData._id, "on_the_way");
  updateRideStatus("on_the_way");

  try {
    // 🧹 REMOVE ANY EXISTING CURRENT-TO-DESTINATION ROUTE FIRST
    const map = mapInstance.current;
    if (map.getLayer("current-to-destination-line")) map.removeLayer("current-to-destination-line");
    if (map.getLayer("current-to-destination-stroke")) map.removeLayer("current-to-destination-stroke");
    if (map.getSource("current-to-destination")) map.removeSource("current-to-destination");
    console.log("✅ Previous destination route removed");

    // ✅ Fetch route from CURRENT LOCATION to dropoff
    const directions = await directionsClient
      .getDirections({
        profile: "driving",
        geometries: "geojson",
        steps: true,
        waypoints: [
          { coordinates: driverLocation },
          { coordinates: [rideData.dropoff.lng, rideData.dropoff.lat] },
        ],
      })
      .send();

    const route = directions.body.routes[0];
    
    // ✅ Extract detailed step-by-step instructions
    const stepsData = [];
    route.legs.forEach((leg) =>
      leg.steps.forEach((step) => {
        stepsData.push({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration,
          maneuver: step.maneuver,
          coords: step.geometry.coordinates,
        });
      })
    );

    // 🗺️ ADD THE NEW ROUTE TO THE MAP
    const geojson = {
      type: "Feature",
      geometry: route.geometry,
    };

    mapInstance.current.addSource("current-to-destination", {
      type: "geojson",
      data: geojson,
    });

    mapInstance.current.addLayer(
      {
        id: "current-to-destination-stroke",
        type: "line",
        source: "current-to-destination",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#034880", "line-width": 14 },
      },
      "driver-layer"
    );

    mapInstance.current.addLayer(
      {
        id: "current-to-destination-line",
        type: "line",
        source: "current-to-destination",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#42A5F5", "line-width": 8 },
      },
      "driver-layer"
    );

    setInstructions(stepsData);
    setCurrentStep(0);

  } catch (error) {
    console.error("Failed to fetch route to dropoff:", error);
  }
}, [driverLocation, rideData, mapInstance, user]);
// -----
// Finish ride
const handleFinishRide = async () => {
  setRideStatus("completed");
  
  await updateRideStat(rideData._id, "completed");
  updateRideStatus("completed"); // ✅ Sync context
  console.log("🏁 Ride completed");

  // 🧹 Clear local progress
  localStorage.removeItem(`rideProgress_${rideData._id}`);
};

// Update the cleanup in your useEffect for pickup marker removal
useEffect(() => {
  if (atPickup && mapInstance.current) {
    const map = mapInstance.current;
    
    const timer = setTimeout(() => {
      // Remove pickup marker
      if (map.getLayer("pickup-layer")) map.removeLayer("pickup-layer");
      if (map.getSource("pickup")) map.removeSource("pickup");
      
      // Remove current-to-pickup route layers
      if (map.getLayer("current-to-pickup-line")) map.removeLayer("current-to-pickup-line");
      if (map.getLayer("current-to-pickup-stroke")) map.removeLayer("current-to-pickup-stroke");
      if (map.getLayer("current-to-pickup-dash")) map.removeLayer("current-to-pickup-dash"); // NEW
      if (map.getSource("current-to-pickup")) map.removeSource("current-to-pickup");
      
      console.log("✅ Pickup marker and blue route cleaned up");
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [atPickup]);

// Also add cleanup for destination route when ride is finished
useEffect(() => {
  if (rideFinished && mapInstance.current) {
    const map = mapInstance.current;
    
    // Remove destination route
    if (map.getLayer("current-to-destination-line")) map.removeLayer("current-to-destination-line");
    if (map.getLayer("current-to-destination-stroke")) map.removeLayer("current-to-destination-stroke");
    if (map.getSource("current-to-destination")) map.removeSource("current-to-destination");
    
    console.log("✅ Destination route cleaned up");
  }
}, [rideFinished]);

// 🛠️ FIX: Enhanced fetchDirections function with better current-to-pickup route
const fetchDirections = useCallback(() => {
  if (!mapInstance.current || !rideData) return;

  const waypoints = [
    { coordinates: [rideData.pickup.lng, rideData.pickup.lat] },
    ...(rideData.midwayStops || []).map((s) => ({ coordinates: [s.lng, s.lat] })),
    { coordinates: [rideData.dropoff.lng, rideData.dropoff.lat] },
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

      // 🛠️ FIX: Always show current-to-pickup route when driverLocation is available and not at pickup
      if (driverLocation && rideData?.pickup && !atPickup) {
        console.log("🔄 Fetching current-to-pickup route");
        directionsClient
          .getDirections({
            profile: "driving",
            geometries: "geojson",
            steps: false,
            waypoints: [
              { coordinates: driverLocation },
              { coordinates: [rideData.pickup.lng, rideData.pickup.lat] },
            ],
          })
          .send()
          .then((res) => {
            if (!res.body.routes.length) {
              console.error("No current-to-pickup route found");
              return;
            }

            const pickupRoute = res.body.routes[0];
            const geojson = {
              type: "Feature",
              geometry: pickupRoute.geometry,
            };

            const map = mapInstance.current;
            
            // 🛠️ FIX: Properly add or update the current-to-pickup source
            if (map.getSource("current-to-pickup")) {
              map.getSource("current-to-pickup").setData(geojson);
            } else {
              map.addSource("current-to-pickup", {
                type: "geojson",
                data: geojson,
              });

              // ✅ Add stroke line first (darker blue outline)
              if (!map.getLayer("current-to-pickup-stroke")) {
                map.addLayer(
                  {
                    id: "current-to-pickup-stroke",
                    type: "line",
                    source: "current-to-pickup",
                    layout: {
                      "line-cap": "round",
                      "line-join": "round",
                    },
                    paint: {
                      "line-color": "#1e3a8a", // Darker blue for outline
                      "line-width": 8,
                      "line-opacity": 0.8,
                    },
                  },
                  "driver-layer" // 👈 Insert before driver marker layer
                );
              }

              // ✅ Then add inner bright blue line
              if (!map.getLayer("current-to-pickup-line")) {
                map.addLayer(
                  {
                    id: "current-to-pickup-line",
                    type: "line",
                    source: "current-to-pickup",
                    layout: {
                      "line-cap": "round",
                      "line-join": "round",
                    },
                    paint: {
                      "line-color": "#3b82f6", // Bright blue
                      "line-width": 5,
                      "line-opacity": 0.9,
                    },
                  },
                  "driver-layer" // 👈 Also before the driver marker
                );
              }

              // ✅ Add dashed line effect for better visibility
              if (!map.getLayer("current-to-pickup-dash")) {
                map.addLayer(
                  {
                    id: "current-to-pickup-dash",
                    type: "line",
                    source: "current-to-pickup",
                    layout: {
                      "line-cap": "round",
                      "line-join": "round",
                    },
                    paint: {
                      "line-color": "#ffffff", // White dashes
                      "line-width": 2,
                      "line-dasharray": [1, 2],
                      "line-opacity": 0.7,
                    },
                  },
                  "driver-layer"
                );
              }
            }
            console.log("✅ Current-to-pickup route displayed with blue line");
          })
          .catch((err) => console.error("Failed to fetch current→pickup route:", err));
      }

      // --- Main route line (pickup to dropoff via midway stops) ---
   if (showMainRoute) {   if (mapInstance.current.getSource("route")) {
        mapInstance.current.getSource("route").setData(route.geometry);
      } else {
        mapInstance.current.addSource("route", { type: "geojson", data: route.geometry });

        if (!mapInstance.current.getLayer("route-stroke")) {
          mapInstance.current.addLayer({
            id: "route-stroke",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#034880",
              "line-width": 16,
            },
          });
        }

        if (!mapInstance.current.getLayer("route")) {
          mapInstance.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#42A5F5",
              "line-width": 10,
            },
          });
        }
      }}

      // --- Pickup marker ---
      if (!mapInstance.current.getSource("pickup") && !atPickup) {
        console.log("📍 Adding pickup marker");
        mapInstance.current.addSource("pickup", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [rideData.pickup.lng, rideData.pickup.lat],
                },
                properties: {
                  title: "Pickup",
                  description: rideData.pickup.address || "Pickup location",
                },
              },
            ],
          },
        });

        // Add pickup symbol layer with custom icon
        mapInstance.current.addLayer({
          id: "pickup-layer",
          type: "symbol",
          source: "pickup",
          layout: {
            "icon-image": "pickup-icon",
            "icon-size": 0.3,
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-size": 14,
          },
          paint: {
            "text-color": isDarkMode ? "#ffffff" : "#000000",
            "text-halo-color": isDarkMode ? "#000000" : "#ffffff",
            "text-halo-width": 1,
          },
        });

        // Add pickup popup
        const pickupPopup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">Pickup Location</h3>
              <p class="text-sm">${rideData.pickup.address || "Pickup point"}</p>
            </div>
          `);

        // Hover events for pickup
        mapInstance.current.on('mouseenter', 'pickup-layer', (e) => {
          mapInstance.current.getCanvas().style.cursor = 'pointer';
          pickupPopup.setLngLat(e.lngLat).addTo(mapInstance.current);
        });

        mapInstance.current.on('mouseleave', 'pickup-layer', () => {
          mapInstance.current.getCanvas().style.cursor = '';
          pickupPopup.remove();
        });

        // Click event for pickup
        mapInstance.current.on('click', 'pickup-layer', (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">Pickup Location</h3>
                <p class="text-sm">${rideData.pickup.address || "Pickup point"}</p>
                ${rideData.pickup.instructions ? `<p class="text-xs mt-1"><strong>Instructions:</strong> ${rideData.pickup.instructions}</p>` : ''}
              </div>
            `)
            .addTo(mapInstance.current);
        });

        console.log("✅ Pickup marker added successfully");
      }

      // --- Midway stops ---
      if (rideData.midwayStops?.length && !mapInstance.current.getSource("midway-stops")) {
        mapInstance.current.addSource("midway-stops", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: rideData.midwayStops.map((stop, index) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [stop.lng, stop.lat],
              },
              properties: {
                title: `Stop ${index + 1}`,
                description: stop.address || `Midway stop ${index + 1}`,
                index: index + 1,
              },
            })),
          },
        });

        // Add midway stops symbol layer
        mapInstance.current.addLayer({
          id: "midway-layer",
          type: "symbol",
          source: "midway-stops",
          layout: {
            "icon-image": "midway-icon",
            "icon-size": 0.02,
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-size": 12,
          },
          paint: {
            "text-color": isDarkMode ? "#ffffff" : "#000000",
            "text-halo-color": isDarkMode ? "#000000" : "#ffffff",
            "text-halo-width": 1,
          },
        });

        // Add midway stops popups
        mapInstance.current.on('mouseenter', 'midway-layer', (e) => {
          mapInstance.current.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.current.on('mouseleave', 'midway-layer', () => {
          mapInstance.current.getCanvas().style.cursor = '';
        });

        mapInstance.current.on('click', 'midway-layer', (e) => {
          const feature = e.features[0];
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${feature.properties.title}</h3>
                <p class="text-sm">${feature.properties.description}</p>
              </div>
            `)
            .addTo(mapInstance.current);
        });
      }

      // --- Drop-off marker ---
      if (!mapInstance.current.getSource("dropoff")) {
        mapInstance.current.addSource("dropoff", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [rideData.dropoff.lng, rideData.dropoff.lat],
                },
                properties: {
                  title: "Dropoff",
                  description: rideData.dropoff.address || "Dropoff location",
                },
              },
            ],
          },
        });

        // Add dropoff symbol layer
        mapInstance.current.addLayer({
          id: "dropoff-layer",
          type: "symbol",
          source: "dropoff",
          layout: {
            "icon-image": "dropoff-icon",
            "icon-size": 0.3,
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.8],
            "text-anchor": "top",
            "text-size": 14,
          },
          paint: {
            "text-color": isDarkMode ? "#ffffff" : "#000000",
            "text-halo-color": isDarkMode ? "#000000" : "#ffffff",
            "text-halo-width": 1,
          },
        });

        // Add dropoff popup
        mapInstance.current.on('mouseenter', 'dropoff-layer', (e) => {
          mapInstance.current.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.current.on('mouseleave', 'dropoff-layer', () => {
          mapInstance.current.getCanvas().style.cursor = '';
        });

        mapInstance.current.on('click', 'dropoff-layer', (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">Dropoff Location</h3>
                <p class="text-sm">${rideData.dropoff.address || "Dropoff point"}</p>
              </div>
            `)
            .addTo(mapInstance.current);
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
            maneuver: step.maneuver,
            coords: step.geometry.coordinates, // Add coordinates for each step
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
      
      if (path.length > 0 && !hasFittedBounds.current) {
        const bounds = new mapboxgl.LngLatBounds();
        path.forEach((c) => bounds.extend(c));
        // Also include driver location if available
        if (driverLocation) bounds.extend(driverLocation);
        mapInstance.current.fitBounds(bounds, { padding: 80, duration: 1500 });
        hasFittedBounds.current = true;
      }
    })
    .catch((err) => {
      console.error("Directions API error", err);
    });
}, [rideData, isDarkMode, driverLocation, atPickup]);

const removeMainRoute = () => {
  const map = mapInstance.current;
  if (!map) return;

  if (map.getLayer("route")) map.removeLayer("route");
  if (map.getLayer("route-stroke")) map.removeLayer("route-stroke");
  if (map.getSource("route")) map.removeSource("route");

  console.log("🧹 Main pickup→dropoff route removed");
};

// 🛠️ FIX: Enhanced useEffect to handle initial route display and updates
useEffect(() => {
  if (mapLoaded && rideData && driverLocation && !atPickup) {
    console.log("🗺️ Initial map setup - showing current-to-pickup route");
    
    // Small delay to ensure map is fully ready
    const timer = setTimeout(() => {
      // First, fetch the main directions to setup markers
      fetchDirections();
      
      // Then immediately update the current-to-pickup route with the latest driver location
      setTimeout(() => {
        updateCurrentToPickupRoute();
      }, 300);
    }, 500);

    return () => clearTimeout(timer);
  }
}, [mapLoaded, rideData, driverLocation, atPickup, fetchDirections, updateCurrentToPickupRoute]);


// Init map (Phase 1: Map Instance Creation) - FIXED: Check if rideData exists
useEffect(() => {
  if (!mapRef.current || mapInstance.current) return;
  if (!rideData?.pickup) return; // need rideData to set center

  const mapStyle = isDarkMode
    ? "mapbox://styles/mapbox/navigation-night-v1"
    : "mapbox://styles/mapbox/navigation-day-v1";

  mapInstance.current = new mapboxgl.Map({
    container: mapRef.current,
    style: mapStyle,
    center: [rideData.pickup.lng, rideData.pickup.lat],
    zoom: currentZoom,
    pitch: 0,
    bearing: 0,
  });

  mapInstance.current.addControl(new mapboxgl.NavigationControl(), "top-right");

  mapInstance.current.on("load", () => {
    setMapLoaded(true);
    
    // Load ALL icons before setting up markers
    const loadAllIcons = async () => {
      try {
        // Load driver arrow
        await new Promise((resolve, reject) => {
          mapInstance.current.loadImage(
            "https://i.ibb.co/Psm5vrxs/Gemini-Generated-Image-aaev1maaev1maaev-removebg-preview.png",
            (error, image) => {
              if (error) reject(error);
              if (!mapInstance.current.hasImage("arrow-icon")) {
                mapInstance.current.addImage("arrow-icon", image);
              }
              resolve();
            }
          );
        });

        // Load pickup icon
        await new Promise((resolve, reject) => {
          mapInstance.current.loadImage(
            "https://i.ibb.co/MxJckn1b/location-icon-png-4240.png", // Using same as dropoff for now
            (error, image) => {
              if (error) reject(error);
              if (!mapInstance.current.hasImage("pickup-icon")) {
                mapInstance.current.addImage("pickup-icon", image);
              }
              resolve();
            }
          );
        });

        // Load midway stop icon
        await new Promise((resolve, reject) => {
          mapInstance.current.loadImage(
            "https://i.ibb.co/N6c33bGK/349750.png",
            (error, image) => {
              if (error) reject(error);
              if (!mapInstance.current.hasImage("midway-icon")) {
                mapInstance.current.addImage("midway-icon", image);
              }
              resolve();
            }
          );
        });

        // Load drop-off icon
        await new Promise((resolve, reject) => {
          mapInstance.current.loadImage(
            "https://i.ibb.co/MxJckn1b/location-icon-png-4240.png",
            (error, image) => {
              if (error) reject(error);
              if (!mapInstance.current.hasImage("dropoff-icon")) {
                mapInstance.current.addImage("dropoff-icon", image);
              }
              resolve();
            }
          );
        });

        console.log("✅ All icons loaded successfully");
        
        // Now fetch directions to setup markers
        fetchDirections();
        
      } catch (error) {
        console.error("❌ Failed to load icons:", error);
      }
    };

    loadAllIcons();

    mapInstance.current.on("wheel", () => setFollowDriver(false));
    mapInstance.current.on("mousedown", () => setFollowDriver(false));
    mapInstance.current.on("touchstart", () => setFollowDriver(false));
    mapInstance.current.on("dragstart", () => setFollowDriver(false));
    mapInstance.current.on("zoomstart", () => setFollowDriver(false));
  });

  return () => {
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
  };
}, [rideData?.pickup, isDarkMode]);

  // Phase 2: Add static elements and fetch route
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !rideData) return;
    fetchDirections();

    // --- Setup map event handlers
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
      e?.features[0].popupInstance?.remove();
    });

    // Cleanup function for event listeners
    return () => {
      if (currentMap) {
        try {
          if (currentMap.listens && currentMap.listens('mouseenter', 'midway-layer')) currentMap.off('mouseenter', 'midway-layer');
          if (currentMap.listens && currentMap.listens('mouseleave', 'midway-layer')) currentMap.off('mouseleave', 'midway-layer');
          if (currentMap.listens && currentMap.listens('mouseenter', 'dropoff-layer')) currentMap.off('mouseenter', 'dropoff-layer');
          if (currentMap.listens && currentMap.listens('mouseleave', 'dropoff-layer')) currentMap.off('mouseleave', 'dropoff-layer');
        } catch (e) {
          // some older map versions might not support listens()
        }
      }
    };
  }, [mapLoaded, fetchDirections, rideData]);

// 🛰️ LIVE GPS TRACKING (auto arrow movement + camera follow + route updates)
useEffect(() => {
  if (!mapInstance.current || !mapLoaded) return;

  const map = mapInstance.current;

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, heading, speed, accuracy } = pos.coords;
      const newCoords = [longitude, latitude];
      setDriverLocation(newCoords);

      if (accuracy > 50) console.warn("GPS accuracy low:", Math.round(accuracy));

      // --- driver marker ---
      const driverSource = map.getSource("driver");
      if (driverSource) {
        driverSource.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: newCoords },
              properties: { bearing: heading || 0 },
            },
          ],
        });
      } else {
        map.addSource("driver", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: newCoords },
                properties: { bearing: heading || 0 },
              },
            ],
          },
        });

        map.addLayer({
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

      // --- Update current-to-pickup route with new location ---
      if (rideStatus === "in_progress" && !atPickup) {
        updateCurrentToPickupRoute();
      }

      // --- Smooth camera follow ---
      if (followDriver) {
        map.easeTo({
          center: newCoords,
          bearing: heading || 0,
          pitch: 65,
          zoom: map.getZoom(),
          duration: 1000,
          easing: (t) => t * (2 - t),
        });
      }

      // --- Emit to backend ---
      socketRef.current?.emit("driver-location-update", {
        driverId: user._id,
        rideId: rideData?._id,
        customerId: rideData?.customerId,
        location: { lat: latitude, lng: longitude, speed, heading: heading || 0 },
      });
    },
    handleGeoError,
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, [mapInstance.current, mapLoaded, rideData, user?._id, followDriver, rideStatus, atPickup, updateCurrentToPickupRoute]);

  // Distance calculation function
  const getDistance = (loc1, loc2) => {
    const R = 6371e3;
    const [lon1, lat1] = loc1.map((v) => (v * Math.PI) / 180);
    const [lon2, lat2] = loc2.map((v) => (v * Math.PI) / 180);
    const a = Math.sin((lat2 - lat1) / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin((lon2 - lon1) / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // handle chat
  const handleChatWithCustomer = () => {
    if (customer && rideData) {
      navigate(`/dashboard/chat?user=${customer._id}&rideId=${rideData._id}&rideStatus=${rideData.status}`);
    }
  };

  useEffect(() => {
    return () => {
      journeyActiveRef.current = false;
    };
  }, []);

useEffect(() => {
  if (!mapInstance.current) return;
  const map = mapInstance.current;
  const syncZoom = () => setCurrentZoom(map.getZoom());
  map.on("zoomend", syncZoom);
  return () => map.off("zoomend", syncZoom);
}, [mapLoaded]);

// === CAMERA CONTROL FUNCTIONS ===
const centerOnDriver = useCallback(() => {
  if (!mapInstance.current || !driverLocation) return;

  // 🔹 Re-enable camera follow mode
  setFollowDriver(true);
console.log("Centering on driver:", driverLocation, "Zoom:", currentZoom);

  // 🔹 Smoothly re-center on driver’s current location (without resetting zoom)
  mapInstance.current.easeTo({
    center: driverLocation,
    zoom: currentZoom,  // use our controlled zoom state
    duration: 800,
  });
}, [driverLocation, currentZoom]);

const zoomIn = useCallback(() => {
  if (!mapInstance.current) return;
  const newZoom = Math.min(currentZoom + 1, 22);
  setCurrentZoom(newZoom);
  mapInstance.current.easeTo({ zoom: newZoom, duration: 400 });
}, [currentZoom]);

const zoomOut = useCallback(() => {
  if (!mapInstance.current) return;
  const newZoom = Math.max(currentZoom - 1, 0);
  setCurrentZoom(newZoom);
  mapInstance.current.easeTo({ zoom: newZoom, duration: 400 });
}, [currentZoom]);


  // Before the return statement, derive currentInstruction
  const currentInstruction = instructions[currentStep] || null;

  // Add this useEffect for cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any ongoing animation when component unmounts
      setJourneyStarted(false);
      journeyActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current && user?._id) {
        socketRef.current.emit("driver-location-stop", { driverId: user._id });
      }
    };
  }, [user?._id]);

  // 🧭 Persist ride progress
useEffect(() => {
  const progress = {
    rideStatus,
    atPickup,
    dropoffStarted,
    atDropoff,
    rideFinished,
    journeyStarted,
  };
  if (rideData?._id) {
    localStorage.setItem(`rideProgress_${rideData._id}`, JSON.stringify(progress));
  }
}, [rideStatus, atPickup, dropoffStarted, atDropoff, rideFinished, journeyStarted, rideData?._id]);

// 🐛 DEBUG: Add this function to check what routes are currently displayed
const debugRoutes = () => {
  if (!mapInstance.current) return;
  const map = mapInstance.current;
  
  console.log("=== ROUTE DEBUG INFO ===");
  console.log("Current-to-pickup source:", map.getSource("current-to-pickup") ? "EXISTS" : "MISSING");
  console.log("Current-to-destination source:", map.getSource("current-to-destination") ? "EXISTS" : "MISSING");
  console.log("Route source:", map.getSource("route") ? "EXISTS" : "MISSING");
  console.log("Driver location:", driverLocation);
  console.log("At pickup:", atPickup);
  console.log("Ride status:", rideStatus);
  console.log("========================");
};
// Debug: Log current state to see what's happening
useEffect(() => {
  console.log("🔍 CURRENT STATE:", {
    rideStatus,
    atPickup,
    dropoffStarted,
    journeyStarted,
    hasMidwayStops: rideData?.midwayStops?.length > 0,
    rideDataStatus: rideData?.status
  });
}, [rideStatus, atPickup, dropoffStarted, journeyStarted, rideData]);
  // ---------- RENDER ----------
  // Show a friendly loading/placeholder state if rideData is not available yet
  if (!rideData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Loading ride...</p>
          <p className="text-sm opacity-70">Resolving ride data — opening map shortly.</p>
        </div>
      </div>
    );
  }

  // Main UI (same as before, using rideData)
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* TOP NAVIGATION HEADER (MATCHING DESIGN) */}
      <LocationModal />

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
                <p className="text-4xl font-semibold mb-2 leading-none">
                  {(remaining.distance / 1609.34).toFixed(1)} mi
                </p>
                <p className="text-sm font-normal">
                  {currentInstruction.instruction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE SETTINGS/WIDGETS */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-20">
        <button className={`p-3 text-2xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}>
          ⚙️
        </button>

        <button
          onClick={() => {
            setIsDarkMode(!isDarkMode);
          }}
          className={`p-3 text-2xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

     {/* CAMERA CONTROLS - Bottom Right */}
<div className="absolute bottom-32 right-4 flex flex-col space-y-2 z-20">
  <button
    onClick={centerOnDriver}
    className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
    title="Center on driver"
  >
    <FaCrosshairs />
  </button>

  <button
    onClick={zoomIn}
    className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
    title="Zoom in"
  >
    <FaPlus />
  </button>

  <button
    onClick={zoomOut}
    className={`p-3 text-xl rounded-xl shadow-lg ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
    title="Zoom out"
  >
    <FaMinus />
  </button>
</div>


   {/* TEMPORARY RESET BUTTON - Remove after testing */}
<button 
  onClick={() => {
    setRideStatus("accepted");
    setAtPickup(false);
    setJourneyStarted(false);
    setDropoffStarted(false);
    setAtDropoff(false);
    setRideFinished(false);
    localStorage.removeItem(`rideProgress_${rideData._id}`);
    console.log("🔄 State reset to beginning");
  }}
  className="bg-red-500 text-white p-2 rounded absolute top-32 left-4 z-50"
>
  Reset State
</button>


      {/* SPEED LIMIT - Bottom Left */}
      <div className={`absolute bottom-32 left-4 text-center p-3 rounded-xl shadow-lg border-4 ${isDarkMode ? "border-white bg-white text-black" : "border-white bg-white text-black"}`}>
        <p className="text-2xl font-extrabold leading-none">
          {journeyStarted ? Math.round((remaining.distance / 1609.34) * 2.23694) : 0}
        </p>
        <p className="text-xs">mph</p>
      </div>

      {/* BOTTOM NAVIGATION BAR (MATCHING DESIGN) */}
      <div className={`absolute flex gap-24 flex-row-reverse bottom-0 w-full shadow-2xl z-10 md:px-10 px-3`}>

        <div className={`flex items-center w-full p-5 rounded-xl justify-between h-full ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
          <button className={`p-2 rounded-full text-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>⋮</button>

          <div className="flex-1 flex justify-center items-center">
            {journeyStarted ? (
              <div className="text-center">
                <p className="font-semibold text-sm">{(remaining.duration / 60).toFixed(0)} min</p>
                <p className="opacity-70 text-xs">ETA: {new Date(Date.now() + remaining.duration * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-bold text-lg">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                <p className="opacity-70 text-xs">{rideData.distance ? `${rideData.distance} • ${rideData.eta} min` : `${(remaining.distance / 1609.34).toFixed(1)} mi • ${rideData.eta}`}</p>
              </div>
            )}
          </div>

{/* === RIDE ACTION BUTTONS === */}

{/* Step 1: Start to Pickup - ONLY show if ride is accepted and journey hasn't started */}
{rideStatus === "accepted" && !journeyStarted && (
  <button
    onClick={() => {
  removeMainRoute();
setShowMainRoute(false);
  handleStartToPickup();
}}

    className="bg-blue-600 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
  >
    Start to Pickup
  </button>
)}

{/* Step 2: I'm at Pickup - ONLY show if in progress but not at pickup */}
{rideStatus === "in_progress" && !atPickup && (
  <button
    onClick={() => {
  setAtPickup(true);
  removeMainRoute();
setShowMainRoute(false);
  showRouteToNextDestination();
      
      // 🧹 Remove pickup marker and connecting line
      const map = mapInstance.current;
      if (map) {
        if (map.getLayer("pickup-layer")) map.removeLayer("pickup-layer");
        if (map.getSource("pickup")) map.removeSource("pickup");
        if (map.getLayer("current-to-pickup-line")) map.removeLayer("current-to-pickup-line");
        if (map.getLayer("current-to-pickup-stroke")) map.removeLayer("current-to-pickup-stroke");
        if (map.getSource("current-to-pickup")) map.removeSource("current-to-pickup");
        console.log("✅ Pickup marker and route removed");
      }
    }}
    className="bg-yellow-500 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-yellow-600 transition"
  >
    I'm at Pickup
  </button>
)}

{/* Step 3: After pickup — either Midway or Dropoff */}
{rideStatus === "in_progress" && atPickup && !dropoffStarted && (
  <>
    {rideData?.midwayStops?.length > 0 ? (
      <button
        onClick={() => {
          handlePickupToMidway();
          setDropoffStarted(false);
        }}
        className="bg-green-600 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-green-700 transition"
      >
        Go to Midway
      </button>
    ) : (
      <button
        onClick={() => {
          setDropoffStarted(true);
          handlePickupToDropoff();
  removeMainRoute();
setShowMainRoute(false);
  showRouteToNextDestination();
        }}
        className="bg-blue-700 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
      >
        Start Ride to Dropoff
      </button>
    )}
  </>
)}

{/* Step 4: Midway stop → confirm arrival */}
{rideStatus === "at_stop" && (
  <button
    onClick={() => {
      handleMidwayToDropoff();
      setDropoffStarted(true);
  removeMainRoute();
setShowMainRoute(false);
  showRouteToNextDestination();
    }}
    className="bg-blue-700 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
  >
    Go to Dropoff
  </button>
)}

{/* Step 5: I'm at Dropoff */}
{rideStatus === "on_the_way" && dropoffStarted && !atDropoff && (
  <button
    onClick={() => setAtDropoff(true)}
    className="bg-orange-500 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-orange-600 transition"
  >
    I'm at Dropoff
  </button>
)}

{/* Step 6: Finish Ride */}
{rideStatus === "on_the_way" && atDropoff && !rideFinished && (
  <button
    onClick={() => {
      handleFinishRide();
      setRideFinished(true);
    }}
    className="bg-purple-700 text-white md:px-6 md:py-3 px-3 text-[12px] md:text-xl py-2 rounded-xl font-semibold hover:bg-purple-800 transition"
  >
    Finish Ride
  </button>
)}

{/* Step 7: Done */}
{rideStatus === "completed" && rideFinished && (
  <p className="md:text-lg text-[12px] font-semibold text-green-600">
    ✅ Ride Completed Successfully
  </p>
)}

          <button onClick={handleChatWithCustomer} className={`p-2 rounded-full text-2xl ${isDarkMode ? "text-white" : "text-gray-900"}`} title="Chat with customer">
            <FaComments />
          </button>
        </div>
      </div>
    </div>
  );
}