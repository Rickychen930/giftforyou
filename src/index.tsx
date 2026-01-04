import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./styles/luxury-enhancements.css";
import App from "./App";

// Lazy load devtools only in development
let ReactQueryDevtools: React.ComponentType<{ initialIsOpen?: boolean }> | null = null;
if (process.env.NODE_ENV === "development") {
  try {
    const devtools = require("@tanstack/react-query-devtools");
    ReactQueryDevtools = devtools.ReactQueryDevtools;
  } catch (e) {
    // Devtools not available, continue without them
    console.warn("React Query Devtools not available");
  }
}

// Create a client for React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false, // Don't refetch on mount if data exists
      structuralSharing: true, // Better performance with structural sharing
      // Network mode: prefer cache over network
      networkMode: "online",
    },
    mutations: {
      retry: 1,
      networkMode: "online",
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {process.env.NODE_ENV === "development" && ReactQueryDevtools && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
