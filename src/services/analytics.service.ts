import { API_BASE } from "../config/api";

export type AnalyticsEventType = "pageview" | "search" | "bouquet_view";

type AnalyticsEventPayload = {
  type: AnalyticsEventType;
  visitorId?: string;
  path?: string;
  search?: string;
  term?: string;
  bouquetId?: string;
};

const VISITOR_ID_KEY = "gf_visitor_id";

const generateId = (): string => {
  try {
    const c: any = (globalThis as any).crypto;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
  } catch {
    // ignore
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getVisitorId = (): string => {
  try {
    const existing = safeTrim(localStorage.getItem(VISITOR_ID_KEY), 64);
    if (existing) return existing;

    const next = generateId().slice(0, 64);
    localStorage.setItem(VISITOR_ID_KEY, next);
    return next;
  } catch {
    return "";
  }
};

const safeTrim = (v: unknown, maxLen: number): string => {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
};

export async function postAnalyticsEvent(
  payload: AnalyticsEventPayload
): Promise<void> {
  // Completely silent - no console errors, no network errors visible
  // Analytics is optional and should never affect user experience
  
  // Early return if API_BASE is not configured (prevents errors)
  if (!API_BASE || API_BASE.trim() === "") {
    return;
  }

  try {
    const url = `${API_BASE}/api/metrics/events`;

    const body: AnalyticsEventPayload = {
      type: payload.type,
      visitorId: safeTrim(payload.visitorId ?? getVisitorId(), 64),
      path: safeTrim(payload.path, 300),
      search: safeTrim(payload.search, 600),
      term: safeTrim(payload.term, 120),
      bouquetId: safeTrim(payload.bouquetId, 64),
    };

    // Use sendBeacon for better reliability and silent failures
    // sendBeacon only accepts FormData or Blob, not JSON directly
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        // Convert to FormData for sendBeacon compatibility
        const formData = new FormData();
        formData.append("data", JSON.stringify(body));
        const success = navigator.sendBeacon(url, formData);
        if (success) {
          return; // Successfully sent, exit silently
        }
      } catch {
        // sendBeacon failed, fall through to fetch
      }
    }

    // Fallback to fetch with keepalive - wrapped in requestIdleCallback if available
    const sendFetch = () => {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
        // Suppress all errors
      }).catch(() => {
        // Silently ignore all fetch errors
      });
    };

    // Use requestIdleCallback if available to avoid blocking
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(sendFetch, { timeout: 2000 });
    } else {
      // Fallback: send immediately but don't await
      sendFetch();
    }
  } catch {
    // Completely silent - no logging, no errors
    // Analytics is optional and failures are expected
  }
}

export function trackPageview(pathname: string, search?: string): void {
  const path = safeTrim(pathname, 300);
  if (!path) return;

  void postAnalyticsEvent({
    type: "pageview",
    path,
    search: safeTrim(search ?? "", 600),
  });
}

export function trackSearch(term: string, path?: string, search?: string): void {
  const t = safeTrim(term, 120);
  if (t.length < 2) return;

  void postAnalyticsEvent({
    type: "search",
    term: t,
    path: safeTrim(path ?? "", 300),
    search: safeTrim(search ?? "", 600),
  });
}

export function trackBouquetView(bouquetId: string, path?: string): void {
  const id = safeTrim(bouquetId, 64);
  if (!id) return;

  void postAnalyticsEvent({
    type: "bouquet_view",
    bouquetId: id,
    path: safeTrim(path ?? "", 300),
  });
}
