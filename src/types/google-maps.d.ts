// Type definitions for Google Maps API
// These types are used when Google Maps API is loaded dynamically

declare namespace google {
  namespace maps {
    namespace places {
      interface PlaceResult {
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

      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: {
          componentRestrictions?: { country: string | string[] };
          fields?: string[];
          types?: string[];
        });
        getPlace(): PlaceResult;
        addListener(event: string, callback: () => void): void;
      }
    }

    namespace event {
      function clearInstanceListeners(instance: any): void;
    }
  }
}

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

export {};

