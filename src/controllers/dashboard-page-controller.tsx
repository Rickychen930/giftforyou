import React, { Component } from "react";
import DashboardView from "../view/dashboard-page";
import type { Bouquet } from "../models/domain/bouquet";

import { API_BASE } from "../config/api";
import { normalizeBouquets } from "../utils/bouquet-normalizer";

type MetricsResponse = {
  visitorsCount?: number;
  collectionsCount?: number;
  collections?: string[];
};

type InsightsResponse = {
  days?: number;
  pageviews30d?: number;
  topSearchTerms?: Array<{ term: string; count: number }>;
  topBouquetsDays?: Array<{ bouquetId: string; count: number }>;
  topBouquets7d?: Array<{ bouquetId: string; count: number }>;
  visitHours?: Array<{ hour: number; count: number }>;
  uniqueVisitors30d?: number;
  uniqueVisitorsAvailable?: boolean;
};

interface State {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  insights?: InsightsResponse;
  insightsError?: string;

  loading: boolean;
  errorMessage?: string;
}

class DashboardController extends Component<{}, State> {
  private abortController: AbortController | null = null;
  private metricsAbortController: AbortController | null = null;
  private metricsIntervalId: number | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      collectionsCount: 0,
      visitorsCount: 0,
      collections: [],
      insights: undefined,
      insightsError: undefined,
      loading: true,
      errorMessage: undefined,
    };
  }

  componentDidMount(): void {
    this.loadDashboard();

    // Keep visitor + collections metrics fresh without reloading the whole dashboard UI.
    this.metricsIntervalId = window.setInterval(() => {
      void this.refreshMetrics();
    }, 60_000);
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
    this.metricsAbortController?.abort();
    if (this.metricsIntervalId) window.clearInterval(this.metricsIntervalId);
  }

  private getAuthHeaders(): HeadersInit {
    const { getAuthHeaders } = require("../utils/auth-utils");
    return getAuthHeaders();
  }

  // Using centralized normalizer from utils

  private loadDashboard = async (): Promise<void> => {
    this.abortController?.abort();
    this.abortController = new AbortController();

    this.setState({ loading: true, errorMessage: undefined });

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      };

      const metricsReq = fetch(`${API_BASE}/api/metrics`, {
        method: "GET",
        headers,
        signal: this.abortController.signal,
      });

      const insightsReq = fetch(`${API_BASE}/api/metrics/insights?days=30`, {
        method: "GET",
        headers,
        signal: this.abortController.signal,
      });

      const bouquetsReq = fetch(`${API_BASE}/api/bouquets`, {
        method: "GET",
        headers,
        signal: this.abortController.signal,
      });

      const [metricsRes, bouquetsRes, insightsRes] = await Promise.all([
        metricsReq,
        bouquetsReq,
        insightsReq,
      ]);

      // Handle auth errors clearly
      if (metricsRes.status === 401 || bouquetsRes.status === 401) {
        throw new Error("Unauthorized. Please login again.");
      }

      if (!metricsRes.ok) {
        const t = await metricsRes.text();
        throw new Error(`Failed to load metrics (${metricsRes.status}): ${t}`);
      }

      if (!bouquetsRes.ok) {
        const t = await bouquetsRes.text();
        throw new Error(
          `Failed to load bouquets (${bouquetsRes.status}): ${t}`
        );
      }

      let metricsJson: MetricsResponse;
      let bouquetsJson: unknown;
      
      try {
        const metricsText = await metricsRes.text();
        metricsJson = metricsText.trim() ? JSON.parse(metricsText) : {};
      } catch (e) {
        throw new Error(`Failed to parse metrics response: ${e instanceof Error ? e.message : "Invalid JSON"}`);
      }

      try {
        const bouquetsText = await bouquetsRes.text();
        bouquetsJson = bouquetsText.trim() ? JSON.parse(bouquetsText) : [];
      } catch (e) {
        throw new Error(`Failed to parse bouquets response: ${e instanceof Error ? e.message : "Invalid JSON"}`);
      }

      let insights: InsightsResponse | undefined;
      let insightsError: string | undefined;
      try {
        if (insightsRes.ok) {
          try {
            const insightsText = await insightsRes.text();
            if (insightsText.trim()) {
              insights = JSON.parse(insightsText) as InsightsResponse;
            } else {
              insights = undefined;
            }
          } catch (parseErr) {
            insightsError = `Failed to parse insights: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`;
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
        const t = await res.text();
        throw new Error(`Upload failed (${res.status}): ${t}`);
      }

      await this.loadDashboard();
      return true;
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Upload failed.",
      });
      return false;
    }
  };

  private onUpdate = async (formData: FormData): Promise<boolean> => {
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

      await this.loadDashboard();
      return true;
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Update failed.",
      });
      return false;
    }
  };

  private onDuplicate = async (bouquetId: string): Promise<void> => {
    try {
      // Fetch the bouquet to duplicate
      const res = await fetch(`${API_BASE}/api/bouquets/${bouquetId}`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bouquet (${res.status})`);
      }

      const bouquet = await res.json();
      
      // Create a new FormData with the bouquet data, but without _id
      const formData = new FormData();
      formData.append("name", `${bouquet.name} (Copy)`);
      formData.append("description", bouquet.description ?? "");
      formData.append("price", String(bouquet.price));
      formData.append("type", bouquet.type ?? "");
      formData.append("size", bouquet.size ?? "Medium");
      formData.append("status", bouquet.status ?? "ready");
      formData.append("collectionName", bouquet.collectionName ?? "");
      formData.append("quantity", String(bouquet.quantity ?? 0));
      formData.append("occasions", Array.isArray(bouquet.occasions) ? bouquet.occasions.join(", ") : "");
      formData.append("flowers", Array.isArray(bouquet.flowers) ? bouquet.flowers.join(", ") : "");
      formData.append("isNewEdition", String(Boolean(bouquet.isNewEdition)));
      formData.append("isFeatured", String(Boolean(bouquet.isFeatured)));
      formData.append("customPenanda", Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda.join(",") : "");
      formData.append("careInstructions", bouquet.careInstructions ?? "");

      // Upload as new bouquet
      await this.onUpload(formData);
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Duplicate failed.",
      });
      throw e;
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

      await this.loadDashboard();
    } catch (e) {
      this.setState({
        errorMessage: e instanceof Error ? e.message : "Delete failed.",
      });
      throw e;
    }
  };

  private onLogout = () => {
    const { clearAuth } = require("../utils/auth-utils");
    clearAuth();
    // optional redirect
    window.location.href = "/login";
  };

  render(): React.ReactNode {
    return (
      <DashboardView
        bouquets={this.state.bouquets}
        collectionsCount={this.state.collectionsCount}
        visitorsCount={this.state.visitorsCount}
        collections={this.state.collections}
        insights={this.state.insights}
        insightsError={this.state.insightsError}
        loading={this.state.loading}
        errorMessage={this.state.errorMessage}
        onUpload={this.onUpload}
        onUpdate={this.onUpdate}
        onDuplicate={this.onDuplicate}
        onDelete={this.onDelete}
        onHeroSaved={this.refreshMetrics}
        onLogout={this.onLogout}
      />
    );
  }
}

export default DashboardController;
