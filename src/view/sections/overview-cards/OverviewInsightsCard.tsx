/**
 * Overview Insights Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles insights cards rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { DASHBOARD_LIMITS } from "../../dashboard-page.constants-extended";
import type { OverviewMetrics } from "../../../view/dashboard-page.types";

interface OverviewInsightsCardProps {
  overviewMetrics: OverviewMetrics;
  insightsError?: string;
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
}

/**
 * Overview Insights Card Component
 * Handles insights cards rendering
 */
class OverviewInsightsCard extends Component<OverviewInsightsCardProps> {
  render(): React.ReactNode {
    const { overviewMetrics, insightsError, insights } = this.props;
    const {
      topCollections,
      topSearchTerms,
      topBouquetsDays,
      visitHours,
      formatHour,
      labelBouquet,
    } = overviewMetrics;

    const topBouquets7d = (insights?.topBouquets7d ?? []).slice(0, DASHBOARD_LIMITS.TOP_BOUQUETS_7D);

    return (
      <>
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
              {topSearchTerms.slice(0, DASHBOARD_LIMITS.TOP_SEARCH_TERMS).map((t) => (
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
          <p className="overviewCard__title">Top {DASHBOARD_LIMITS.TOP_BOUQUETS_30D} bouquet (30 hari)</p>
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
          <p className="overviewCard__title">Top {DASHBOARD_LIMITS.TOP_BOUQUETS_7D} bouquet (7 hari)</p>
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
              {visitHours.slice(0, DASHBOARD_LIMITS.TOP_VISIT_HOURS).map((h) => (
                <li key={h.hour} className="overviewRank__item">
                  <span className="overviewRank__name">{formatHour(h.hour)}</span>
                  <span className="overviewRank__count">{h.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </>
    );
  }
}

export default OverviewInsightsCard;

