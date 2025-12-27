/**
 * Analytics Export Utility
 * Export analytics data to CSV, JSON, or PDF
 */

import type { HistoricalPerformance, HistoricalSeo } from "./analytics-storage";
import { getHistoricalData } from "./analytics-storage";
import { formatMs } from "./performance-monitor";

export interface ExportOptions {
  format: "csv" | "json" | "pdf";
  startDate?: number;
  endDate?: number;
  includePerformance?: boolean;
  includeSeo?: boolean;
  includeTrends?: boolean;
}

/**
 * Export to CSV
 */
export function exportToCSV(options: ExportOptions): string {
  const data = getHistoricalData();
  const lines: string[] = [];

  if (options.includePerformance !== false) {
    lines.push("Performance Metrics");
    lines.push("Timestamp,URL,Score,Grade,LCP (ms),FID (ms),CLS,FCP (ms),TTFB (ms),Total Resources,Total Size (bytes)");
    
    const performance = filterByDateRange(data.performance, options.startDate, options.endDate);
    performance.forEach((p) => {
      const row = [
        new Date(p.timestamp).toISOString(),
        p.url,
        p.score.toString(),
        p.grade,
        (p.metrics.lcp ?? "").toString(),
        (p.metrics.fid ?? "").toString(),
        (p.metrics.cls ?? "").toString(),
        (p.metrics.fcp ?? "").toString(),
        (p.metrics.ttfb ?? "").toString(),
        (p.metrics.totalResources ?? "").toString(),
        (p.metrics.totalSize ?? "").toString(),
      ];
      lines.push(row.join(","));
    });
    lines.push("");
  }

  if (options.includeSeo !== false) {
    lines.push("SEO Analysis");
    lines.push("Timestamp,URL,Score,Grade,Checks");
    
    const seo = filterByDateRange(data.seo, options.startDate, options.endDate);
    seo.forEach((s) => {
      const checks = s.analysis.checks.map((c) => `${c.name}:${c.status}`).join(";");
      const row = [
        new Date(s.timestamp).toISOString(),
        s.url,
        s.analysis.score.toString(),
        s.analysis.grade,
        checks,
      ];
      lines.push(row.join(","));
    });
  }

  return lines.join("\n");
}

/**
 * Export to JSON
 */
export function exportToJSON(options: ExportOptions): string {
  const data = getHistoricalData();
  const exportData: {
    performance?: HistoricalPerformance[];
    seo?: HistoricalSeo[];
    metadata: {
      exportedAt: string;
      startDate?: string;
      endDate?: string;
    };
  } = {
    metadata: {
      exportedAt: new Date().toISOString(),
      startDate: options.startDate ? new Date(options.startDate).toISOString() : undefined,
      endDate: options.endDate ? new Date(options.endDate).toISOString() : undefined,
    },
  };

  if (options.includePerformance !== false) {
    exportData.performance = filterByDateRange(
      data.performance,
      options.startDate,
      options.endDate
    );
  }

  if (options.includeSeo !== false) {
    exportData.seo = filterByDateRange(data.seo, options.startDate, options.endDate);
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export to PDF (generates HTML that can be printed as PDF)
 */
export function exportToPDF(options: ExportOptions): string {
  const data = getHistoricalData();
  const performance = filterByDateRange(data.performance, options.startDate, options.endDate);
  const seo = filterByDateRange(data.seo, options.startDate, options.endDate);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analytics Report - ${new Date().toLocaleDateString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 40px;
      color: #333;
    }
    h1 { color: #d48c9c; }
    h2 { color: #803d4d; margin-top: 30px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f8f4f0;
      font-weight: 700;
    }
    .metric { font-weight: 700; }
    .excellent { color: #10b981; }
    .good { color: #3b82f6; }
    .needs-improvement { color: #f59e0b; }
    .poor { color: #ef4444; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Analytics Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  ${options.startDate ? `<p><strong>Start Date:</strong> ${new Date(options.startDate).toLocaleDateString()}</p>` : ""}
  ${options.endDate ? `<p><strong>End Date:</strong> ${new Date(options.endDate).toLocaleDateString()}</p>` : ""}

  ${options.includePerformance !== false ? `
  <h2>Performance Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Grade</th>
        <th>LCP</th>
        <th>FID</th>
        <th>CLS</th>
        <th>FCP</th>
        <th>TTFB</th>
      </tr>
    </thead>
    <tbody>
      ${performance.map((p) => `
        <tr>
          <td>${new Date(p.timestamp).toLocaleDateString()}</td>
          <td class="metric">${p.score}</td>
          <td class="${p.grade}">${p.grade}</td>
          <td>${p.metrics.lcp ? formatMs(p.metrics.lcp) : "—"}</td>
          <td>${p.metrics.fid ? formatMs(p.metrics.fid) : "—"}</td>
          <td>${p.metrics.cls !== undefined ? p.metrics.cls.toFixed(3) : "—"}</td>
          <td>${p.metrics.fcp ? formatMs(p.metrics.fcp) : "—"}</td>
          <td>${p.metrics.ttfb ? formatMs(p.metrics.ttfb) : "—"}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  ` : ""}

  ${options.includeSeo !== false ? `
  <h2>SEO Analysis</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Score</th>
        <th>Grade</th>
        <th>Checks Passed</th>
        <th>Warnings</th>
        <th>Failures</th>
      </tr>
    </thead>
    <tbody>
      ${seo.map((s) => {
        const passed = s.analysis.checks.filter((c) => c.status === "pass").length;
        const warnings = s.analysis.checks.filter((c) => c.status === "warning").length;
        const failures = s.analysis.checks.filter((c) => c.status === "fail").length;
        return `
        <tr>
          <td>${new Date(s.timestamp).toLocaleDateString()}</td>
          <td class="metric">${s.analysis.score}</td>
          <td class="${s.analysis.grade}">${s.analysis.grade}</td>
          <td>${passed}</td>
          <td>${warnings}</td>
          <td>${failures}</td>
        </tr>
      `;
      }).join("")}
    </tbody>
  </table>
  ` : ""}

  <div class="no-print">
    <p><em>Use your browser's print function (Ctrl+P / Cmd+P) and select "Save as PDF" to generate a PDF file.</em></p>
  </div>
</body>
</html>
  `.trim();

  return html;
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export analytics data
 */
export function exportAnalytics(options: ExportOptions): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (options.format) {
    case "csv":
      content = exportToCSV(options);
      filename = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
      break;
    case "json":
      content = exportToJSON(options);
      filename = `analytics-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
      break;
    case "pdf":
      content = exportToPDF(options);
      filename = `analytics-${new Date().toISOString().split("T")[0]}.html`;
      mimeType = "text/html";
      // Open in new window for printing
      const win = window.open();
      if (win) {
        win.document.write(content);
        win.document.close();
      }
      return;
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }

  downloadFile(content, filename, mimeType);
}

/**
 * Filter data by date range
 */
function filterByDateRange<T extends { timestamp: number }>(
  data: T[],
  startDate?: number,
  endDate?: number
): T[] {
  let filtered = data;

  if (startDate) {
    filtered = filtered.filter((d) => d.timestamp >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((d) => d.timestamp <= endDate);
  }

  return filtered.sort((a, b) => a.timestamp - b.timestamp);
}

