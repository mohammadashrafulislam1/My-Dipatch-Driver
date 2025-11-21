import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef } from "react";

const GoogleAddressInput = ({ value, onSelect }) => {
  const inputRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address"],
      componentRestrictions: { country: "ca" }, // optional
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.formatted_address) return;

      onSelect(place.formatted_address); // ONLY address
    });
  }, [isLoaded]);

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      placeholder="Enter your city or address"
      className="mt-1 w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default GoogleAddressInput;
