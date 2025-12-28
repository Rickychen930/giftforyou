import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import "../styles/DashboardPage.css";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";
import { getPerformanceMetrics, getPerformanceScore, formatBytes, formatMs, observeCoreWebVitals } from "../utils/performance-monitor";
import { analyzeSeo } from "../utils/seo-analyzer";
import { savePerformanceHistory, saveSeoHistory } from "../utils/analytics-storage";
import { checkPerformanceAlerts, checkSeoAlerts, checkTrendAlerts, getUnacknowledgedAlerts } from "../utils/analytics-alerts";
import { analyzePerformanceTrends, analyzeSeoTrends } from "../utils/trends-analyzer";
import { getHistoricalData } from "../utils/analytics-storage";
import { getBenchmarks } from "../utils/benchmarks";
import { exportAnalytics } from "../utils/analytics-export";
import { getGAConfig, initGoogleAnalytics, sendPerformanceToGA, sendSEOToGA } from "../utils/google-analytics";
import { getActiveABTests, assignToVariant, trackABTestVisit } from "../utils/ab-testing";

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

  salesMetrics?: {
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    thisMonthOrders: number;
    thisMonthRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    unpaidOrders: number;
    paidOrders: number;
    topSellingBouquets: Array<{ bouquetId: string; bouquetName: string; orderCount: number; revenue: number }>;
    averageOrderValue: number;
    totalCustomers: number;
  };
  salesError?: string;

  loading: boolean;
  errorMessage?: string;

  onUpdate: (formData: FormData) => Promise<boolean>;
  onUpload: (formData: FormData) => Promise<boolean>;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
  onHeroSaved?: () => void | Promise<void>;
  onLogout: () => void;
  onUpdateCollectionName?: (collectionId: string, newName: string) => Promise<boolean>;
  onMoveBouquet?: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onDeleteCollection?: (collectionId: string) => Promise<boolean>;
}

type ActiveTab = "overview" | "orders" | "upload" | "edit" | "hero";

const DASHBOARD_TAB_STORAGE_KEY = "dashboard.activeTab";

const isActiveTab = (v: string): v is ActiveTab =>
  v === "overview" ||
  v === "orders" ||
  v === "upload" ||
  v === "edit" ||
  v === "hero";

interface PerformanceState {
  metrics: ReturnType<typeof getPerformanceMetrics>;
  score: ReturnType<typeof getPerformanceScore>;
  loading: boolean;
  trends?: ReturnType<typeof analyzePerformanceTrends>;
  benchmarks?: ReturnType<typeof getBenchmarks>;
}

interface SeoState {
  analysis: ReturnType<typeof analyzeSeo>;
  loading: boolean;
  trends?: ReturnType<typeof analyzeSeoTrends>;
  benchmarks?: ReturnType<typeof getBenchmarks>;
}

interface AlertsState {
  alerts: ReturnType<typeof getUnacknowledgedAlerts>;
  showAlerts: boolean;
}

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
  performance: PerformanceState;
  seo: SeoState;
  alerts: AlertsState;
  showTrends: boolean;
  showBenchmarks: boolean;
}

class DashboardView extends Component<Props, State> {
  private performanceCleanup: (() => void) | null = null;

  state: State = {
    activeTab: "overview",
    copyStatus: "",
    overviewCopyStatus: "",
    performance: {
      metrics: {},
      score: { score: 0, grade: "poor", details: {} },
      loading: true,
    },
    seo: {
      analysis: { score: 0, grade: "poor", checks: [], recommendations: [] },
      loading: true,
    },
    alerts: {
      alerts: [],
      showAlerts: false,
    },
    showTrends: false,
    showBenchmarks: false,
  };

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
    this.loadPerformanceMetrics();
    this.loadSeoAnalysis();
    this.loadAlerts();
    this.loadTrends();
    this.loadBenchmarks();
    this.initGoogleAnalytics();
    this.initABTests();

    window.addEventListener("hashchange", this.handleHashChange);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount(): void {
    window.removeEventListener("hashchange", this.handleHashChange);
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.performanceCleanup) {
      this.performanceCleanup();
    }
  }

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
    
    this.setState({
      performance: {
        metrics,
        score,
        loading: false,
      },
    });

    // Observe Core Web Vitals
    this.performanceCleanup = observeCoreWebVitals((name, value) => {
      this.setState((prevState) => {
        const newMetrics = { ...prevState.performance.metrics, [name]: value };
        const newScore = getPerformanceScore(newMetrics);
        
        // Save to history
        savePerformanceHistory(newMetrics, newScore.score, newScore.grade);
        
        // Check alerts
        checkPerformanceAlerts(newMetrics, newScore.score);
        
        return {
          performance: {
            metrics: newMetrics,
            score: newScore,
            loading: false,
          },
        };
      });
    });
  };

  private loadSeoAnalysis = (): void => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const analysis = analyzeSeo();
      
      // Save to history
      saveSeoHistory(analysis);
      
      // Check alerts
      checkSeoAlerts(analysis);
      
      // Send to Google Analytics
      const gaConfig = getGAConfig();
      if (gaConfig.enabled) {
        sendSEOToGA(analysis.score, analysis.checks);
      }
      
      this.setState({
        seo: {
          analysis,
          loading: false,
        },
      });
    }, 100);
  };

  private loadAlerts = (): void => {
    // Check trend alerts
    checkTrendAlerts(7);
    
    // Get unacknowledged alerts
    const alerts = getUnacknowledgedAlerts();
    this.setState({
      alerts: {
        alerts,
        showAlerts: alerts.length > 0,
      },
    });
  };

  private loadTrends = (): void => {
    const history = getHistoricalData();
    
    // Analyze performance trends
    const perfTrends = analyzePerformanceTrends(history.performance, 30);
    if (perfTrends) {
      this.setState((prevState) => ({
        performance: {
          ...prevState.performance,
          trends: perfTrends,
        },
      }));
    }
    
    // Analyze SEO trends
    const seoTrends = analyzeSeoTrends(history.seo, 30);
    if (seoTrends) {
      this.setState((prevState) => ({
        seo: {
          ...prevState.seo,
          trends: seoTrends,
        },
      }));
    }
  };

  private loadBenchmarks = (): void => {
    const perfBenchmarks = getBenchmarks("performance");
    const seoBenchmarks = getBenchmarks("seo");
    
    this.setState((prevState) => ({
      performance: {
        ...prevState.performance,
        benchmarks: perfBenchmarks,
      },
      seo: {
        ...prevState.seo,
        benchmarks: seoBenchmarks,
      },
    }));
  };

  private initGoogleAnalytics = (): void => {
    const config = getGAConfig();
    if (config.enabled && config.measurementId) {
      initGoogleAnalytics(config.measurementId);
    }
  };

  private initABTests = (): void => {
    const activeTests = getActiveABTests();
    activeTests.forEach((test) => {
      const variant = assignToVariant(test.id);
      trackABTestVisit(test.id, variant);
    });
  };

  private handleExport = (format: "csv" | "json" | "pdf"): void => {
    exportAnalytics({
      format,
      includePerformance: true,
      includeSeo: true,
    });
  };

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
      description: "Dashboard admin Giftforyou.idn - Kelola bouquet, pesanan, koleksi, dan analitik performa website florist terbaik di Cirebon, Jawa Barat.",
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
    const salesMetrics = this.props.salesMetrics;
    const salesError = this.props.salesError;

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

    // Store overview text for keyboard shortcut access
    (this as any)._overviewText = overviewText;

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
              aria-label="Tambah bouquet baru"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Tambah bouquet</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => this.setActiveTab("edit")}
              aria-label="Buka editor bouquet"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Buka editor</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => this.setActiveTab("hero")}
              aria-label="Atur hero slider"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Atur hero</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn overviewActionBtn--primary"
              onClick={() => this.copyOverview(overviewText)}
              aria-label="Salin ringkasan ke clipboard"
              title="Ctrl/Cmd + C untuk copy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Salin ringkasan</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={this.reloadDashboard}
              aria-label="Muat ulang dashboard"
              title="Refresh data (Ctrl/Cmd + R)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16H3v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {copyStatus && (
          <div
            className="overviewToast"
            role={copyStatus === "failed" ? "alert" : "status"}
            aria-live="polite"
            aria-atomic="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {copyStatus === "copied" ? (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
            <span>
              {copyStatus === "copied"
                ? "Ringkasan tersalin."
                : "Gagal menyalin ringkasan. Silakan coba lagi."}
            </span>
          </div>
        )}

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            <div className="dashboardMetrics" aria-label="Metrik toko">
              <div className="metricCard metricCard--primary">
                <p className="metricCard__label">Kunjungan (30 hari)</p>
                <p className="metricCard__value">
                  {insightsError ? visitorsCount : pageviews30d || visitorsCount}
                </p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                    <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--info">
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
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--success">
                <p className="metricCard__label">Koleksi</p>
                <p className="metricCard__value">{collectionsCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--primary">
                <p className="metricCard__label">Total bouquet</p>
                <p className="metricCard__value">{bouquets.length}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--success">
                <p className="metricCard__label">Siap</p>
                <p className="metricCard__value">{readyCount}</p>
                <p className="metricCard__note">Unit siap: {totalReadyUnits}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--warning">
                <p className="metricCard__label">Preorder</p>
                <p className="metricCard__value">{preorderCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--featured">
                <p className="metricCard__label">Featured</p>
                <p className="metricCard__value">{featuredCount}</p>
                <p className="metricCard__note">New edition: {newEditionCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <aside className="overviewSide" aria-label="Insight">
            <div className="overviewCard" aria-label="Harga">
              <p className="overviewCard__title">Harga</p>
              <div className="overviewKeyValue">
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Min
                  </span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceMin) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Rata-rata
                  </span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceAvg) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Max
                  </span>
                  <span className="overviewKeyValue__val">
                    {priced.length ? formatIDR(priceMax) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sales Metrics Section - Only show if available */}
            {salesError && salesError.includes("404") ? null : salesError ? (
              <div className="overviewCard overviewCard--error" aria-label="Sales metrics">
                <p className="overviewCard__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Penjualan
                </p>
                <p className="overviewCard__empty" style={{ color: "var(--error-text)", fontSize: "0.9rem", textAlign: "left" }}>
                  {salesError}
                </p>
              </div>
            ) : salesMetrics ? (
              <>
                <div className="overviewCard" aria-label="Revenue">
                  <p className="overviewCard__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Revenue
                  </p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.totalRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Hari ini</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.todayRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Bulan ini</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.thisMonthRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Rata-rata order</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.averageOrderValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="overviewCard" aria-label="Orders">
                  <p className="overviewCard__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Orders
                  </p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total</span>
                      <span className="overviewKeyValue__val">{salesMetrics.totalOrders}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Hari ini</span>
                      <span className="overviewKeyValue__val">{salesMetrics.todayOrders}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Bulan ini</span>
                      <span className="overviewKeyValue__val">{salesMetrics.thisMonthOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="overviewCard" aria-label="Order Status">
                  <p className="overviewCard__title">Status Order</p>
                  <ul className="overviewList">
                    <li className="overviewList__item">
                      <span>Pending</span>
                      <b>{salesMetrics.pendingOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Processing</span>
                      <b>{salesMetrics.processingOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Completed</span>
                      <b>{salesMetrics.completedOrders}</b>
                    </li>
                  </ul>
                </div>

                <div className="overviewCard" aria-label="Payment Status">
                  <p className="overviewCard__title">Status Pembayaran</p>
                  <ul className="overviewList">
                    <li className="overviewList__item">
                      <span>Belum Bayar</span>
                      <b>{salesMetrics.unpaidOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Sudah Bayar</span>
                      <b>{salesMetrics.paidOrders}</b>
                    </li>
                  </ul>
                </div>

                <div className="overviewCard" aria-label="Top Selling">
                  <p className="overviewCard__title">Top 5 Produk Terlaris</p>
                  {salesMetrics.topSellingBouquets.length === 0 ? (
                    <p className="overviewCard__empty">Belum ada data penjualan.</p>
                  ) : (
                    <ol className="overviewRank">
                      {salesMetrics.topSellingBouquets.map((item) => (
                        <li key={item.bouquetId} className="overviewRank__item">
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
                            <span className="overviewRank__name" title={item.bouquetName}>
                              {item.bouquetName}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", fontWeight: 700 }}>
                              {formatIDR(item.revenue)}
                            </span>
                          </div>
                          <span className="overviewRank__count">{item.orderCount}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="overviewCard" aria-label="Customers">
                  <p className="overviewCard__title">Pelanggan</p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total Pelanggan</span>
                      <span className="overviewKeyValue__val">{salesMetrics.totalCustomers}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            <div className="overviewCard" aria-label="Kualitas data">
              <p className="overviewCard__title">Kualitas data</p>
              <ul className="overviewList" aria-label="Ringkasan kualitas data">
                <li className={`overviewList__item ${missingImageCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Tanpa gambar
                  </span>
                  <b>{missingImageCount}</b>
                </li>
                <li className={`overviewList__item ${missingCollectionCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Tanpa koleksi
                  </span>
                  <b>{missingCollectionCount}</b>
                </li>
                <li className={`overviewList__item ${zeroQtyReadyCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Ready qty 0
                  </span>
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

            {/* Performance Metrics Section */}
            <div className="overviewCard overviewCard--performance" aria-label="Performance metrics">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Performance
              </p>
              {this.state.performance.loading ? (
                <p className="overviewCard__empty">Memuat metrik performa...</p>
              ) : (
                <>
                  <div className="overviewPerformanceScore">
                    <div className={`overviewPerformanceScore__badge overviewPerformanceScore__badge--${this.state.performance.score.grade}`}>
                      <span className="overviewPerformanceScore__value">{this.state.performance.score.score}</span>
                      <span className="overviewPerformanceScore__label">/ 100</span>
                    </div>
                    <div className="overviewPerformanceScore__grade">
                      {this.state.performance.score.grade === "excellent" && "Excellent"}
                      {this.state.performance.score.grade === "good" && "Good"}
                      {this.state.performance.score.grade === "needs-improvement" && "Needs Improvement"}
                      {this.state.performance.score.grade === "poor" && "Poor"}
                    </div>
                  </div>
                  
                  <div className="overviewKeyValue" style={{ marginTop: "1rem" }}>
                    {this.state.performance.metrics.fcp !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">First Contentful Paint</span>
                        <span className="overviewKeyValue__val">{formatMs(this.state.performance.metrics.fcp)}</span>
                      </div>
                    )}
                    {this.state.performance.metrics.lcp !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Largest Contentful Paint</span>
                        <span className={`overviewKeyValue__val ${this.state.performance.score.details.lcp?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {formatMs(this.state.performance.metrics.lcp)}
                        </span>
                      </div>
                    )}
                    {this.state.performance.metrics.fid !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">First Input Delay</span>
                        <span className={`overviewKeyValue__val ${this.state.performance.score.details.fid?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {formatMs(this.state.performance.metrics.fid)}
                        </span>
                      </div>
                    )}
                    {this.state.performance.metrics.cls !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Cumulative Layout Shift</span>
                        <span className={`overviewKeyValue__val ${this.state.performance.score.details.cls?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {this.state.performance.metrics.cls.toFixed(3)}
                        </span>
                      </div>
                    )}
                    {this.state.performance.metrics.ttfb !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Time to First Byte</span>
                        <span className="overviewKeyValue__val">{formatMs(this.state.performance.metrics.ttfb)}</span>
                      </div>
                    )}
                    {this.state.performance.metrics.loadComplete !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Load Complete</span>
                        <span className="overviewKeyValue__val">{formatMs(this.state.performance.metrics.loadComplete)}</span>
                      </div>
                    )}
                    {this.state.performance.metrics.totalSize !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Total Resources</span>
                        <span className="overviewKeyValue__val">
                          {this.state.performance.metrics.totalResources} ({formatBytes(this.state.performance.metrics.totalSize)})
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* SEO Analysis Section */}
            <div className="overviewCard overviewCard--seo" aria-label="SEO analysis">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                SEO Analysis
              </p>
              {this.state.seo.loading ? (
                <p className="overviewCard__empty">Menganalisis SEO...</p>
              ) : (
                <>
                  <div className="overviewSeoScore">
                    <div className={`overviewSeoScore__badge overviewSeoScore__badge--${this.state.seo.analysis.grade}`}>
                      <span className="overviewSeoScore__value">{this.state.seo.analysis.score}</span>
                      <span className="overviewSeoScore__label">/ 100</span>
                    </div>
                    <div className="overviewSeoScore__grade">
                      {this.state.seo.analysis.grade === "excellent" && "Excellent"}
                      {this.state.seo.analysis.grade === "good" && "Good"}
                      {this.state.seo.analysis.grade === "needs-improvement" && "Needs Improvement"}
                      {this.state.seo.analysis.grade === "poor" && "Poor"}
                    </div>
                  </div>

                  <div className="overviewSeoChecks" style={{ marginTop: "1rem" }}>
                    {this.state.seo.analysis.checks.slice(0, 6).map((check, idx) => (
                      <div key={idx} className={`overviewSeoCheck overviewSeoCheck--${check.status}`}>
                        <span className="overviewSeoCheck__icon">
                          {check.status === "pass" && "✓"}
                          {check.status === "warning" && "⚠"}
                          {check.status === "fail" && "✗"}
                        </span>
                        <div className="overviewSeoCheck__content">
                          <span className="overviewSeoCheck__name">{check.name}</span>
                          <span className="overviewSeoCheck__message">{check.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {this.state.seo.analysis.recommendations.length > 0 && (
                    <div className="overviewSeoRecommendations" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <p style={{ fontWeight: 800, marginBottom: "0.5rem", fontSize: "0.9rem" }}>Rekomendasi:</p>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        {this.state.seo.analysis.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} style={{ marginBottom: "0.4rem" }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SEO Trends Section */}
                  {this.state.seo.trends && (
                    <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <p style={{ fontWeight: 800, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Trends (30 days):</p>
                      {this.state.seo.trends.score && (
                        <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: 700 }}>Score: </span>
                          <span className={this.state.seo.trends.score.trend === "up" ? "overviewKeyValue__val--good" : ""}>
                            {this.state.seo.trends.score.changePercent.toFixed(1)}% {this.state.seo.trends.score.trend === "up" ? "↑" : this.state.seo.trends.score.trend === "down" ? "↓" : "→"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Alerts Section */}
            {this.state.alerts.showAlerts && this.state.alerts.alerts.length > 0 && (
              <div className="overviewCard overviewCard--alerts" aria-label="Alerts">
                <p className="overviewCard__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Alerts ({this.state.alerts.alerts.length})
                </p>
                <div className="overviewAlerts" style={{ marginTop: "1rem" }}>
                  {this.state.alerts.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`overviewAlert overviewAlert--${alert.severity}`}>
                      <div className="overviewAlert__content">
                        <span className="overviewAlert__title">{alert.title}</span>
                        <span className="overviewAlert__message">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                  {this.state.alerts.alerts.length > 5 && (
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-550)", marginTop: "0.5rem" }}>
                      +{this.state.alerts.alerts.length - 5} more alerts
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Export Section */}
            <div className="overviewCard" aria-label="Export analytics">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export Analytics
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => this.handleExport("csv")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => this.handleExport("json")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => this.handleExport("pdf")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export PDF
                </button>
              </div>
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
            onUpdateCollection={this.props.onUpdateCollectionName}
            onMoveBouquet={this.props.onMoveBouquet}
            onDeleteCollection={this.props.onDeleteCollection}
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
