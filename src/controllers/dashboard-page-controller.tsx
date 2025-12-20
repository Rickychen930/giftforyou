import React, { Component } from "react";
import DashboardView from "../view/dashboard-page";
import type { Bouquet } from "../models/domain/bouquet";

type MetricsResponse = {
  visitorsCount?: number;
  collectionsCount?: number;
  collections?: string[];
};

interface State {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  loading: boolean;
  errorMessage?: string;
}

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

class DashboardController extends Component<{}, State> {
  private abortController: AbortController | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      collectionsCount: 0,
      visitorsCount: 0,
      collections: [],
      loading: true,
      errorMessage: undefined,
    };
  }

  componentDidMount(): void {
    this.loadDashboard();
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private normalizeBouquet = (b: any): Bouquet => ({
    _id: String(b?._id ?? ""),
    name: isNonEmptyString(b?.name) ? b.name : "",
    description: isNonEmptyString(b?.description) ? b.description : "",
    price: Number(b?.price ?? 0),

    type: isNonEmptyString(b?.type) ? b.type : "",
    size: isNonEmptyString(b?.size) ? b.size : "",

    image: isNonEmptyString(b?.image) ? b.image : "",
    status: b?.status === "preorder" ? "preorder" : "ready",
    collectionName: isNonEmptyString(b?.collectionName) ? b.collectionName : "",

    occasions: Array.isArray(b?.occasions) ? b.occasions : [],
    flowers: Array.isArray(b?.flowers) ? b.flowers : [],
    isNewEdition: Boolean(b?.isNewEdition),
    isFeatured: Boolean(b?.isFeatured),

    quantity: typeof b?.quantity === "number" ? b.quantity : 0,
    careInstructions: isNonEmptyString(b?.careInstructions)
      ? b.careInstructions
      : undefined,
    createdAt: isNonEmptyString(b?.createdAt) ? b.createdAt : undefined,
    updatedAt: isNonEmptyString(b?.updatedAt) ? b.updatedAt : undefined,
  });

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

      const bouquetsReq = fetch(`${API_BASE}/api/bouquets`, {
        method: "GET",
        headers,
        signal: this.abortController.signal,
      });

      const [metricsRes, bouquetsRes] = await Promise.all([
        metricsReq,
        bouquetsReq,
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

      const metricsJson = (await metricsRes.json()) as MetricsResponse;
      const bouquetsJson = (await bouquetsRes.json()) as any;

      const bouquets: Bouquet[] = Array.isArray(bouquetsJson)
        ? bouquetsJson.map(this.normalizeBouquet)
        : [];

      const collectionsFromMetrics =
        Array.isArray(metricsJson.collections) &&
        metricsJson.collections.length > 0
          ? metricsJson.collections.filter(isNonEmptyString)
          : [];

      // fallback collections list derived from bouquets
      const collectionsFallback = Array.from(
        new Set(bouquets.map((b) => b.collectionName).filter(isNonEmptyString))
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

  private onLogout = () => {
    localStorage.removeItem("authToken");
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
        loading={this.state.loading}
        errorMessage={this.state.errorMessage}
        onUpload={this.onUpload}
        onUpdate={this.onUpdate}
        onLogout={this.onLogout}
      />
    );
  }
}

export default DashboardController;
