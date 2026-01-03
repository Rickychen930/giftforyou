/**
 * Dashboard Page Controller
 * Manages dashboard state and data fetching
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import DashboardView from "../view/dashboard-page";
import type { Bouquet } from "../models/domain/bouquet";

import { API_BASE } from "../config/api";
import { normalizeBouquets, normalizeBouquet } from "../utils/bouquet-normalizer";
import { formatIDR } from "../utils/money";
import { setSeo } from "../utils/seo";
import { getPerformanceMetrics, getPerformanceScore, observeCoreWebVitals } from "../utils/performance-monitor";
import { analyzeSeo } from "../utils/seo-analyzer";
import { savePerformanceHistory, saveSeoHistory } from "../utils/analytics-storage";
import { checkPerformanceAlerts, checkSeoAlerts, checkTrendAlerts, getUnacknowledgedAlerts } from "../utils/analytics-alerts";
import { analyzePerformanceTrends, analyzeSeoTrends } from "../utils/trends-analyzer";
import { getHistoricalData } from "../utils/analytics-storage";
import { getBenchmarks } from "../utils/benchmarks";
import { exportAnalytics } from "../utils/analytics-export";
import { getGAConfig, initGoogleAnalytics, sendPerformanceToGA, sendSEOToGA } from "../utils/google-analytics";
import { getActiveABTests, assignToVariant, trackABTestVisit } from "../utils/ab-testing";
import {
  type ActiveTab,
  type DashboardPageViewState,
  type InsightsResponse,
  type SalesMetrics,
  type MetricsResponse,
  INITIAL_DASHBOARD_PAGE_VIEW_STATE,
  DASHBOARD_TAB_STORAGE_KEY,
  isActiveTab,
  readTabFromLocation,
  writeTabToLocation,
} from "../models/dashboard-page-model";
import { initializeFormState, buildFormData } from "../models/bouquet-editor-model";
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";

interface State extends BaseControllerState {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  insights?: InsightsResponse;
  insightsError?: string;

  salesMetrics?: SalesMetrics;
  salesError?: string;

  // Dashboard view state
  viewState: DashboardPageViewState;
}

class DashboardController extends BaseController<BaseControllerProps, State> {
  private metricsAbortController: AbortController | null = null;
  private metricsIntervalId: number | null = null;

  private performanceCleanup: (() => void) | null = null;
  private copyTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: BaseControllerProps) {
    super(props);
    this.state = {
      ...this.state,
      bouquets: [],
      collectionsCount: 0,
      visitorsCount: 0,
      collections: [],
      insights: undefined,
      insightsError: undefined,
      loading: true,
      errorMessage: undefined,
      viewState: INITIAL_DASHBOARD_PAGE_VIEW_STATE,
    };
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    
    // Initialize tab from location or localStorage
    const initial =
      readTabFromLocation() ||
      (() => {
        const saved = (localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY) ?? "").trim();
        return isActiveTab(saved) ? saved : null;
      })();

    if (initial && initial !== this.state.viewState.activeTab) {
      this.setState((prevState) => ({
        viewState: { ...prevState.viewState, activeTab: initial },
      }));
    } else {
      writeTabToLocation(this.state.viewState.activeTab);
    }

    // Critical: Apply SEO immediately
    this.applySeo();

    // Critical: Load essential data immediately
    this.loadAlerts();

    // Load dashboard data
    this.loadDashboard();

    // Non-critical: Load in background with requestIdleCallback or setTimeout
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        this.loadPerformanceMetrics();
        this.loadSeoAnalysis();
        this.loadTrends();
        this.loadBenchmarks();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.loadPerformanceMetrics();
        this.loadSeoAnalysis();
        this.loadTrends();
        this.loadBenchmarks();
      }, 100);
    }

    // Analytics: Load after initial render
    setTimeout(() => {
      this.initGoogleAnalytics();
      this.initABTests();
    }, 500);

    // Event listeners with proper cleanup
    window.addEventListener("hashchange", this.handleHashChange);
    window.addEventListener("keydown", this.handleKeyDown);

    // Keep visitor + collections metrics fresh without reloading the whole dashboard UI.
    this.metricsIntervalId = window.setInterval(() => {
      void this.refreshMetrics();
    }, 60_000);
  }

  /**
   * Component lifecycle: Update
   * BaseController handles SEO updates
   */
  componentDidUpdate(prevProps: BaseControllerProps, prevState: State): void {
    super.componentDidUpdate(prevProps, prevState);
    
    if (prevState.viewState.activeTab !== this.state.viewState.activeTab) {
      this.applySeo();
      writeTabToLocation(this.state.viewState.activeTab);
      try {
        localStorage.setItem(DASHBOARD_TAB_STORAGE_KEY, this.state.viewState.activeTab);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    // Cleanup event listeners
    window.removeEventListener("hashchange", this.handleHashChange);
    window.removeEventListener("keydown", this.handleKeyDown);

    // Cleanup performance observer
    if (this.performanceCleanup) {
      this.performanceCleanup();
      this.performanceCleanup = null;
    }

    // Cleanup any pending timeouts
    if (this.copyTimeoutId) {
      clearTimeout(this.copyTimeoutId);
      this.copyTimeoutId = null;
    }

    this.metricsAbortController?.abort();
    if (this.metricsIntervalId) window.clearInterval(this.metricsIntervalId);
    
    // Note: BaseController handles abortController cleanup
    super.componentWillUnmount();
  }

  private getAuthHeaders(): HeadersInit {
    const { getAuthHeaders } = require("../utils/auth-utils");
    return getAuthHeaders();
  }

  // Using centralized normalizer from utils

  /**
   * Refresh bouquets list from server
   * Used after delete/update/duplicate operations to ensure data is fresh
   */
  private refreshBouquets = async (): Promise<void> => {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      };

      const bouquetsRes = await this.safeFetch(`${API_BASE}/api/bouquets`, {
        method: "GET",
        headers,
      });

      if (!bouquetsRes) {
        return; // Request was aborted
      }

      if (bouquetsRes.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (!bouquetsRes.ok) {
        const bouquetsText = await bouquetsRes.text();
        let errorMessage = `Failed to refresh bouquets (${bouquetsRes.status})`;
        
        if (bouquetsText.includes("<!DOCTYPE html>") || bouquetsText.includes("<html")) {
          errorMessage = "Endpoint /api/bouquets tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          try {
            const errorData = JSON.parse(bouquetsText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = bouquetsText.length > 200 
              ? `${errorMessage}: ${bouquetsText.substring(0, 200)}...` 
              : `${errorMessage}: ${bouquetsText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const bouquetsText = await bouquetsRes.text();
      const bouquetsJson: unknown = this.safeJsonParse<unknown[]>(bouquetsText, []);
      const bouquets: Bouquet[] = Array.isArray(bouquetsJson)
        ? normalizeBouquets(bouquetsJson)
        : [];

      this.setState((prev) => ({
        bouquets,
      }));
    } catch (err: unknown) {
      const anyErr = err as any;
      if (anyErr?.name === "AbortError") return;
      
      // Don't show error for refresh failures - just log it
      console.warn("Failed to refresh bouquets:", err);
    }
  };

  private loadDashboard = async (): Promise<void> => {
    this.setLoading(true);
    this.setError(null);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      };

      const metricsReq = this.safeFetch(`${API_BASE}/api/metrics`, {
        method: "GET",
        headers,
      });

      const insightsReq = this.safeFetch(`${API_BASE}/api/metrics/insights?days=30`, {
        method: "GET",
        headers,
      });

      const bouquetsReq = this.safeFetch(`${API_BASE}/api/bouquets`, {
        method: "GET",
        headers,
      });

      const ordersReq = this.safeFetch(`${API_BASE}/api/orders?limit=1000`, {
        method: "GET",
        headers,
      });

      const [metricsRes, bouquetsRes, insightsRes, ordersRes] = await Promise.all([
        metricsReq,
        bouquetsReq,
        insightsReq,
        ordersReq,
      ]);

      // Check if any request was aborted
      if (!metricsRes || !bouquetsRes || !insightsRes || !ordersRes) {
        return; // Request was aborted
      }

      // Handle auth errors clearly
      if (metricsRes.status === 401 || bouquetsRes.status === 401 || ordersRes.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      // Read response texts first to check if they're HTML
      const metricsText = await metricsRes.text();
      const bouquetsText = await bouquetsRes.text();

      if (!metricsRes.ok) {
        let errorMessage = `Failed to load metrics (${metricsRes.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (metricsText.includes("<!DOCTYPE html>") || metricsText.includes("<html")) {
          errorMessage = "Endpoint /api/metrics tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(metricsText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = metricsText.length > 200 
              ? `${errorMessage}: ${metricsText.substring(0, 200)}...` 
              : `${errorMessage}: ${metricsText}`;
          }
        }
        throw new Error(errorMessage);
      }

      if (!bouquetsRes.ok) {
        let errorMessage = `Failed to load bouquets (${bouquetsRes.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (bouquetsText.includes("<!DOCTYPE html>") || bouquetsText.includes("<html")) {
          errorMessage = "Endpoint /api/bouquets tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(bouquetsText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = bouquetsText.length > 200 
              ? `${errorMessage}: ${bouquetsText.substring(0, 200)}...` 
              : `${errorMessage}: ${bouquetsText}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful responses using safeJsonParse
      const metricsJson: MetricsResponse = this.safeJsonParse<MetricsResponse>(metricsText, {} as MetricsResponse);
      const bouquetsJson: unknown = this.safeJsonParse<unknown[]>(bouquetsText, []);

      let insights: InsightsResponse | undefined;
      let insightsError: string | undefined;
      try {
        if (insightsRes.ok) {
          const insightsText = await insightsRes.text();
          if (insightsText.trim()) {
            const parsed = this.safeJsonParse<InsightsResponse>(insightsText, {} as InsightsResponse);
            insights = parsed && typeof parsed === "object" ? parsed : undefined;
          } else {
            insights = undefined;
          }
        } else {
          const t = await insightsRes.text();
          insightsError = `Failed to load insights (${insightsRes.status}): ${t || insightsRes.statusText}`;
        }
      } catch (e: unknown) {
        insightsError = e instanceof Error ? e.message : "Failed to load insights.";
      }

      const bouquets: Bouquet[] = Array.isArray(bouquetsJson)
        ? normalizeBouquets(bouquetsJson)
        : [];

      const collectionsFromMetrics =
        Array.isArray(metricsJson.collections) &&
        metricsJson.collections.length > 0
          ? metricsJson.collections.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
          : [];

      // fallback collections list derived from bouquets
      const collectionsFallback = Array.from(
        new Set(bouquets.map((b) => b.collectionName).filter((name): name is string => typeof name === "string" && name.trim().length > 0))
      );

      // Process sales metrics from orders
      let salesMetrics: SalesMetrics | undefined;
      let salesError: string | undefined;
      try {
        if (ordersRes.ok) {
          try {
            const ordersText = await ordersRes.text();
            // Check if response is HTML (error page)
            if (ordersText.trim().startsWith("<!DOCTYPE") || ordersText.trim().startsWith("<html")) {
              // Silently fail - sales metrics are optional
              console.warn("Orders API returned HTML instead of JSON");
              salesMetrics = undefined;
            } else if (ordersText.trim()) {
              const ordersData = this.safeJsonParse<Array<{
                _id?: string;
                totalAmount?: number;
                orderStatus?: string;
                paymentStatus?: string;
                bouquetId?: string;
                bouquetName?: string;
                createdAt?: string;
                customerId?: string;
              }>;

              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

              const orders: Array<{
                _id?: string;
                totalAmount?: number;
                orderStatus?: string;
                paymentStatus?: string;
                bouquetId?: string;
                bouquetName?: string;
                createdAt?: string;
                customerId?: string;
              }> = Array.isArray(ordersData) ? ordersData : [];
              
              const totalOrders = orders.length;
              const totalRevenue = orders.reduce((sum: number, o) => sum + (Number(o.totalAmount) || 0), 0);
              
              const todayOrders = orders.filter((o) => {
                const created = o.createdAt ? new Date(o.createdAt) : null;
                return created && created >= todayStart;
              });
              const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
              
              const thisMonthOrders = orders.filter((o) => {
                const created = o.createdAt ? new Date(o.createdAt) : null;
                return created && created >= monthStart;
              });
              const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

              const pendingOrders = orders.filter((o) => 
                o.orderStatus === "bertanya" || o.orderStatus === "memesan"
              ).length;
              const processingOrders = orders.filter((o) => 
                o.orderStatus === "sedang_diproses" || o.orderStatus === "menunggu_driver" || o.orderStatus === "pengantaran"
              ).length;
              const completedOrders = orders.filter((o) => o.orderStatus === "terkirim").length;

              const unpaidOrders = orders.filter((o) => o.paymentStatus === "belum_bayar").length;
              const paidOrders = orders.filter((o) => 
                o.paymentStatus === "dp" || o.paymentStatus === "sudah_bayar"
              ).length;

              // Top selling bouquets
              const bouquetSales = new Map<string, { name: string; count: number; revenue: number }>();
              orders.forEach((o) => {
                if (o.bouquetId && o.bouquetName) {
                  const existing = bouquetSales.get(o.bouquetId) || { name: o.bouquetName, count: 0, revenue: 0 };
                  existing.count += 1;
                  existing.revenue += Number(o.totalAmount) || 0;
                  bouquetSales.set(o.bouquetId, existing);
                }
              });
              const topSellingBouquets = Array.from(bouquetSales.entries())
                .map(([id, data]) => ({
                  bouquetId: id,
                  bouquetName: data.name,
                  orderCount: data.count,
                  revenue: data.revenue,
                }))
                .sort((a, b) => b.orderCount - a.orderCount || b.revenue - a.revenue)
                .slice(0, 5);

              const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
              
              const uniqueCustomers = new Set(orders.map((o) => o.customerId).filter((id): id is string => Boolean(id)));
              const totalCustomers = uniqueCustomers.size;

              salesMetrics = {
                totalOrders,
                totalRevenue,
                todayOrders: todayOrders.length,
                todayRevenue,
                thisMonthOrders: thisMonthOrders.length,
                thisMonthRevenue,
                pendingOrders,
                processingOrders,
                completedOrders,
                unpaidOrders,
                paidOrders,
                topSellingBouquets,
                averageOrderValue,
                totalCustomers,
              };
            }
          } catch (parseErr) {
            // Silently fail - sales metrics are optional
            console.warn("Failed to parse sales data:", parseErr);
            salesMetrics = undefined;
          }
        } else {
          // Silently fail - sales metrics are optional
          if (ordersRes.status !== 404) {
            console.warn(`Failed to load sales data (${ordersRes.status})`);
          }
          salesMetrics = undefined;
        }
      } catch (e: unknown) {
        // Silently fail - sales metrics are optional
        console.warn("Error loading sales data:", e);
        salesMetrics = undefined;
      }

      this.setState({
        bouquets,
        visitorsCount: Number(metricsJson.visitorsCount ?? 0),
        collectionsCount: Number(
          metricsJson.collectionsCount ?? collectionsFallback.length
        ),
        collections: collectionsFromMetrics.length
          ? collectionsFromMetrics
          : collectionsFallback,
        insights,
        insightsError,
        salesMetrics,
        salesError,
        errorMessage: undefined,
      });
    } catch (err: unknown) {
      const anyErr = err as any;
      if (anyErr?.name === "AbortError") return;

      this.setState({
        errorMessage:
          err instanceof Error ? err.message : "Failed to load dashboard data.",
      });
    } finally {
      // ✅ critical: stop loading in all cases
      this.setState({ loading: false });
    }
  };

  private refreshMetrics = async (): Promise<void> => {
    this.metricsAbortController?.abort();
    this.metricsAbortController = new AbortController();

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      };

      const metricsRes = await fetch(`${API_BASE}/api/metrics`, {
        method: "GET",
        headers,
        signal: this.metricsAbortController.signal,
      });

      if (metricsRes.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (!metricsRes.ok) {
        const t = await metricsRes.text();
        throw new Error(`Failed to load metrics (${metricsRes.status}): ${t}`);
      }

      let metricsJson: MetricsResponse;
      try {
        const text = await metricsRes.text();
        metricsJson = text.trim() ? JSON.parse(text) : {};
      } catch (parseErr) {
        throw new Error(`Failed to parse metrics response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }

      this.setState((prev) => {
        const collectionsFromMetrics =
          Array.isArray(metricsJson.collections) &&
          metricsJson.collections.length > 0
            ? metricsJson.collections.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
            : [];

        const collectionsFallback = Array.from(
          new Set(
            (prev.bouquets ?? [])
              .map((b) => b.collectionName)
              .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
          )
        );

        return {
          visitorsCount: Number(metricsJson.visitorsCount ?? prev.visitorsCount),
          collectionsCount: Number(
            metricsJson.collectionsCount ??
              (collectionsFromMetrics.length
                ? collectionsFromMetrics.length
                : collectionsFallback.length)
          ),
          collections: collectionsFromMetrics.length
            ? collectionsFromMetrics
            : prev.collections.length
              ? prev.collections
              : collectionsFallback,
          errorMessage: undefined,
        };
      });
    } catch (err: unknown) {
      const anyErr = err as any;
      if (anyErr?.name === "AbortError") return;

      this.setState({
        errorMessage:
          err instanceof Error ? err.message : "Failed to load metrics.",
      });
    }
  };

  private onUpload = async (formData: FormData): Promise<boolean> => {
    // Clear any previous errors before starting
    this.setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/bouquets`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          // DO NOT set Content-Type for FormData
        },
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = `Upload gagal (${res.status})`;
        let errorDetails: string | undefined;
        
        // Try to parse error message from response
        try {
          const text = await res.text();
          if (text) {
            // Check if it's HTML (404 page, etc.)
            if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
              errorMessage = `Server error: Endpoint tidak tersedia atau server bermasalah. Status: ${res.status}`;
            } else {
              // Try to parse as JSON
              try {
                const json = JSON.parse(text);
                if (json.error || json.message) {
                  errorMessage = json.error || json.message || errorMessage;
                  // Include details if available (for debugging)
                  if (json.details) {
                    errorDetails = json.details;
                  }
                } else {
                  errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text;
                }
              } catch {
                // Not JSON, use text as is (truncated if too long)
                errorMessage = text.length > 200 ? `${text.substring(0, 200)}...` : text;
              }
            }
          }
        } catch (parseErr) {
          console.error("Error parsing error response:", parseErr);
          errorMessage = `Upload gagal dengan status ${res.status}. Silakan coba lagi.`;
        }
        
        // Log error details for debugging
        console.error("Upload failed:", {
          status: res.status,
          errorMessage,
          errorDetails,
        });
        
        // Create error with details
        const error = new Error(errorMessage);
        if (errorDetails) {
          (error as any).details = errorDetails;
        }
        throw error;
      }

      // Parse success response
      try {
        const data = await res.json();
        if (data.message) {
          console.log("Upload success:", data.message);
        }
      } catch {
        // Response might not be JSON, that's okay
      }

      // Refresh bouquets from server to ensure data is up to date
      await this.refreshBouquets();
      
      // Clear error on success
      this.setError(null);
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error 
        ? e.message 
        : "Upload gagal. Silakan periksa koneksi internet dan coba lagi.";
      
      // eslint-disable-next-line no-console
      console.error("Upload error:", e);
      this.setState({
        errorMessage,
      });
      return false;
    }
  };

  private onUpdate = async (formData: FormData): Promise<boolean> => {
    // Clear any previous errors before starting
    this.setError(null);
    
    try {
      const id = String(formData.get("_id") ?? "");
      if (!id) throw new Error("Missing bouquet id for update.");

      const res = await fetch(`${API_BASE}/api/bouquets/${id}`, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
        },
        body: formData,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Update failed (${res.status}): ${t}`);
      }

      // Optimized: Try to parse response from update first (faster, no extra fetch)
      // Only fetch if response doesn't contain updated bouquet data
      try {
        // Try to read response body first (non-destructive check)
        const responseText = await res.clone().text();
        let updateResponse: { bouquet?: unknown } | null = null;
        
        if (responseText.trim()) {
          try {
            updateResponse = JSON.parse(responseText);
          } catch {
            // Response is not JSON, proceed to fetch
          }
        }
        
        if (updateResponse?.bouquet) {
          // Use data from update response (fastest path)
          const normalized = normalizeBouquet(updateResponse.bouquet);
          if (normalized) {
            this.setState((prev) => ({
              bouquets: prev.bouquets.map((b) =>
                b._id === id ? normalized : b
              ),
            }));
          }
        } else {
          // Only fetch if update response doesn't have bouquet data
          // This is optimized to avoid unnecessary network calls
          const updatedBouquetRes = await fetch(`${API_BASE}/api/bouquets/${id}`, {
            headers: {
              ...this.getAuthHeaders(),
            },
          });
          
          if (updatedBouquetRes.ok) {
            const updatedBouquet = await updatedBouquetRes.json();
            const normalized = normalizeBouquet(updatedBouquet);
            if (normalized) {
              this.setState((prev) => ({
                bouquets: prev.bouquets.map((b) =>
                  b._id === id ? normalized : b
                ),
              }));
            }
          }
        }
      } catch (fetchErr) {
        // If all fails, silently continue - update was successful
        // Editor section will handle local state update
      }
      
      // Refresh bouquets from server to ensure data is up to date
      await this.refreshBouquets();
      
      // Clear error on success
      this.setError(null);
      return true;
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Update failed.",
      });
      return false;
    }
  };

  private onDuplicate = async (bouquetId: string): Promise<void> => {
    // Clear any previous errors before starting
    this.setError(null);
    
    try {
      // Fetch the bouquet to duplicate
      const res = await fetch(`${API_BASE}/api/bouquets/${bouquetId}`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      // Read response text first to check if it's HTML
      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to fetch bouquet (${res.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
          errorMessage = "Endpoint /api/bouquets tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = responseText.length > 200 
              ? `${errorMessage}: ${responseText.substring(0, 200)}...` 
              : `${errorMessage}: ${responseText}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let bouquetData: unknown;
      try {
        bouquetData = responseText.trim() ? JSON.parse(responseText) : null;
      } catch (parseErr) {
        throw new Error(`Failed to parse bouquet response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      
      if (!bouquetData || typeof bouquetData !== "object") {
        throw new Error("Invalid bouquet data received");
      }
      
      // Use normalizeBouquet from utils to ensure all fields are properly normalized
      // This handles all edge cases and ensures type safety
      const normalizedBouquet = normalizeBouquet(bouquetData);
      
      // Validate that normalization was successful
      if (!normalizedBouquet) {
        throw new Error("Bouquet data tidak lengkap. Pastikan nama dan data lainnya tersedia.");
      }
      
      // Additional validation: ensure name exists (normalizeBouquet already checks this, but double-check for clarity)
      if (!normalizedBouquet.name || normalizedBouquet.name.trim().length === 0) {
        throw new Error("Bouquet data tidak lengkap. Pastikan nama tersedia.");
      }
      
      // Use initializeFormState to properly initialize form data
      // This ensures all fields are properly formatted and validated
      const formState = initializeFormState(normalizedBouquet);
      
      // Update name to indicate it's a copy
      formState.name = `${formState.name} (Copy)`;
      
      // Build FormData using the proper function to ensure all fields are correctly formatted
      const formData = buildFormData(formState, null);
      
      // Remove _id from FormData since this is a new bouquet
      formData.delete("_id");

      // Upload as new bouquet
      await this.onUpload(formData);
      
      // Refresh bouquets from server to include the new duplicated bouquet
      await this.refreshBouquets();
      
      // Clear error on success
      this.setError(null);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Duplicate failed.";
      this.setState({
        errorMessage: errorMsg,
      });
      // Don't re-throw to prevent unhandled promise rejection
      // Error is already set in state and will be displayed
    }
  };

  private onDelete = async (bouquetId: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/api/bouquets/${bouquetId}`, {
        method: "DELETE",
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Delete failed (${res.status}): ${t}`);
      }

      // Refresh bouquets from server to ensure data is up to date
      // This ensures the editor always has the latest data
      await this.refreshBouquets();
      
      // Clear error on success
      this.setError(null);
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Delete failed.",
      });
      throw e;
    }
  };

  private onUpdateCollectionName = async (
    collectionId: string,
    newName: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ name: newName }),
      });

      // Read response text first to check if it's HTML
      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to update collection name (${res.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
          errorMessage = "Endpoint /api/collections tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text (but limit length)
            errorMessage = responseText.length > 200 
              ? `${errorMessage}: ${responseText.substring(0, 200)}...` 
              : `${errorMessage}: ${responseText}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Update local state instead of full reload
      // Collections will be updated by the editor component
      // No need to reload full dashboard
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update collection name:", error);
      this.setState({ errorMessage: `Gagal memperbarui nama koleksi: ${error instanceof Error ? error.message : String(error)}` });
      return false;
    }
  };

  private onDeleteCollection = async (collectionId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      });

      // Read response text first to check if it's HTML
      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Failed to delete collection (${res.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
          errorMessage = "Endpoint /api/collections tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData?.error || errorData?.message || errorMessage;
          } catch {
            // If not JSON, use the response text if it's short
            if (responseText.length < 200) {
              errorMessage = responseText;
            }
          }
        }

        this.setState({ errorMessage: `Gagal menghapus koleksi: ${errorMessage}` });
        return false;
      }

      // Parse JSON response
      try {
        const data = JSON.parse(responseText);
        if (data?.message) {
          console.log("Collection deleted:", data.message);
        }
      } catch (parseErr) {
        console.warn("Failed to parse delete collection response:", parseErr);
      }

      // Update local state instead of full reload
      // Collections will be updated by the editor component
      // No need to reload full dashboard
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to delete collection:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Gagal menghapus koleksi. Silakan coba lagi.";
      this.setState({ errorMessage: `Gagal menghapus koleksi: ${errorMessage}` });
      return false;
    }
  };

  private onMoveBouquet = async (
    bouquetId: string,
    targetCollectionId: string
  ): Promise<boolean> => {
    try {
      // Add bouquet to target collection (API handles removal from old collection)
      const addRes = await fetch(`${API_BASE}/api/collections/${targetCollectionId}/bouquets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ bouquetId }),
      });

      // Read response text first to check if it's HTML
      const addResponseText = await addRes.text();

      if (!addRes.ok) {
        let errorMessage = `Failed to move bouquet (${addRes.status})`;
        
        // Check if response is HTML (404 page or error page)
        if (addResponseText.includes("<!DOCTYPE html>") || addResponseText.includes("<html")) {
          errorMessage = "Endpoint /api/collections tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
        } else {
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(addResponseText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = addResponseText.length > 200 
              ? `${errorMessage}: ${addResponseText.substring(0, 200)}...` 
              : `${errorMessage}: ${addResponseText}`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let addData: unknown;
      try {
        addData = addResponseText.trim() ? JSON.parse(addResponseText) : {};
      } catch (parseErr) {
        throw new Error(`Failed to parse move response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      
      // Type assertion for addData
      const moveResponse = (addData && typeof addData === "object" ? addData : {}) as {
        collection?: { name?: string };
      };
      
      const newCollectionName = moveResponse.collection?.name;

      // Update bouquet's collectionName if we got the new name from response
      if (newCollectionName) {
        const updateRes = await fetch(`${API_BASE}/api/bouquets/${bouquetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...this.getAuthHeaders(),
          },
          body: JSON.stringify({ collectionName: newCollectionName }),
        });

        if (!updateRes.ok) {
          // eslint-disable-next-line no-console
          console.warn("Failed to update bouquet's collection name, but bouquet was moved.");
        }
      }

      // Update local state instead of full reload
      // Bouquets and collections will be updated by the editor component
      // No need to reload full dashboard
      return true;
    } catch (error) {
      console.error("Failed to move bouquet:", error);
      this.setState({ errorMessage: `Gagal memindahkan bouquet: ${error instanceof Error ? error.message : String(error)}` });
      return false;
    }
  };

  private onLogout = () => {
    const { clearAuth } = require("../utils/auth-utils");
    clearAuth();
    // optional redirect
    window.location.href = "/login";
  };

  /**
   * Apply SEO
   */
  private applySeo = (): void => {
    const titleByTab: Record<ActiveTab, string> = {
      overview: "Ringkasan Dashboard",
      orders: "Record Order",
      customers: "Customer Management",
      upload: "Upload Bouquet",
      edit: "Edit Bouquet",
      hero: "Hero Slider",
      analytics: "Analytics Dashboard",
    };

    setSeo({
      title: `${titleByTab[this.state.viewState.activeTab]} | Giftforyou.idn Admin`,
      description: "Dashboard admin Giftforyou.idn - Kelola bouquet, pesanan, koleksi, dan analitik performa website florist terbaik di Cirebon, Jawa Barat.",
      path: "/dashboard",
      noIndex: true,
    });
  };

  /**
   * Set active tab
   */
  handleSetActiveTab = (tab: ActiveTab): void => {
    this.setState((prevState) => ({
      viewState: { ...prevState.viewState, activeTab: tab },
    }));
  };

  /**
   * Copy current link
   */
  handleCopyCurrentLink = async (): Promise<void> => {
    const url = window.location.href;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement("textarea");
        el.value = url;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    } catch {
      // Copy failed
    }
  };

  /**
   * Reload dashboard
   */
  handleReloadDashboard = (): void => {
    window.location.reload();
  };

  /**
   * Copy overview
   */
  handleCopyOverview = async (text: string): Promise<void> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }

      this.setState((prevState) => ({
        viewState: { ...prevState.viewState, overviewCopyStatus: "copied" },
      }));

      if (this.copyTimeoutId) {
        clearTimeout(this.copyTimeoutId);
      }
      this.copyTimeoutId = setTimeout(() => {
        this.setState((prevState) => ({
          viewState: { ...prevState.viewState, overviewCopyStatus: "" },
        }));
      }, 1800);
    } catch {
      this.setState((prevState) => ({
        viewState: { ...prevState.viewState, overviewCopyStatus: "failed" },
      }));

      if (this.copyTimeoutId) {
        clearTimeout(this.copyTimeoutId);
      }
      this.copyTimeoutId = setTimeout(() => {
        this.setState((prevState) => ({
          viewState: { ...prevState.viewState, overviewCopyStatus: "" },
        }));
      }, 2200);
    }
  };

  /**
   * Handle hash change
   */
  private handleHashChange = (): void => {
    const next = readTabFromLocation();
    if (next && next !== this.state.viewState.activeTab) {
      this.handleSetActiveTab(next);
    }
  };

  /**
   * Handle key down
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement | null;
    const tag = (target?.tagName ?? "").toLowerCase();
    const isTypingTarget =
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (target?.isContentEditable ?? false);
    if (isTypingTarget) return;

    // Fix: Check Alt key correctly (Alt+number shortcuts)
    if (!e.altKey || e.metaKey || e.ctrlKey) return;

    const key = e.key;
    const map: Record<string, ActiveTab> = {
      "1": "overview",
      "2": "orders",
      "3": "customers",
      "4": "upload",
      "5": "edit",
      "6": "hero",
      "7": "analytics",
    };

    const next = map[key];
    if (!next || next === this.state.viewState.activeTab) return;

    e.preventDefault();
    this.handleSetActiveTab(next);
  };

  /**
   * Load performance metrics
   */
  private loadPerformanceMetrics = (): void => {
    // Get initial metrics
    const metrics = getPerformanceMetrics();
    const score = getPerformanceScore(metrics);

    // Save to history
    savePerformanceHistory(metrics, score.score, score.grade);

    // Check alerts
    checkPerformanceAlerts(metrics, score.score);

    // Send to Google Analytics
    const gaConfig = getGAConfig();
    if (gaConfig.enabled) {
      sendPerformanceToGA(
        {
          lcp: metrics.lcp || 0,
          fid: metrics.fid || 0,
          cls: metrics.cls || 0,
          fcp: metrics.fcp || 0,
          ttfb: metrics.ttfb || 0,
        },
        score.score
      );
    }

    this.setState((prevState) => ({
      viewState: {
        ...prevState.viewState,
        performance: {
          metrics,
          score,
          loading: false,
        },
      },
    }));

    // Observe Core Web Vitals
    this.performanceCleanup = observeCoreWebVitals((name, value) => {
      this.setState((prevState) => {
        const newMetrics = { ...prevState.viewState.performance.metrics, [name]: value };
        const newScore = getPerformanceScore(newMetrics);

        // Save to history
        savePerformanceHistory(newMetrics, newScore.score, newScore.grade);

        // Check alerts
        checkPerformanceAlerts(newMetrics, newScore.score);

        return {
          viewState: {
            ...prevState.viewState,
            performance: {
              metrics: newMetrics,
              score: newScore,
              loading: false,
            },
          },
        };
      });
    });
  };

  /**
   * Load SEO analysis
   */
  private loadSeoAnalysis = (): void => {
    // Use requestAnimationFrame for better performance
    const analyze = () => {
      try {
        const analysis = analyzeSeo();

        // Batch operations
        saveSeoHistory(analysis);
        checkSeoAlerts(analysis);

        // Send to Google Analytics (non-blocking)
        const gaConfig = getGAConfig();
        if (gaConfig.enabled) {
          // Use setTimeout to avoid blocking
          setTimeout(() => {
            sendSEOToGA(analysis.score, analysis.checks);
          }, 0);
        }

        this.setState((prevState) => ({
          viewState: {
            ...prevState.viewState,
            seo: {
              analysis,
              loading: false,
            },
          },
        }));
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.error("SEO analysis error:", error);
        }
        this.setState((prevState) => ({
          viewState: {
            ...prevState.viewState,
            seo: {
              analysis: { score: 0, grade: "poor", checks: [], recommendations: [] },
              loading: false,
            },
          },
        }));
      }
    };

    // Use requestAnimationFrame for DOM readiness
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      requestAnimationFrame(analyze);
    } else {
      analyze();
    }
  };

  /**
   * Load alerts
   */
  private loadAlerts = (): void => {
    // Check trend alerts
    checkTrendAlerts(7);

    // Get unacknowledged alerts
    const alerts = getUnacknowledgedAlerts();
    this.setState((prevState) => ({
      viewState: {
        ...prevState.viewState,
        alerts: {
          alerts,
          showAlerts: alerts.length > 0,
        },
      },
    }));
  };

  /**
   * Load trends
   */
  private loadTrends = (): void => {
    const history = getHistoricalData();

    // Analyze performance trends
    const perfTrends = analyzePerformanceTrends(history.performance, 30);
    if (perfTrends) {
      this.setState((prevState) => ({
        viewState: {
          ...prevState.viewState,
          performance: {
            ...prevState.viewState.performance,
            trends: perfTrends,
          },
        },
      }));
    }

    // Analyze SEO trends
    const seoTrends = analyzeSeoTrends(history.seo, 30);
    if (seoTrends) {
      this.setState((prevState) => ({
        viewState: {
          ...prevState.viewState,
          seo: {
            ...prevState.viewState.seo,
            trends: seoTrends,
          },
        },
      }));
    }
  };

  /**
   * Load benchmarks
   */
  private loadBenchmarks = (): void => {
    const perfBenchmarks = getBenchmarks("performance");
    const seoBenchmarks = getBenchmarks("seo");

    this.setState((prevState) => ({
      viewState: {
        ...prevState.viewState,
        performance: {
          ...prevState.viewState.performance,
          benchmarks: perfBenchmarks,
        },
        seo: {
          ...prevState.viewState.seo,
          benchmarks: seoBenchmarks,
        },
      },
    }));
  };

  /**
   * Initialize Google Analytics
   */
  private initGoogleAnalytics = (): void => {
    const config = getGAConfig();
    if (config.enabled && config.measurementId) {
      initGoogleAnalytics(config.measurementId);
    }
  };

  /**
   * Initialize AB tests
   */
  private initABTests = (): void => {
    const activeTests = getActiveABTests();
    activeTests.forEach((test) => {
      const variant = assignToVariant(test.id);
      trackABTestVisit(test.id, variant);
    });
  };

  /**
   * Handle export
   */
  handleExport = (format: "csv" | "json" | "pdf"): void => {
    exportAnalytics({
      format,
      includePerformance: true,
      includeSeo: true,
    });
  };

  /**
   * Toggle show state
   */
  handleToggleShow = (key: keyof Pick<DashboardPageViewState, "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus">): void => {
    this.setState((prevState) => ({
      viewState: {
        ...prevState.viewState,
        [key]: !prevState.viewState[key],
      },
    }));
  };

  /**
   * Build overview text
   */
  private buildOverviewText = (): string => {
    const bouquets = this.state.bouquets ?? [];
    const visitorsCount = this.state.visitorsCount ?? 0;
    const collectionsCount = this.state.collectionsCount ?? 0;
    const insights = this.state.insights;
    const insightsError = (this.state.insightsError ?? "").trim();
    const insightsDays = Number(insights?.days ?? 30);
    const pageviews30d = Number(insights?.pageviews30d ?? 0);
    const topSearchTerms = (insights?.topSearchTerms ?? []).slice(0, 10);
    const topBouquetsDays = (insights?.topBouquetsDays ?? []).slice(0, 5);
    const visitHours = (insights?.visitHours ?? []).slice(0, 8);
    const uniqueVisitors30d = Number(insights?.uniqueVisitors30d ?? 0);
    const uniqueVisitorsAvailable = Boolean(insights?.uniqueVisitorsAvailable);

    const bouquetNameById = new Map<string, string>();
    for (const b of bouquets) {
      const id = (b._id ?? "").toString();
      const name = (b.name ?? "").toString().trim();
      if (id && name) bouquetNameById.set(id, name);
    }

    const formatHour = (h: number) => `${String(h).padStart(2, "0")}.00`;
    const labelBouquet = (id: string) =>
      bouquetNameById.get(id) ?? (id ? `ID ${id.slice(0, 10)}` : "—");

    const readyCount = bouquets.filter((b) => b.status === "ready").length;
    const preorderCount = bouquets.filter((b) => b.status === "preorder").length;
    const featuredCount = bouquets.filter((b) => Boolean(b.isFeatured)).length;
    const newEditionCount = bouquets.filter((b) => Boolean(b.isNewEdition)).length;

    const missingImageCount = bouquets.filter((b) => !(b.image ?? "").trim()).length;
    const missingCollectionCount = bouquets.filter(
      (b) => !(b.collectionName ?? "").trim()
    ).length;
    const zeroQtyReadyCount = bouquets.filter(
      (b) => b.status === "ready" && (typeof b.quantity === "number" ? b.quantity : 0) === 0
    ).length;

    const totalReadyUnits = bouquets
      .filter((b) => b.status === "ready")
      .reduce((sum, b) => sum + (typeof b.quantity === "number" ? b.quantity : 0), 0);

    const priced = bouquets
      .map((b) => (typeof b.price === "number" ? b.price : Number(b.price)))
      .filter((n) => Number.isFinite(n) && n > 0);
    const priceMin = priced.length ? Math.min(...priced) : 0;
    const priceMax = priced.length ? Math.max(...priced) : 0;
    const priceAvg = priced.length
      ? Math.round(priced.reduce((a, b) => a + b, 0) / priced.length)
      : 0;

    const collectionCounts = new Map<string, number>();
    for (const b of bouquets) {
      const key = (b.collectionName ?? "").trim() || "Tanpa koleksi";
      collectionCounts.set(key, (collectionCounts.get(key) ?? 0) + 1);
    }
    const topCollections = Array.from(collectionCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);

    const overviewLines: string[] = [
      `GIFT foryou.idn — Ringkasan Dashboard (${new Date().toLocaleString("id-ID")})`,
      ``,
      `Kunjungan (${insightsDays} hari): ${insightsError ? visitorsCount : pageviews30d || visitorsCount}`,
      `Koleksi: ${collectionsCount}`,
      `Total bouquet: ${bouquets.length}`,
      `Siap: ${readyCount} (unit siap: ${totalReadyUnits})`,
      `Preorder: ${preorderCount}`,
      `Featured: ${featuredCount}`,
      `New edition: ${newEditionCount}`,
      ``,
      `Kualitas data:`,
      `- Tanpa gambar: ${missingImageCount}`,
      `- Tanpa koleksi: ${missingCollectionCount}`,
      `- Ready qty 0: ${zeroQtyReadyCount}`,
      ``,
      `Harga (bouquet dengan harga valid):`,
      `- Min: ${priced.length ? formatIDR(priceMin) : "—"}`,
      `- Rata-rata: ${priced.length ? formatIDR(priceAvg) : "—"}`,
      `- Max: ${priced.length ? formatIDR(priceMax) : "—"}`,
      ``,
      `Top koleksi:`,
      ...topCollections.map(([name, count]) => `- ${name}: ${count}`),
    ];

    if (insights && !insightsError) {
      overviewLines.push("", "Analytics (estimasi)");

      if (uniqueVisitorsAvailable) {
        overviewLines.push(`Pengunjung unik (30 hari): ${uniqueVisitors30d}`);
      }

      if (topSearchTerms.length) {
        overviewLines.push("Pencarian teratas:");
        overviewLines.push(
          ...topSearchTerms.slice(0, 5).map((t) => `- ${t.term}: ${t.count}`)
        );
      }

      if (topBouquetsDays.length) {
        overviewLines.push("Top 5 bouquet (30 hari):");
        overviewLines.push(
          ...topBouquetsDays.map((b) => `- ${labelBouquet(b.bouquetId)}: ${b.count}`)
        );
      }

      if (visitHours.length) {
        overviewLines.push("Jam kunjungan terpadat (WIB):");
        overviewLines.push(
          ...visitHours.slice(0, 3).map((h) => `- ${formatHour(h.hour)}: ${h.count}`)
        );
      }
    }

    return overviewLines.join("\n");
  };

  /**
   * Calculate metrics for overview
   * Optimized with single-pass filtering for better performance
   */
  private calculateOverviewMetrics = () => {
    const bouquets = this.state.bouquets ?? [];
    const visitorsCount = this.state.visitorsCount ?? 0;
    const collectionsCount = this.state.collectionsCount ?? 0;
    const insights = this.state.insights;
    const insightsError = (this.state.insightsError ?? "").trim();
    const insightsDays = Number(insights?.days ?? 30);
    const pageviews30d = Number(insights?.pageviews30d ?? 0);
    const topSearchTerms = (insights?.topSearchTerms ?? []).slice(0, 10);
    const topBouquetsDays = (insights?.topBouquetsDays ?? []).slice(0, 5);
    const visitHours = (insights?.visitHours ?? []).slice(0, 8);
    const uniqueVisitors30d = Number(insights?.uniqueVisitors30d ?? 0);
    const uniqueVisitorsAvailable = Boolean(insights?.uniqueVisitorsAvailable);

    // Single-pass optimization: calculate all metrics in one loop
    const bouquetNameById = new Map<string, string>();
    let readyCount = 0;
    let preorderCount = 0;
    let featuredCount = 0;
    let newEditionCount = 0;
    let missingImageCount = 0;
    let missingCollectionCount = 0;
    let zeroQtyReadyCount = 0;
    let totalReadyUnits = 0;
    const priced: number[] = [];
    const collectionCounts = new Map<string, number>();

    // Single pass through bouquets array
    for (const b of bouquets) {
      // Build bouquet name map
      const id = (b._id ?? "").toString();
      const name = (b.name ?? "").toString().trim();
      if (id && name) bouquetNameById.set(id, name);

      // Count by status (single pass)
      if (b.status === "ready") {
        readyCount++;
        const qty = typeof b.quantity === "number" ? b.quantity : 0;
        totalReadyUnits += qty;
        if (qty === 0) zeroQtyReadyCount++;
      } else if (b.status === "preorder") {
        preorderCount++;
      }

      // Count featured and new edition
      if (Boolean(b.isFeatured)) featuredCount++;
      if (Boolean(b.isNewEdition)) newEditionCount++;

      // Count missing data
      if (!(b.image ?? "").trim()) missingImageCount++;
      if (!(b.collectionName ?? "").trim()) missingCollectionCount++;

      // Collect valid prices
      const price = typeof b.price === "number" ? b.price : Number(b.price);
      if (Number.isFinite(price) && price > 0) {
        priced.push(price);
      }

      // Count collections
      const collectionKey = (b.collectionName ?? "").trim() || "Tanpa koleksi";
      collectionCounts.set(collectionKey, (collectionCounts.get(collectionKey) ?? 0) + 1);
    }

    // Calculate price metrics
    const priceMin = priced.length ? Math.min(...priced) : 0;
    const priceMax = priced.length ? Math.max(...priced) : 0;
    const priceAvg = priced.length
      ? Math.round(priced.reduce((a, b) => a + b, 0) / priced.length)
      : 0;

    // Sort and slice top collections
    const topCollections = Array.from(collectionCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);

    const formatHour = (h: number) => `${String(h).padStart(2, "0")}.00`;
    const labelBouquet = (id: string) =>
      bouquetNameById.get(id) ?? (id ? `ID ${id.slice(0, 10)}` : "—");

    return {
      readyCount,
      preorderCount,
      featuredCount,
      newEditionCount,
      missingImageCount,
      missingCollectionCount,
      zeroQtyReadyCount,
      totalReadyUnits,
      priceMin,
      priceMax,
      priceAvg,
      topCollections,
      bouquetNameById,
      formatHour,
      labelBouquet,
      insightsDays,
      pageviews30d,
      topSearchTerms,
      topBouquetsDays,
      visitHours,
      uniqueVisitors30d,
      uniqueVisitorsAvailable,
      insightsError,
      visitorsCount,
      collectionsCount,
    };
  };

  render(): React.ReactNode {
    const overviewMetrics = this.calculateOverviewMetrics();
    const overviewText = this.buildOverviewText();

    return (
      <DashboardView
        bouquets={this.state.bouquets}
        collectionsCount={this.state.collectionsCount}
        visitorsCount={this.state.visitorsCount}
        collections={this.state.collections}
        insights={this.state.insights}
        insightsError={this.state.insightsError}
        salesMetrics={this.state.salesMetrics}
        salesError={this.state.salesError}
        loading={this.state.loading ?? false}
        errorMessage={this.state.errorMessage}
        viewState={this.state.viewState}
        overviewMetrics={overviewMetrics}
        overviewText={overviewText}
        onUpload={this.onUpload}
        onUpdate={this.onUpdate}
        onDuplicate={this.onDuplicate}
        onDelete={this.onDelete}
        onHeroSaved={this.refreshMetrics}
        onLogout={this.onLogout}
        onUpdateCollectionName={this.onUpdateCollectionName}
        onMoveBouquet={this.onMoveBouquet}
        onDeleteCollection={this.onDeleteCollection}
        onSetActiveTab={this.handleSetActiveTab}
        onCopyCurrentLink={this.handleCopyCurrentLink}
        onReloadDashboard={this.handleReloadDashboard}
        onCopyOverview={this.handleCopyOverview}
        onExport={this.handleExport}
        onToggleShow={this.handleToggleShow}
      />
    );
  }
}

export default DashboardController;
