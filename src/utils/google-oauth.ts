/**
 * Google OAuth utility functions
 */

// Google OAuth types (separate from Google Maps)
interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token: string }) => void;
    }) => {
      requestAccessToken: () => void;
    };
  };
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: {
        credential: string;
      }) => void;
    }) => void;
    prompt: () => void;
  };
}

// Type guard untuk Google OAuth
interface GoogleWithAccounts {
  accounts?: GoogleAccounts;
}

// Helper type untuk window.google dengan accounts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type GoogleWindow = Window & {
  google?: GoogleWithAccounts;
}

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

/**
 * Load Google OAuth script
 */
export function loadGoogleOAuthScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const win = window as GoogleWindow;
    const googleAccounts = win.google?.accounts;
    if (googleAccounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google OAuth script"));
    document.head.appendChild(script);
  });
}

/**
 * Initialize Google Sign-In button
 */
export function initializeGoogleSignIn(
  onSuccess: (credential: string) => void,
  onError?: (error: Error) => void
): void {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === "") {
    // Silently fail if not configured - don't show error to user
    if (onError) {
      onError(new Error("Google OAuth not configured"));
    }
    return;
  }

  loadGoogleOAuthScript()
    .then(() => {
      const win = window as GoogleWindow;
      const googleAccounts = win.google?.accounts;
      if (!googleAccounts?.id) {
        throw new Error("Google OAuth API not available");
      }

      googleAccounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            if (onError) {
              onError(new Error("No credential received from Google"));
            }
          }
        },
      });
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize Google Sign-In:", error);
      if (onError) {
        onError(error instanceof Error ? error : new Error("Failed to initialize Google Sign-In"));
      }
    });
}

/**
 * Trigger Google Sign-In prompt
 */
export function triggerGoogleSignIn(): void {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === "") {
    // Only warn in development to avoid console noise in production
    if (process.env.NODE_ENV === "development") {
      console.warn("Google Client ID not configured. Google Sign-In will not be available.");
    }
    return;
  }

  const win = window as GoogleWindow;
  const googleAccounts = win.google?.accounts;
  if (googleAccounts?.id) {
    googleAccounts.id.prompt();
  } else {
    // If not initialized yet, try to initialize first
    loadGoogleOAuthScript()
      .then(() => {
        const winAfter = window as GoogleWindow;
        const accounts = winAfter.google?.accounts;
        if (accounts?.id) {
          accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: () => {
              // This will be handled by the main initialization
            },
          });
          accounts.id.prompt();
        }
      })
      .catch((error) => {
        console.error("Failed to load Google OAuth script:", error);
      });
  }
}

