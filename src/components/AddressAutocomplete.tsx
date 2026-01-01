/**
 * Address Autocomplete Component (OOP)
 * Class-based component following SOLID principles
 */

/// <reference path="../types/google-maps.d.ts" />
import React, { Component, RefObject } from "react";
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

interface AddressAutocompleteState {
  isLoading: boolean;
  isScriptLoaded: boolean;
}

/**
 * Address Autocomplete Component
 * Class-based component for Google Maps address autocomplete
 */
class AddressAutocomplete extends Component<AddressAutocompleteProps, AddressAutocompleteState> {
  private baseClass: string = "addressAutocomplete";
  private inputRef: RefObject<HTMLInputElement>;
  private autocompleteRef: any; // Using any for Google Maps Autocomplete to avoid type issues

  constructor(props: AddressAutocompleteProps) {
    super(props);
    this.state = {
      isLoading: false,
      isScriptLoaded: false,
    };
    this.inputRef = React.createRef();
    this.autocompleteRef = null;
  }

  componentDidMount(): void {
    this.loadGoogleMapsScript();
  }

  componentDidUpdate(prevProps: AddressAutocompleteProps): void {
    if (prevProps.value !== this.props.value && this.state.isScriptLoaded) {
      this.initializeAutocomplete();
    }
  }

  componentWillUnmount(): void {
    this.cleanupAutocomplete();
    this.cleanupScript();
  }

  private loadGoogleMapsScript(): void {
    if (window.google?.maps?.places) {
      this.setState({ isScriptLoaded: true });
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
      this.setState({ isScriptLoaded: true });
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
    };

    document.head.appendChild(script);
  }

  private initializeAutocomplete(): void {
    if (!this.state.isScriptLoaded || !this.inputRef.current || !window.google?.maps?.places) {
      return;
    }

    // Cleanup existing autocomplete
    this.cleanupAutocomplete();

    const autocomplete = new window.google.maps.places.Autocomplete(this.inputRef.current, {
      componentRestrictions: { country: "id" }, // Restrict to Indonesia
      fields: ["formatted_address", "geometry", "address_components", "name"],
      types: ["address"],
    });

    this.autocompleteRef = autocomplete;

    // Handle place selection
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        this.setState({ isLoading: true });
        this.props.onChange(place.formatted_address, place as GooglePlaceResult);

        // Extract coordinates if available
        if (place.geometry?.location && this.props.onLocationChange) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          this.props.onLocationChange(lat, lng);
        }

        this.setState({ isLoading: false });
      }
    });
  }

  private cleanupAutocomplete(): void {
    if (this.autocompleteRef && window.google?.maps?.event) {
      window.google.maps.event.clearInstanceListeners(this.autocompleteRef);
      this.autocompleteRef = null;
    }
  }

  private cleanupScript(): void {
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private getInputClasses(): string {
    const { error } = this.props;
    const errorClass = error ? `${this.baseClass}__input--error` : "";
    return `${this.baseClass}__input ${errorClass}`.trim();
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onChange(e.target.value);
  };

  private renderSpinner(): React.ReactNode {
    const { isLoading } = this.state;
    if (!isLoading) return null;

    return (
      <div className={`${this.baseClass}__spinner`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="31.416"
            strokeDashoffset="31.416"
            fill="none"
            opacity="0.2"
          >
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    );
  }

  private renderIcon(): React.ReactNode {
    const { isScriptLoaded } = this.state;
    if (!isScriptLoaded) return null;

    return (
      <div className={`${this.baseClass}__icon`} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </div>
    );
  }

  render(): React.ReactNode {
    const { value, placeholder = "Masukkan alamat lengkap...", required = false, error } = this.props;
    const { isScriptLoaded } = this.state;

    // Initialize autocomplete when script is loaded
    if (isScriptLoaded && this.inputRef.current && !this.autocompleteRef) {
      this.initializeAutocomplete();
    }

    return (
      <div className={this.getClasses()}>
        <div className={`${this.baseClass}__wrapper`}>
          <input
            ref={this.inputRef}
            type="text"
            value={value}
            onChange={this.handleInputChange}
            placeholder={placeholder}
            required={required}
            className={this.getInputClasses()}
            disabled={!isScriptLoaded}
            autoComplete="off"
          />
          {this.renderSpinner()}
          {this.renderIcon()}
        </div>
        {error && (
          <div className={`${this.baseClass}__error`} role="alert">
            {error}
          </div>
        )}
        {!isScriptLoaded && (
          <div className={`${this.baseClass}__hint`}>
            💡 Autocomplete tidak tersedia. Masukkan alamat secara manual.
          </div>
        )}
      </div>
    );
  }
}

export default AddressAutocomplete;
