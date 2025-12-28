/// <reference path="../types/google-maps.d.ts" />
import React, { useEffect, useRef, useState } from "react";
import "../styles/AddressAutocomplete.css";

// Define PlaceResult type locally to avoid namespace issues
interface GooglePlaceResult {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat(): number;
      lng(): number;
    };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  name?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, placeDetails?: GooglePlaceResult) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Masukkan alamat lengkap...",
  className = "",
  required = false,
  error,
  onLocationChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null); // Using any for Google Maps Autocomplete to avoid type issues
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Google Maps API script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      console.warn("Google Maps API key not found. Address autocomplete will be disabled.");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=id&region=ID`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "id" }, // Restrict to Indonesia
      fields: ["formatted_address", "geometry", "address_components", "name"],
      types: ["address"],
    });

    autocompleteRef.current = autocomplete;

    // Handle place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setIsLoading(true);
        onChange(place.formatted_address, place as GooglePlaceResult);

        // Extract coordinates if available
        if (place.geometry?.location && onLocationChange) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onLocationChange(lat, lng);
        }

        setIsLoading(false);
      }
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isScriptLoaded, onChange, onLocationChange]);

  return (
    <div className={`addressAutocomplete ${className}`}>
      <div className="addressAutocomplete__wrapper">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`addressAutocomplete__input ${error ? "addressAutocomplete__input--error" : ""}`}
          disabled={!isScriptLoaded}
          autoComplete="off"
        />
        {isLoading && (
          <div className="addressAutocomplete__spinner" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" fill="none" opacity="0.2">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
        )}
        {isScriptLoaded && (
          <div className="addressAutocomplete__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
        )}
      </div>
      {error && (
        <div className="addressAutocomplete__error" role="alert">
          {error}
        </div>
      )}
      {!isScriptLoaded && (
        <div className="addressAutocomplete__hint">
          💡 Autocomplete tidak tersedia. Masukkan alamat secara manual.
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;

