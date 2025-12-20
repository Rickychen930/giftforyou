// src/controllers/DashboardController.tsx

import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import DashboardView from "../view/dashboard-page";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const CHECK_INTERVAL_MS = 10 * 1000; // 10 seconds

interface State {
  bouquets: Bouquet[];
  visitorsCount: number;
  collectionsCount: number;
  collections: string[];

  loading: boolean;
  errorMessage: string;
}

class DashboardController extends Component<{}, State> {
  private activityInterval: ReturnType<typeof setInterval> | null = null;
  private abortController = new AbortController();

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      visitorsCount: 0,
      collectionsCount: 0,
      collections: [],
      loading: true,
      errorMessage: "",
    };
  }

  componentDidMount(): void {
    const token = localStorage.getItem("authToken");
    const lastActivity = localStorage.getItem("lastActivity");

    if (!token || !lastActivity) {
      window.location.assign("/login");
      return;
    }

    window.addEventListener("mousemove", this.updateActivity);
    window.addEventListener("keydown", this.updateActivity);

    this.activityInterval = setInterval(
      this.checkSessionTimeout,
      CHECK_INTERVAL_MS
    );

    this.refreshData();
  }

  componentWillUnmount(): void {
    this.abortController.abort();
    if (this.activityInterval) clearInterval(this.activityInterval);

    window.removeEventListener("mousemove", this.updateActivity);
    window.removeEventListener("keydown", this.updateActivity);
  }

  private updateActivity = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  private checkSessionTimeout = () => {
    const last = localStorage.getItem("lastActivity");
    if (!last) return;

    const diff = Date.now() - Number(last);
    if (diff > SESSION_TIMEOUT_MS) {
      this.handleLogout();
    }
  };

  private handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("lastActivity");
    window.location.assign("/login");
  };

  private authHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ✅ Normalize backend JSON to frontend domain Bouquet
  private normalizeBouquet = (b: any): Bouquet => {
    return {
      _id: String(b?._id ?? ""),
      name: typeof b?.name === "string" ? b.name : "",
      description: typeof b?.description === "string" ? b.description : "",

      price: Number(b?.price ?? 0),

      type: typeof b?.type === "string" ? b.type : undefined,
      size: typeof b?.size === "string" ? b.size : undefined,

      // ✅ required fields in Bouquet domain model
      occasions: Array.isArray(b?.occasions) ? b.occasions : [],
      flowers: Array.isArray(b?.flowers) ? b.flowers : [],
      isNewEdition: Boolean(b?.isNewEdition),
      isFeatured: Boolean(b?.isFeatured),

      image: typeof b?.image === "string" ? b.image : undefined,
      status: b?.status === "preorder" ? "preorder" : "ready",

      quantity: typeof b?.quantity === "number" ? b.quantity : undefined,
      collectionName:
        typeof b?.collectionName === "string" ? b.collectionName : undefined,

      careInstructions:
        typeof b?.careInstructions === "string"
          ? b.careInstructions
          : undefined,

      createdAt: typeof b?.createdAt === "string" ? b.createdAt : undefined,
      updatedAt: typeof b?.updatedAt === "string" ? b.updatedAt : undefined,
    };
  };

  private refreshData = async () => {
    this.setState({ loading: true, errorMessage: "" });

    try {
      const [bouquetsRes, metricsRes] = await Promise.all([
        fetch(`${API_BASE}/api/bouquets`, {
          signal: this.abortController.signal,
          headers: this.authHeaders(),
        }),
        fetch(`${API_BASE}/api/metrics`, {
          signal: this.abortController.signal,
          headers: this.authHeaders(),
        }),
      ]);

      if (!bouquetsRes.ok) {
        const text = await bouquetsRes.text();
        throw new Error(
          `Bouquets request failed (${bouquetsRes.status}): ${text}`
        );
      }

      if (!metricsRes.ok) {
        const text = await metricsRes.text();
        throw new Error(
          `Metrics request failed (${metricsRes.status}): ${text}`
        );
      }

      const bouquetsData = (await bouquetsRes.json()) as any[];
      const metricsData = (await metricsRes.json()) as any;

      const bouquets: Bouquet[] = Array.isArray(bouquetsData)
        ? bouquetsData.map(this.normalizeBouquet)
        : [];

      this.setState({
        bouquets,
        visitorsCount: Number(metricsData?.visitorsCount ?? 0),
        collectionsCount: Number(metricsData?.collectionsCount ?? 0),
        collections: Array.isArray(metricsData?.collections)
          ? metricsData.collections
          : [],
        loading: false,
        errorMessage: "",
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      const message = err instanceof Error ? err.message : "Unknown error";
      this.setState({ loading: false, errorMessage: message });
    }
  };

  private handleUpdate = async (formData: FormData): Promise<boolean> => {
    try {
      const id = String(formData.get("_id") ?? "");
      if (!id) return false;

      const res = await fetch(`${API_BASE}/api/bouquets/${id}`, {
        method: "PUT",
        body: formData,
        headers: this.authHeaders(),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed:", text);
        return false;
      }

      await this.refreshData();
      return true;
    } catch (err) {
      console.error("Failed to update bouquet", err);
      return false;
    }
  };

  private handleUpload = async (formData: FormData): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/bouquets`, {
        method: "POST",
        body: formData,
        headers: this.authHeaders(),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Upload failed:", text);
        return false;
      }

      await this.refreshData();
      return true;
    } catch (err) {
      console.error("Failed to upload bouquet", err);
      return false;
    }
  };

  render(): React.ReactNode {
    return (
      <DashboardView
        bouquets={this.state.bouquets}
        visitorsCount={this.state.visitorsCount}
        collectionsCount={this.state.collectionsCount}
        collections={this.state.collections}
        loading={this.state.loading}
        errorMessage={this.state.errorMessage}
        onUpdate={this.handleUpdate}
        onUpload={this.handleUpload}
        onLogout={this.handleLogout}
      />
    );
  }
}

export default DashboardController;
