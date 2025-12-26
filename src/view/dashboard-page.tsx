import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import "../styles/DashboardPage.css";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";

import BouquetUploader from "../components/sections/dashboard-uploader-section";
import BouquetEditorSection from "../components/sections/Bouquet-editor-section";
import HeroSliderEditorSection from "../components/sections/HeroSliderEditorSection";
import OrdersSection from "../components/sections/orders-section";

interface Props {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  insights?: {
    days?: number;
    pageviews30d?: number;
    topSearchTerms?: Array<{ term: string; count: number }>;
    topBouquetsDays?: Array<{ bouquetId: string; count: number }>;
    topBouquets7d?: Array<{ bouquetId: string; count: number }>;
    visitHours?: Array<{ hour: number; count: number }>;
    uniqueVisitors30d?: number;
    uniqueVisitorsAvailable?: boolean;
  };
  insightsError?: string;

  loading: boolean;
  errorMessage?: string;

  onUpdate: (formData: FormData) => Promise<boolean>;
  onUpload: (formData: FormData) => Promise<boolean>;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
  onHeroSaved?: () => void | Promise<void>;
  onLogout: () => void;
}

type ActiveTab = "overview" | "orders" | "upload" | "edit" | "hero";

const DASHBOARD_TAB_STORAGE_KEY = "dashboard.activeTab";

const isActiveTab = (v: string): v is ActiveTab =>
  v === "overview" ||
  v === "orders" ||
  v === "upload" ||
  v === "edit" ||
  v === "hero";

const readTabFromLocation = (): ActiveTab | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qp = (params.get("tab") ?? "").trim();
    if (qp && isActiveTab(qp)) return qp;

    const hash = (window.location.hash ?? "").replace(/^#/, "").trim();
    if (hash && isActiveTab(hash)) return hash;

    return null;
  } catch {
    return null;
  }
};

const writeTabToLocation = (tab: ActiveTab) => {
  try {
    const nextUrl = `${window.location.pathname}${window.location.search}#${tab}`;
    window.history.replaceState(null, "", nextUrl);
  } catch {
    // ignore
  }
};

interface State {
  activeTab: ActiveTab;
  copyStatus: "" | "copied" | "failed";
  overviewCopyStatus: "" | "copied" | "failed";
}

class DashboardView extends Component<Props, State> {
  state: State = { activeTab: "overview", copyStatus: "", overviewCopyStatus: "" };

  componentDidMount(): void {
    const initial =
      readTabFromLocation() ||
      (() => {
        const saved = (localStorage.getItem(DASHBOARD_TAB_STORAGE_KEY) ?? "").trim();
        return isActiveTab(saved) ? saved : null;
      })();

    if (initial && initial !== this.state.activeTab) {
      this.setState({ activeTab: initial });
    } else {
      writeTabToLocation(this.state.activeTab);
    }

    this.applySeo();

    window.addEventListener("hashchange", this.handleHashChange);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount(): void {
    window.removeEventListener("hashchange", this.handleHashChange);
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.activeTab !== this.state.activeTab) {
      this.applySeo();

      writeTabToLocation(this.state.activeTab);
      try {
        localStorage.setItem(DASHBOARD_TAB_STORAGE_KEY, this.state.activeTab);
      } catch {
        // ignore
      }
    }
  }

  private applySeo(): void {
    const titleByTab: Record<ActiveTab, string> = {
      overview: "Ringkasan Dashboard",
      orders: "Record Order",
      upload: "Upload Bouquet",
      edit: "Edit Bouquet",
      hero: "Hero Slider",
    };

    setSeo({
      title: `${titleByTab[this.state.activeTab]} | Giftforyou.idn Admin`,
      description: "Giftforyou.idn admin dashboard.",
      path: "/dashboard",
      noIndex: true,
    });
  }

  private setActiveTab = (tab: ActiveTab) => {
    this.setState({ activeTab: tab });
  };

  private copyCurrentLink = async () => {
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

      this.setState({ copyStatus: "copied" });
      window.setTimeout(() => this.setState({ copyStatus: "" }), 1800);
    } catch {
      this.setState({ copyStatus: "failed" });
      window.setTimeout(() => this.setState({ copyStatus: "" }), 2200);
    }
  };

  private reloadDashboard = () => {
    window.location.reload();
  };

  private copyOverview = async (text: string) => {
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

      this.setState({ overviewCopyStatus: "copied" });
      window.setTimeout(() => this.setState({ overviewCopyStatus: "" }), 1800);
    } catch {
      this.setState({ overviewCopyStatus: "failed" });
      window.setTimeout(() => this.setState({ overviewCopyStatus: "" }), 2200);
    }
  };

  private handleHashChange = () => {
    const next = readTabFromLocation();
    if (next && next !== this.state.activeTab) {
      this.setState({ activeTab: next });
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const tag = (target?.tagName ?? "").toLowerCase();
    const isTypingTarget =
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      (target?.isContentEditable ?? false);
    if (isTypingTarget) return;

    if (!e.altKey || e.metaKey || e.ctrlKey) return;

    const key = e.key;
    const map: Record<string, ActiveTab> = {
      "1": "overview",
      "2": "orders",
      "3": "upload",
      "4": "edit",
      "5": "hero",
    };

    const next = map[key];
    if (!next) return;

    e.preventDefault();
    this.setActiveTab(next);
  };

  private renderSidebar(): React.ReactNode {
    const tabs: { key: ActiveTab; label: string }[] = [
      { key: "overview", label: "Ringkasan" },
      { key: "orders", label: "Record order" },
      { key: "upload", label: "Upload Bouquet" },
      { key: "edit", label: "Edit Bouquet" },
      { key: "hero", label: "Hero Slider" },
    ];

    return (
      <aside className="dashboardSidebar" aria-label="Navigasi dashboard">
        <a className="dashboardSkipLink" href="#dashboard-main">
          Lewati ke konten
        </a>

        <div className="dashboardBrand">
          <img
            src="/images/logo.png"
            alt="Giftforyou.idn logo"
            className="dashboardBrand__logo"
            loading="lazy"
          />
          <div>
            <div className="dashboardBrand__title">Giftforyou.idn</div>
            <div className="dashboardBrand__subtitle">Dashboard Admin</div>
          </div>
        </div>

        <nav className="dashboardNav" aria-label="Tab dashboard">
          {tabs.map((t) => {
            const isActive = this.state.activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`dashboardNav__btn ${isActive ? "is-active" : ""}`}
                aria-current={isActive ? "page" : undefined} // ✅ FIXED
                aria-keyshortcuts={
                  t.key === "overview"
                    ? "Alt+1"
                    : t.key === "orders"
                      ? "Alt+2"
                      : t.key === "upload"
                        ? "Alt+3"
                        : t.key === "edit"
                          ? "Alt+4"
                          : t.key === "hero"
                            ? "Alt+5"
                            : undefined
                }
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
          Keluar
        </button>
      </aside>
    );
  }

  private renderMetrics(): React.ReactNode {
    const bouquets = this.props.bouquets ?? [];
    const visitorsCount = this.props.visitorsCount ?? 0;
    const collectionsCount = this.props.collectionsCount ?? 0;

    const insights = this.props.insights;
    const insightsError = (this.props.insightsError ?? "").trim();
    const insightsDays = Number(insights?.days ?? 30);
    const pageviews30d = Number(insights?.pageviews30d ?? 0);
    const topSearchTerms = (insights?.topSearchTerms ?? []).slice(0, 10);
    const topBouquetsDays = (insights?.topBouquetsDays ?? []).slice(0, 5);
    const topBouquets7d = (insights?.topBouquets7d ?? []).slice(0, 3);
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

    const lastUpdatedMs = bouquets.reduce((max, b) => {
      const candidate = (b.updatedAt ?? b.createdAt ?? "").toString();
      const t = Date.parse(candidate);
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    const lastUpdatedLabel = lastUpdatedMs
      ? new Date(lastUpdatedMs).toLocaleString("id-ID")
      : "—";

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

    const overviewText = overviewLines.join("\n");

    const copyStatus = this.state.overviewCopyStatus;

    return (
      <section className="dashboardSurface dashboardSurface--metrics" aria-label="Ringkasan">
        <div className="overviewHeader" aria-label="Ringkasan cepat">
          <div className="overviewHeader__meta">
            <p className="overviewHeader__title">Ringkasan cepat</p>
            <p className="overviewHeader__sub">
              Terakhir diperbarui: <b>{lastUpdatedLabel}</b>
            </p>
          </div>

          <div className="overviewHeader__actions" aria-label="Aksi ringkasan">
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => this.setActiveTab("upload")}
            >
              Tambah bouquet
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => this.setActiveTab("edit")}
            >
              Buka editor
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => this.setActiveTab("hero")}
            >
              Atur hero
            </button>
            <button
              type="button"
              className="overviewActionBtn overviewActionBtn--primary"
              onClick={() => this.copyOverview(overviewText)}
            >
              Salin ringkasan
            </button>
          </div>
        </div>

        {copyStatus && (
          <div
            className="overviewToast"
            role={copyStatus === "failed" ? "alert" : "status"}
            aria-live="polite"
          >
            {copyStatus === "copied"
              ? "Ringkasan tersalin."
              : "Gagal menyalin ringkasan. Silakan coba lagi."}
          </div>
        )}

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            <div className="dashboardMetrics" aria-label="Metrik toko">
              <div className="metricCard">
                <p className="metricCard__label">Kunjungan (30 hari)</p>
                <p className="metricCard__value">
                  {insightsError ? visitorsCount : pageviews30d || visitorsCount}
                </p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Pengunjung unik (30 hari)</p>
                <p className="metricCard__value">
                  {insightsError
                    ? "—"
                    : uniqueVisitorsAvailable
                      ? uniqueVisitors30d
                      : "—"}
                </p>
                <p className="metricCard__note">
                  {uniqueVisitorsAvailable
                    ? "Berbasis visitorId anonim."
                    : "Mulai terekam setelah update."}
                </p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Koleksi</p>
                <p className="metricCard__value">{collectionsCount}</p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Total bouquet</p>
                <p className="metricCard__value">{bouquets.length}</p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Siap</p>
                <p className="metricCard__value">{readyCount}</p>
                <p className="metricCard__note">Unit siap: {totalReadyUnits}</p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Preorder</p>
                <p className="metricCard__value">{preorderCount}</p>
              </div>

              <div className="metricCard">
                <p className="metricCard__label">Featured</p>
                <p className="metricCard__value">{featuredCount}</p>
                <p className="metricCard__note">New edition: {newEditionCount}</p>
              </div>
            </div>
          </div>

          <aside className="overviewSide" aria-label="Insight">
            <div className="overviewCard" aria-label="Harga">
              <p className="overviewCard__title">Harga</p>
              <div className="overviewKeyValue">
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">Min</span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceMin) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">Rata-rata</span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceAvg) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">Max</span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceMax) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="overviewCard" aria-label="Kualitas data">
              <p className="overviewCard__title">Kualitas data</p>
              <ul className="overviewList" aria-label="Ringkasan kualitas data">
                <li className="overviewList__item">
                  <span>Tanpa gambar</span>
                  <b>{missingImageCount}</b>
                </li>
                <li className="overviewList__item">
                  <span>Tanpa koleksi</span>
                  <b>{missingCollectionCount}</b>
                </li>
                <li className="overviewList__item">
                  <span>Ready qty 0</span>
                  <b>{zeroQtyReadyCount}</b>
                </li>
              </ul>
            </div>

            <div className="overviewCard" aria-label="Top koleksi">
              <p className="overviewCard__title">Top koleksi</p>
              {topCollections.length === 0 ? (
                <p className="overviewCard__empty">Belum ada bouquet.</p>
              ) : (
                <ol className="overviewRank" aria-label="Daftar koleksi teratas">
                  {topCollections.map(([name, count]) => (
                    <li key={name} className="overviewRank__item">
                      <span className="overviewRank__name" title={name}>
                        {name}
                      </span>
                      <span className="overviewRank__count">{count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="overviewCard" aria-label="Pencarian teratas">
              <p className="overviewCard__title">Pencarian teratas</p>
              {insightsError ? (
                <p className="overviewCard__empty">Insight belum tersedia.</p>
              ) : topSearchTerms.length === 0 ? (
                <p className="overviewCard__empty">Belum ada data pencarian.</p>
              ) : (
                <ol className="overviewRank" aria-label="Daftar pencarian teratas">
                  {topSearchTerms.slice(0, 5).map((t) => (
                    <li key={t.term} className="overviewRank__item">
                      <span className="overviewRank__name" title={t.term}>
                        {t.term}
                      </span>
                      <span className="overviewRank__count">{t.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="overviewCard" aria-label="Bouquet terpopuler 30 hari">
              <p className="overviewCard__title">Top 5 bouquet (30 hari)</p>
              {insightsError ? (
                <p className="overviewCard__empty">Insight belum tersedia.</p>
              ) : topBouquetsDays.length === 0 ? (
                <p className="overviewCard__empty">Belum ada data kunjungan bouquet.</p>
              ) : (
                <ol className="overviewRank" aria-label="Daftar bouquet terpopuler 30 hari">
                  {topBouquetsDays.map((b) => (
                    <li key={b.bouquetId} className="overviewRank__item">
                      <span className="overviewRank__name" title={labelBouquet(b.bouquetId)}>
                        {labelBouquet(b.bouquetId)}
                      </span>
                      <span className="overviewRank__count">{b.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="overviewCard" aria-label="Bouquet terpopuler 7 hari">
              <p className="overviewCard__title">Top 3 bouquet (7 hari)</p>
              {insightsError ? (
                <p className="overviewCard__empty">Insight belum tersedia.</p>
              ) : topBouquets7d.length === 0 ? (
                <p className="overviewCard__empty">Belum ada data kunjungan bouquet.</p>
              ) : (
                <ol className="overviewRank" aria-label="Daftar bouquet terpopuler 7 hari">
                  {topBouquets7d.map((b) => (
                    <li key={b.bouquetId} className="overviewRank__item">
                      <span className="overviewRank__name" title={labelBouquet(b.bouquetId)}>
                        {labelBouquet(b.bouquetId)}
                      </span>
                      <span className="overviewRank__count">{b.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="overviewCard" aria-label="Jam kunjungan terpadat">
              <p className="overviewCard__title">Jam kunjungan terpadat (WIB)</p>
              {insightsError ? (
                <p className="overviewCard__empty">Insight belum tersedia.</p>
              ) : visitHours.length === 0 ? (
                <p className="overviewCard__empty">Belum ada data kunjungan.</p>
              ) : (
                <ol className="overviewRank" aria-label="Daftar jam kunjungan terpadat">
                  {visitHours.slice(0, 5).map((h) => (
                    <li key={h.hour} className="overviewRank__item">
                      <span className="overviewRank__name">{formatHour(h.hour)}</span>
                      <span className="overviewRank__count">{h.count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
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

      case "orders":
        return <OrdersSection bouquets={bouquets} />;

      case "upload":
        return <BouquetUploader onUpload={this.props.onUpload} />;

      case "edit":
        return (
          <BouquetEditorSection
            bouquets={bouquets}
            onSave={this.props.onUpdate}
            onDuplicate={this.props.onDuplicate}
            onDelete={this.props.onDelete}
            collections={collections}
          />
        );

      case "hero":
        // ✅ pass collections so the editor can link slides to existing collections
        return (
          <HeroSliderEditorSection
            collections={collections}
            onSaved={this.props.onHeroSaved}
          />
        );

      default:
        return null;
    }
  }

  render(): React.ReactNode {
    const { loading } = this.props;
    const errorMessage = (this.props.errorMessage ?? "").trim();

    const activeTab = this.state.activeTab;
    const tabMeta: Record<ActiveTab, { title: string; subtitle: string }> = {
      overview: {
        title: "Ringkasan",
        subtitle: "Metrik utama toko dan aktivitas secara singkat.",
      },
      orders: {
        title: "Record order",
        subtitle: "Catat pembeli, bouquet, dan waktu pengantaran.",
      },
      upload: {
        title: "Upload Bouquet",
        subtitle: "Tambahkan bouquet baru ke katalog dengan detail lengkap.",
      },
      edit: {
        title: "Edit Bouquet",
        subtitle: "Cari, filter, dan perbarui bouquet di database.",
      },
      hero: {
        title: "Hero Slider",
        subtitle: "Kelola slide hero di beranda dan tautan koleksi.",
      },
    };

    const { title, subtitle } = tabMeta[activeTab];
    const copyStatus = this.state.copyStatus;

    return (
      <div className="dashboardLayout">
        {this.renderSidebar()}

        <main id="dashboard-main" className="dashboardMain">
          <div className="dashboardContainer">
            <header className="dashboardHeader">
              <div className="dashboardHeader__top">
                <div className="dashboardHeader__text">
                  <p className="dashboardHeader__kicker">Dashboard Admin</p>
                  <h1 className="dashboardHeader__title">{title}</h1>
                  <p className="dashboardHeader__crumbs" aria-label="Lokasi halaman">
                    <span className="dashboardHeader__crumb">Dashboard</span>
                    <span className="dashboardHeader__crumbSep" aria-hidden="true">
                      /
                    </span>
                    <span className="dashboardHeader__crumb is-current" aria-current="page">
                      {title}
                    </span>
                  </p>
                </div>

                <div className="dashboardHeader__actions" aria-label="Aksi cepat">
                  <button
                    type="button"
                    className="dashboardActionBtn"
                    onClick={this.copyCurrentLink}
                    disabled={loading}
                  >
                    Salin link tab
                  </button>
                  <button
                    type="button"
                    className="dashboardActionBtn dashboardActionBtn--primary"
                    onClick={this.reloadDashboard}
                  >
                    Muat ulang
                  </button>
                </div>
              </div>

              <p className="dashboardHeader__subtitle">{subtitle}</p>
              {copyStatus && (
                <p
                  className="dashboardHeader__hint"
                  role={copyStatus === "failed" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {copyStatus === "copied"
                    ? "Link tab tersalin."
                    : "Gagal menyalin link. Silakan coba lagi."}
                </p>
              )}
            </header>

            {loading && (
              <div className="dashboardState" aria-live="polite">
                Memuat data dashboard...
              </div>
            )}

            {!loading && errorMessage && (
              <div
                className="dashboardState dashboardState--error"
                role="alert"
              >
                <p className="dashboardState__title">
                  Failed to load dashboard data
                </p>
                <p className="dashboardState__text">{errorMessage}</p>
              </div>
            )}

            {!loading && this.renderMainContent()}
          </div>
        </main>
      </div>
    );
  }
}

export default DashboardView;
