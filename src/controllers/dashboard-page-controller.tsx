// src/controllers/DashboardController.tsx
import React, { Component } from "react";
import { IBouquet } from "../models/bouquet-model-real";
import DashboardView from "../view/dashboard-page";

interface State {
  bouquets: IBouquet[];
  visitorsCount: number;
  collectionsCount: number;
  collections: string[];
}

class DashboardController extends Component<{}, State> {
  private activityInterval: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      visitorsCount: 0,
      collectionsCount: 0,
      collections: [],
    };
  }

  async componentDidMount() {
    const token = localStorage.getItem("authToken");
    const lastActivity = localStorage.getItem("lastActivity");

    if (!token || !lastActivity) {
      window.location.href = "/login";
      return;
    }

    window.addEventListener("mousemove", this.updateActivity);
    window.addEventListener("keydown", this.updateActivity);

    this.activityInterval = setInterval(this.checkSessionTimeout, 10000);

    await this.refreshData();
  }

  componentWillUnmount() {
    if (this.activityInterval) clearInterval(this.activityInterval);
    window.removeEventListener("mousemove", this.updateActivity);
    window.removeEventListener("keydown", this.updateActivity);
  }

  /** ✅ SRP: update activity timestamp */
  updateActivity = () => {
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  /** ✅ SRP: check session timeout */
  checkSessionTimeout = () => {
    const lastActivity = localStorage.getItem("lastActivity");
    if (!lastActivity) return;

    const diff = Date.now() - parseInt(lastActivity, 10);
    const fiveMinutes = 5 * 60 * 1000;
    if (diff > fiveMinutes) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastActivity");
      alert("⚠️ Session expired. Please login again.");
      window.location.href = "/login";
    }
  };

  /** ✅ SRP: refresh dashboard data */
  refreshData = async () => {
    try {
      const [bouquetsRes, metricsRes] = await Promise.all([
        fetch("http://localhost:4000/api/bouquets"),
        fetch("http://localhost:4000/api/metrics"),
      ]);

      if (!bouquetsRes.ok || !metricsRes.ok) {
        console.error("Failed to fetch dashboard data");
        return;
      }

      const bouquetsData = await bouquetsRes.json();
      const metricsData = await metricsRes.json();

      this.setState({
        bouquets: bouquetsData,
        visitorsCount: metricsData.visitorsCount ?? 0,
        collectionsCount: metricsData.collectionsCount ?? 0,
        collections: metricsData.collections ?? [], // ✅ ambil collections dari backend
      });
    } catch (err) {
      console.error("❌ Failed to fetch dashboard data", err);
    }
  };

  /** ✅ Update bouquet dengan FormData */
  handleUpdate = async (formData: FormData): Promise<boolean> => {
    try {
      const id = formData.get("_id") as string;
      if (!id) {
        console.error("❌ Missing bouquet ID in FormData");
        return false;
      }

      const res = await fetch(`http://localhost:4000/api/bouquets/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Update failed:", text);
        return false;
      }

      const data = await res.json();

      this.setState((prev) => ({
        bouquets: prev.bouquets.map((b) =>
          String(b._id) === id ? data.bouquet : b
        ),
      }));

      await this.refreshData();
      return true;
    } catch (err) {
      console.error("❌ Failed to update bouquet", err);
      return false;
    }
  };

  /** ✅ Upload bouquet baru ke backend dengan FormData */
  handleUpload = async (formData: FormData): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:4000/api/bouquets", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Upload failed:", text);
        return false;
      }
      const data = await res.json();
      this.setState((prev) => ({
        bouquets: [...prev.bouquets, data.bouquet],
      }));
      await this.refreshData();
      return true;
    } catch (err) {
      console.error("❌ Failed to upload bouquet", err);
      return false;
    }
  };

  render(): React.ReactNode {
    return (
      <DashboardView
        bouquets={this.state.bouquets}
        visitorsCount={this.state.visitorsCount}
        collectionsCount={this.state.collectionsCount}
        onUpdate={this.handleUpdate}
        onUpload={this.handleUpload}
        collections={this.state.collections} // ✅ sekarang diteruskan dari backend
      />
    );
  }
}

export default DashboardController;
