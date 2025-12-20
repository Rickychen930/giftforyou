import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import "../styles/DashboardPage.css";

import BouquetUploader from "../components/sections/dashboard-uploader-section";
import BouquetEditorSection from "../components/sections/Bouquet-editor-section";

interface Props {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  loading: boolean;
  errorMessage?: string;

  onUpdate: (formData: FormData) => Promise<boolean>;
  onUpload: (formData: FormData) => Promise<boolean>;
  onLogout: () => void;
}

type ActiveTab = "overview" | "upload" | "edit";

interface State {
  activeTab: ActiveTab;
}

class DashboardView extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { activeTab: "overview" };
  }

  private setActiveTab = (tab: ActiveTab) => {
    this.setState({ activeTab: tab });
  };

  private renderSidebar(): React.ReactNode {
    const tabs: { key: ActiveTab; label: string }[] = [
      { key: "overview", label: "Overview" },
      { key: "upload", label: "Upload Bouquet" },
      { key: "edit", label: "Edit Bouquets" },
    ];

    return (
      <aside className="dashboardSidebar" aria-label="Dashboard navigation">
        <div className="dashboardBrand">
          <img
            src="/images/logo.png"
            alt="Giftforyou.idn logo"
            className="dashboardBrand__logo"
            loading="lazy"
          />
          <div>
            <div className="dashboardBrand__title">Giftforyou.idn</div>
            <div className="dashboardBrand__subtitle">Admin Dashboard</div>
          </div>
        </div>

        <nav className="dashboardNav" aria-label="Dashboard tabs">
          {tabs.map((t) => {
            const isActive = this.state.activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`dashboardNav__btn ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined} // ✅ FIXED
                onClick={() => this.setActiveTab(t.key)}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="dashboardLogout"
          onClick={this.props.onLogout}
        >
          Logout
        </button>
      </aside>
    );
  }

  private renderMetrics(): React.ReactNode {
    const bouquets = this.props.bouquets ?? [];
    const visitorsCount = this.props.visitorsCount ?? 0;
    const collectionsCount = this.props.collectionsCount ?? 0;

    return (
      <section className="dashboardMetrics" aria-label="Store metrics">
        <div className="metricCard">
          <p className="metricCard__label">Visitors</p>
          <p className="metricCard__value">{visitorsCount}</p>
        </div>

        <div className="metricCard">
          <p className="metricCard__label">Collections</p>
          <p className="metricCard__value">{collectionsCount}</p>
        </div>

        <div className="metricCard">
          <p className="metricCard__label">Bouquets</p>
          <p className="metricCard__value">{bouquets.length}</p>
        </div>
      </section>
    );
  }

  private renderMainContent(): React.ReactNode {
    const { activeTab } = this.state;
    const bouquets = this.props.bouquets ?? [];
    const collections = this.props.collections ?? [];

    switch (activeTab) {
      case "overview":
        return this.renderMetrics();

      case "upload":
        return <BouquetUploader onUpload={this.props.onUpload} />;

      case "edit":
        return (
          <BouquetEditorSection
            bouquets={bouquets}
            onSave={this.props.onUpdate}
            collections={collections}
          />
        );

      default:
        return null;
    }
  }

  public render(): React.ReactNode {
    const { loading } = this.props;
    const errorMessage = (this.props.errorMessage ?? "").trim();

    return (
      <div className="dashboardLayout">
        {this.renderSidebar()}

        <main className="dashboardMain">
          <header className="dashboardHeader">
            <h1 className="dashboardHeader__title">Bouquet Management</h1>
            <p className="dashboardHeader__subtitle">
              Manage products, keep collections updated, and monitor store
              activity.
            </p>
          </header>

          {loading && (
            <div className="dashboardState" aria-live="polite">
              Loading dashboard data...
            </div>
          )}

          {!loading && errorMessage && (
            <div className="dashboardState dashboardState--error" role="alert">
              <p className="dashboardState__title">
                Failed to load dashboard data
              </p>
              <p className="dashboardState__text">{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && this.renderMainContent()}
        </main>
      </div>
    );
  }
}

export default DashboardView;
