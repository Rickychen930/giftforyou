/**
 * Industry Benchmarks
 * Performance and SEO benchmarks for comparison
 */

export interface PerformanceBenchmark {
  metric: string;
  excellent: number;
  good: number;
  needsImprovement: number;
  poor: number;
  unit: string;
  description: string;
}

export interface SeoBenchmark {
  metric: string;
  excellent: number;
  good: number;
  needsImprovement: number;
  poor: number;
  description: string;
}

/**
 * Core Web Vitals Benchmarks (Google)
 */
export const PERFORMANCE_BENCHMARKS: PerformanceBenchmark[] = [
  {
    metric: "LCP",
    excellent: 2500,
    good: 4000,
    needsImprovement: 5000,
    poor: Infinity,
    unit: "ms",
    description: "Largest Contentful Paint - Time to render the main content",
  },
  {
    metric: "FID",
    excellent: 100,
    good: 300,
    needsImprovement: 500,
    poor: Infinity,
    unit: "ms",
    description: "First Input Delay - Time to first user interaction",
  },
  {
    metric: "CLS",
    excellent: 0.1,
    good: 0.25,
    needsImprovement: 0.5,
    poor: Infinity,
    unit: "score",
    description: "Cumulative Layout Shift - Visual stability",
  },
  {
    metric: "FCP",
    excellent: 1800,
    good: 3000,
    needsImprovement: 4000,
    poor: Infinity,
    unit: "ms",
    description: "First Contentful Paint - First content rendered",
  },
  {
    metric: "TTFB",
    excellent: 800,
    good: 1800,
    needsImprovement: 3000,
    poor: Infinity,
    unit: "ms",
    description: "Time to First Byte - Server response time",
  },
];

/**
 * SEO Benchmarks
 */
export const SEO_BENCHMARKS: SeoBenchmark[] = [
  {
    metric: "Score",
    excellent: 90,
    good: 75,
    needsImprovement: 60,
    poor: 0,
    description: "Overall SEO score",
  },
  {
    metric: "Title Length",
    excellent: 50,
    good: 45,
    needsImprovement: 40,
    poor: 0,
    description: "Optimal title tag length (characters)",
  },
  {
    metric: "Description Length",
    excellent: 155,
    good: 150,
    needsImprovement: 140,
    poor: 0,
    description: "Optimal meta description length (characters)",
  },
];

/**
 * Get benchmark grade for a metric value
 */
export function getBenchmarkGrade(
  metric: string,
  value: number,
  type: "performance" | "seo" = "performance"
): "excellent" | "good" | "needs-improvement" | "poor" {
  const benchmarks = type === "performance" ? PERFORMANCE_BENCHMARKS : SEO_BENCHMARKS;
  const benchmark = benchmarks.find((b) => b.metric === metric);
  
  if (!benchmark) return "poor";

  // For performance metrics, lower is better
  // For SEO metrics, higher is better
  if (type === "performance") {
    if (value <= benchmark.excellent) return "excellent";
    if (value <= benchmark.good) return "good";
    if (value <= benchmark.needsImprovement) return "needs-improvement";
    return "poor";
  } else {
    if (value >= benchmark.excellent) return "excellent";
    if (value >= benchmark.good) return "good";
    if (value >= benchmark.needsImprovement) return "needs-improvement";
    return "poor";
  }
}

/**
 * Compare metric with industry benchmark
 */
export function compareWithBenchmark(
  metric: string,
  value: number,
  type: "performance" | "seo" = "performance"
): {
  grade: "excellent" | "good" | "needs-improvement" | "poor";
  benchmark: PerformanceBenchmark | SeoBenchmark | undefined;
  difference?: number;
  percentage?: number;
} {
  const benchmarks = type === "performance" ? PERFORMANCE_BENCHMARKS : SEO_BENCHMARKS;
  const benchmark = benchmarks.find((b) => b.metric === metric);
  
  if (!benchmark) {
    return {
      grade: "poor",
      benchmark: undefined,
    };
  }

  const grade = getBenchmarkGrade(metric, value, type);
  
  let difference: number | undefined;
  let percentage: number | undefined;

  if (type === "performance") {
    // Compare with "good" threshold
    difference = value - benchmark.good;
    percentage = benchmark.good > 0 ? (difference / benchmark.good) * 100 : 0;
  } else {
    // Compare with "good" threshold
    difference = value - benchmark.good;
    percentage = benchmark.good > 0 ? (difference / benchmark.good) * 100 : 0;
  }

  return {
    grade,
    benchmark,
    difference,
    percentage,
  };
}

/**
 * Get all benchmarks for a type
 */
export function getBenchmarks(
  type: "performance" | "seo" = "performance"
): (PerformanceBenchmark | SeoBenchmark)[] {
  return type === "performance" ? PERFORMANCE_BENCHMARKS : SEO_BENCHMARKS;
}

