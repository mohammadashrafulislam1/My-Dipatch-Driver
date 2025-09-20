import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function RideMap() {
  const { state: ride } = useLocation();
  const [directions, setDirections] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [driverPosition, setDriverPosition] = useState(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [journeyStarted, setJourneyStarted] = useState(false);

  const [instructions, setInstructions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [nextInstruction, setNextInstruction] = useState(null);
  const [remaining, setRemaining] = useState({ distance: 0, duration: 0 });
  const [stepSegments, setStepSegments] = useState([]);

  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  // Smooth interpolation between two points
  const interpolatePosition = (start, end, fraction) => {
    const lat = start.lat() + (end.lat() - start.lat()) * fraction;
    const lng = start.lng() + (end.lng() - start.lng()) * fraction;
    return new window.google.maps.LatLng(lat, lng);
  };

  // Compute smooth heading using a few points ahead
  const computeSmoothHeading = (path, index, lookAhead = 5) => {
    if (!window.google?.maps) return 0;
    const start = path[index];
    const end = path[Math.min(index + lookAhead, path.length - 1)];
    return window.google.maps.geometry.spherical.computeHeading(start, end);
  };

  const handleLoad = (map) => {
    mapRef.current = map;
    if (!ride || !window.google?.maps) return;

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints =
      ride.midwayStops?.map((stop) => ({ location: stop.address, stopover: true })) || [];

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

          const path = [];
          const stepsData = [];
          const segments = [];
          let index = 0;

          result.routes[0].legs.forEach((leg) => {
            leg.steps.forEach((step) => {
              stepsData.push({
                instruction: step.instructions,
                distance: step.distance,
                duration: step.duration,
                start: step.start_location,
                end: step.end_location,
              });

              const count = step.path.length;
              segments.push({ step, startIndex: index, endIndex: index + count - 1 });
              step.path.forEach((p) => path.push(p));
              index += count;
            });
          });

          // Add interpolated points for smoother movement
          const smoothPath = [];
          for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            smoothPath.push(start);
            for (let j = 1; j <= 5; j++) {
              smoothPath.push(interpolatePosition(start, end, j / 6));
            }
          }

          setRoutePath(smoothPath);
          setInstructions(stepsData);
          setStepSegments(segments);

          if (smoothPath.length > 0) {
            setDriverPosition(smoothPath[0]);
            map.panTo(smoothPath[0]);
            map.setZoom(18);
            map.setTilt(65);
          }
        } else {
          console.error("❌ Directions request failed:", status);
        }
      }
    );
  };

  const handleStartJourney = () => {
    if (!routePath.length || !window.google?.maps) return;
    setJourneyStarted(true);

    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index >= routePath.length - 1) {
        clearInterval(intervalRef.current);
        setCurrentStep(instructions.length);
        return;
      }

      const nextIndex = index + 1;
      const newPos = routePath[nextIndex];
      setDriverPosition(newPos);

      // Smooth heading
      const heading = computeSmoothHeading(routePath, index, 5);
      setDriverHeading(heading);

      // Update camera
      if (mapRef.current) {
        mapRef.current.moveCamera?.({
          center: newPos,
          tilt: 65,
          heading: heading,
          zoom: 18,
        }) || (mapRef.current.panTo(newPos), mapRef.current.setTilt(65), mapRef.current.setHeading(heading));
      }

      // Update current step
      const segment = stepSegments.find(seg => nextIndex >= seg.startIndex && nextIndex <= seg.endIndex);
      if (segment) {
        const stepIndex = stepSegments.indexOf(segment);
        if (stepIndex !== currentStep) setCurrentStep(stepIndex);

        const distToEnd = window.google.maps.geometry.spherical.computeDistanceBetween(
          newPos,
          instructions[stepIndex].end
        );
        if (distToEnd < 150 && stepIndex + 1 < instructions.length) setNextInstruction(instructions[stepIndex + 1]);
        else setNextInstruction(null);

        const remainingSteps = instructions.slice(stepIndex);
        const totalDistance = remainingSteps.reduce((sum, s) => sum + s.distance.value, 0);
        const totalDuration = remainingSteps.reduce((sum, s) => sum + s.duration.value, 0);
        setRemaining({ distance: totalDistance, duration: totalDuration });
      }

      index++;
    }, 50); // faster updates for smoother motion
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  if (!ride) return <p>No ride data</p>;

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={["geometry", "places"]}
    >
      <div className="relative w-full h-screen">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={driverPosition || { lat: 37.7749, lng: -122.4194 }}
          zoom={18}
          onLoad={handleLoad}
          options={{ disableDefaultUI: true, tilt: 65 }}
        >
          {directions && <DirectionsRenderer directions={directions} />}

          {journeyStarted && driverPosition && (
            <Marker
              position={driverPosition}
              icon={{
                url: "https://cdn-icons-png.flaticon.com/512/3774/3774270.png",
                scaledSize: new window.google.maps.Size(50, 50),
                anchor: new window.google.maps.Point(25, 25),
              }}
            />
          )}
        </GoogleMap>

        {!journeyStarted && routePath.length > 0 && (
          <button
            onClick={handleStartJourney}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition"
          >
            🚀 Start Journey
          </button>
        )}

        {journeyStarted && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 flex flex-col justify-center items-center bg-black shadow-lg p-6 text-center rounded-2xl">
            {currentStep < instructions.length ? (
              <>
                <p
                  className="text-2xl text-white font-bold"
                  dangerouslySetInnerHTML={{ __html: instructions[currentStep].instruction }}
                />
                <p className="text-gray-300">
                  {instructions[currentStep].distance.text} • {instructions[currentStep].duration.text}
                </p>
                {nextInstruction && (
                  <p
                    className="text-md text-blue-300 mt-2"
                    dangerouslySetInnerHTML={{ __html: `➡️ Upcoming: ${nextInstruction.instruction}` }}
                  />
                )}
              </>
            ) : (
              <p className="text-lg font-bold">🎉 You have arrived!</p>
            )}

            {remaining.distance > 0 && (
              <p className="mt-2 text-gray-400">
                {(remaining.distance / 1000).toFixed(1)} km • {(remaining.duration / 60).toFixed(0)} min left
              </p>
            )}
          </div>
        )}
      </div>
    </LoadScript>
  );
}
