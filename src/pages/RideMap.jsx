import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import mbxDirections from "@mapbox/mapbox-sdk/services/directions";
import * as turf from "@turf/turf";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const directionsClient = mbxDirections({ accessToken: mapboxgl.accessToken });

// Mock customer fetch
const fetchCustomerData = async (customerId) => {
  await new Promise((r) => setTimeout(r, 300));
  return { id: customerId, name: "Rider Name", rating: 4.8, contact: "123-456-7890" };
};

export default function RideMap() {
  const { state: ride } = useLocation();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [routePath, setRoutePath] = useState([]);
  const [journeyStarted, setJourneyStarted] = useState(false);

  const [instructions, setInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [remaining, setRemaining] = useState({ distance: 0, duration: 0 });
  const [stepSegments, setStepSegments] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(new Date().getHours() >= 18 || new Date().getHours() < 6);

  const intervalRef = useRef(null);

  const computeSmoothHeading = useCallback((path, index, lookAhead = 5) => {
    if (!path.length) return 0;
    const start = path[index];
    const end = path[Math.min(index + lookAhead, path.length - 1)];
    return turf.bearing(turf.point(start), turf.point(end));
  }, []);

  useEffect(() => {
    if (ride?.customerId) {
      fetchCustomerData(ride.customerId)
        .then(setCustomer)
        .catch(() => setCustomer({ name: ride.riderName || "Customer" }));
    }
  }, [ride]);

  // Init map
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
      // Load custom arrow image
  mapInstance.current.loadImage("https://i.ibb.co/Psm5vrxs/Gemini-Generated-Image-aaev1maaev1maaev-removebg-preview.png", (error, image) => {
    if (error) throw error;
    if (!mapInstance.current.hasImage("arrow-icon")) {
      mapInstance.current.addImage("arrow-icon", image);
    }
  });

  fetchDirections();
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [ride, isDarkMode]);

  // Fetch route
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

        if (mapInstance.current.getSource("route")) {
          mapInstance.current.getSource("route").setData(route.geometry);
        } else {
          mapInstance.current.addSource("route", { type: "geojson", data: route.geometry });
          mapInstance.current.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#42A5F5", "line-width": 12 },
          });
        }

        // --- DRIVER MARKER PART (from first code) ---
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
              "icon-image": "arrow-icon", // Mapbox default car icon
              "icon-size": 0.2,
              "icon-rotate": ["get", "bearing"],
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
            },
          });
        }
        // ------------------------------------------

        const stepsData = [];
        const segments = [];
        let idx = 0;

        route.legs.forEach((leg) =>
          leg.steps.forEach((step) => {
            stepsData.push({
              instruction: step.maneuver.instruction,
              distance: step.distance,
              duration: step.duration,
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
  }, [ride]);

// Start navigation
const handleStartJourney = () => {
  if (!routePath.length || journeyStarted) return;
  setJourneyStarted(true);

  const line = turf.lineString(routePath);
  const routeLength = turf.length(line, { units: "kilometers" });

  let traveled = 0; // km
  const speed = 0.02; // km per frame (≈ 180 km/h, adjust down for slower driving)

  const animate = () => {
    if (traveled >= routeLength) {
      setCurrentStep(instructions.length);
      setJourneyStarted(false);
      return;
    }

    // Get current point along route
    const currentPoint = turf.along(line, traveled, { units: "kilometers" });
    const nextPoint = turf.along(line, traveled + 0.01, { units: "kilometers" });

    const coords = currentPoint.geometry.coordinates;
    const heading = turf.bearing(
      turf.point(coords),
      turf.point(nextPoint.geometry.coordinates)
    );

    // Update driver icon position
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

    // Move camera smoothly with driver
    mapInstance.current.easeTo({
      center: coords,
      zoom: 17,
      pitch: 65,
      bearing: heading,
      duration: 100,
      easing: (t) => t, // linear easing
    });

    // Progress forward
    traveled += speed;

    requestAnimationFrame(animate);
  };

  animate();
};


  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (!ride) return <p>No ride data</p>;

  const currentInstruction = instructions[currentStep];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* TOP NAVIGATION HEADER */}
      {journeyStarted && currentInstruction && (
        <div
          className={`absolute top-0 left-0 right-0 p-4 shadow-2xl z-10 ${
            isDarkMode ? "bg-gray-900 text-white" : "bg-blue-600 text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-5xl mr-3 font-bold">↩️</span>
              <div>
                <p className="text-4xl font-extrabold">
                  {(remaining.distance / 1609.34).toFixed(1)} mi
                </p>
                <p className="text-xl">{currentInstruction.instruction}</p>
              </div>
            </div>
            <div
              className={`text-center p-2 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-white text-black"
              }`}
            >
              <p className="text-sm">45</p>
              <p className="text-xs">MPH</p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CARD */}
      <div
        className={`absolute bottom-0 w-full p-3 shadow-2xl z-10 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex justify-between items-center text-sm">
          <div className="font-medium">
            <p>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="opacity-70">
              {(remaining.distance / 1609.34).toFixed(1)} mi • {`${(remaining.duration / 60).toFixed(0)} min`}
            </p>
          </div>

          {!journeyStarted ? (
            <div className="text-right">
              <p className="font-bold">{customer?.name || "Customer"}</p>
              <p className="opacity-70 text-xs">Pickup → Dropoff</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="font-bold text-lg">Van Ness Ave</p>
            </div>
          )}
        </div>

        {!journeyStarted && routePath.length > 0 && (
          <button
            onClick={handleStartJourney}
            className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700"
          >
            🚀 Start Navigation
          </button>
        )}
      </div>

      {/* Dark/Light Mode */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-4 right-4 p-2 rounded-full shadow-lg z-20 ${
          isDarkMode ? "bg-white text-gray-900" : "bg-gray-900 text-white"
        }`}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
