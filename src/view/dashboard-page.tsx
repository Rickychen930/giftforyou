import React, { Component } from "react";
import { IBouquet } from "../models/bouquet-model-real";
import BouquetUploader from "./sections/dashboard-uploader-section";
import "../styles/DashboardPage.css";
import BouquetEditorList from "./sections/dashboard-editor-section";

interface Props {
  bouquets: IBouquet[];
  collectionsCount: number;
  visitorsCount: number;
  onUpdate: (formData: FormData) => Promise<boolean>;
  onUpload: (formData: FormData) => Promise<boolean>;
  collections: string[];
}

interface State {
  activeTab: "dashboard" | "upload" | "edit";
}

class DashboardView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { activeTab: "dashboard" };
  }

  /** ✅ SRP: hanya mengatur perubahan tab */
  setActiveTab = (tab: State["activeTab"]) => {
    this.setState({ activeTab: tab });
  };

  /** ✅ SRP: render sidebar */
  renderSidebar(): React.ReactNode {
    const tabs: State["activeTab"][] = ["dashboard", "upload", "edit"];
    return (
      <aside className="dashboard-sidebar">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={this.state.activeTab === tab ? "active" : ""}
            onClick={() => this.setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </aside>
    );
  }

  /** ✅ SRP: render metrics */
  renderDashboardMetrics(): React.ReactNode {
    const { visitorsCount, collectionsCount, bouquets } = this.props;
    return (
      <div className="dashboard-metrics">
        <div className="metric-box">
          <h3>👥 Visitors</h3>
          <p>{visitorsCount}</p>
        </div>
        <div className="metric-box">
          <h3>📦 Collections</h3>
          <p>{collectionsCount}</p>
        </div>
        <div className="metric-box">
          <h3>🌸 Bouquets</h3>
          <p>{bouquets.length}</p>
        </div>
      </div>
    );
  }

  /** ✅ OCP: mudah tambah tab baru */
  renderMainContent(): React.ReactNode {
    const { activeTab } = this.state;
    const { bouquets, onUpdate, onUpload, collections } = this.props;

    switch (activeTab) {
      case "dashboard":
        return this.renderDashboardMetrics();
      case "upload":
        return <BouquetUploader onUpload={onUpload} />;
      case "edit":
        return (
          <BouquetEditorList
            bouquets={bouquets}
            onSave={onUpdate}
            collections={collections}
          />
        );
      default:
        return null;
    }
  }

  /** ✅ DIP: tidak tahu detail backend, hanya panggil handler dari props */
  render(): React.ReactNode {
    return (
      <div className="dashboard-container">
        {this.renderSidebar()}
        <main className="dashboard-main">
          <h2>🌸 Bouquet Dashboard</h2>
          {this.renderMainContent()}
        </main>
      </div>
    );
  }
}

export default DashboardView;
