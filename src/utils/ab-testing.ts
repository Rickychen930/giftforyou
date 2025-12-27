/**
 * A/B Testing Framework
 * Test SEO improvements and track results
 */

export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: "seo" | "performance" | "conversion";
  variants: ABTestVariant[];
  startDate: number;
  endDate?: number;
  status: "draft" | "running" | "paused" | "completed";
  trafficSplit: number; // Percentage for variant A (0-100)
  metrics: {
    variantA: ABTestMetrics;
    variantB: ABTestMetrics;
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
}

export interface ABTestMetrics {
  visitors: number;
  conversions: number;
  conversionRate: number;
  avgScore?: number;
  avgLCP?: number;
  avgFID?: number;
  avgCLS?: number;
}

const TESTS_STORAGE_KEY = "analytics.abTests";
const ASSIGNMENT_STORAGE_KEY = "analytics.abAssignments";

/**
 * Get all A/B tests
 */
export function getABTests(): ABTest[] {
  try {
    const stored = localStorage.getItem(TESTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ABTest[];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Save A/B tests
 */
export function saveABTests(tests: ABTest[]): void {
  try {
    localStorage.setItem(TESTS_STORAGE_KEY, JSON.stringify(tests));
  } catch (error) {
    console.error("Failed to save A/B tests:", error);
  }
}

/**
 * Create new A/B test
 */
export function createABTest(test: Omit<ABTest, "metrics" | "status">): ABTest {
  const newTest: ABTest = {
    ...test,
    status: "draft",
    metrics: {
      variantA: {
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
      },
      variantB: {
        visitors: 0,
        conversions: 0,
        conversionRate: 0,
      },
    },
  };

  const tests = getABTests();
  tests.push(newTest);
  saveABTests(tests);

  return newTest;
}

/**
 * Get active A/B tests
 */
export function getActiveABTests(): ABTest[] {
  return getABTests().filter(
    (t) => t.status === "running" && (!t.endDate || t.endDate > Date.now())
  );
}

/**
 * Assign user to variant
 */
export function assignToVariant(testId: string): "A" | "B" {
  try {
    const assignments = getAssignments();
    const existing = assignments[testId];
    if (existing) {
      return existing;
    }

    const tests = getABTests();
    const test = tests.find((t) => t.id === testId);
    if (!test) return "A";

    // Use consistent assignment based on user ID or random
    const userId = getUserId();
    const hash = hashString(`${testId}-${userId}`);
    const split = test.trafficSplit || 50;
    const assigned = hash % 100 < split ? "A" : "B";

    assignments[testId] = assigned;
    saveAssignments(assignments);

    return assigned;
  } catch {
    return "A";
  }
}

/**
 * Track A/B test visit
 */
export function trackABTestVisit(testId: string, variant: "A" | "B"): void {
  const tests = getABTests();
  const test = tests.find((t) => t.id === testId);
  if (!test) return;

  if (variant === "A") {
    test.metrics.variantA.visitors++;
  } else {
    test.metrics.variantB.visitors++;
  }

  saveABTests(tests);
}

/**
 * Track A/B test conversion
 */
export function trackABTestConversion(
  testId: string,
  variant: "A" | "B",
  score?: number,
  metrics?: { lcp?: number; fid?: number; cls?: number }
): void {
  const tests = getABTests();
  const test = tests.find((t) => t.id === testId);
  if (!test) return;

  const variantMetrics = variant === "A" ? test.metrics.variantA : test.metrics.variantB;

  variantMetrics.conversions++;
  variantMetrics.conversionRate =
    (variantMetrics.conversions / variantMetrics.visitors) * 100;

  if (score !== undefined) {
    const currentAvg = variantMetrics.avgScore || 0;
    const count = variantMetrics.conversions;
    variantMetrics.avgScore = (currentAvg * (count - 1) + score) / count;
  }

  if (metrics) {
    if (metrics.lcp !== undefined) {
      const currentAvg = variantMetrics.avgLCP || 0;
      const count = variantMetrics.conversions;
      variantMetrics.avgLCP = (currentAvg * (count - 1) + metrics.lcp) / count;
    }
    if (metrics.fid !== undefined) {
      const currentAvg = variantMetrics.avgFID || 0;
      const count = variantMetrics.conversions;
      variantMetrics.avgFID = (currentAvg * (count - 1) + metrics.fid) / count;
    }
    if (metrics.cls !== undefined) {
      const currentAvg = variantMetrics.avgCLS || 0;
      const count = variantMetrics.conversions;
      variantMetrics.avgCLS = (currentAvg * (count - 1) + metrics.cls) / count;
    }
  }

  saveABTests(tests);
}

/**
 * Get test results
 */
export function getABTestResults(testId: string): {
  variantA: ABTestMetrics;
  variantB: ABTestMetrics;
  winner?: "A" | "B" | "tie";
  confidence?: number;
} | null {
  const tests = getABTests();
  const test = tests.find((t) => t.id === testId);
  if (!test) return null;

  const { variantA, variantB } = test.metrics;

  // Simple winner determination (can be enhanced with statistical significance)
  let winner: "A" | "B" | "tie" | undefined;
  let confidence: number | undefined;

  if (test.type === "seo" || test.type === "performance") {
    // Higher score is better
    const scoreA = variantA.avgScore || 0;
    const scoreB = variantB.avgScore || 0;
    if (scoreA > scoreB * 1.05) winner = "A";
    else if (scoreB > scoreA * 1.05) winner = "B";
    else winner = "tie";
  } else {
    // Higher conversion rate is better
    if (variantA.conversionRate > variantB.conversionRate * 1.05) winner = "A";
    else if (variantB.conversionRate > variantA.conversionRate * 1.05) winner = "B";
    else winner = "tie";
  }

  // Simple confidence calculation (can be enhanced)
  const totalVisitors = variantA.visitors + variantB.visitors;
  confidence = totalVisitors > 100 ? 95 : totalVisitors > 50 ? 80 : 50;

  return {
    variantA,
    variantB,
    winner,
    confidence,
  };
}

/**
 * Start A/B test
 */
export function startABTest(testId: string): void {
  const tests = getABTests();
  const test = tests.find((t) => t.id === testId);
  if (test) {
    test.status = "running";
    test.startDate = Date.now();
    saveABTests(tests);
  }
}

/**
 * Stop A/B test
 */
export function stopABTest(testId: string): void {
  const tests = getABTests();
  const test = tests.find((t) => t.id === testId);
  if (test) {
    test.status = "completed";
    test.endDate = Date.now();
    saveABTests(tests);
  }
}

/**
 * Get user assignments
 */
function getAssignments(): Record<string, "A" | "B"> {
  try {
    const stored = localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Record<string, "A" | "B">;
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Save user assignments
 */
function saveAssignments(assignments: Record<string, "A" | "B">): void {
  try {
    localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error("Failed to save assignments:", error);
  }
}

/**
 * Get or create user ID
 */
function getUserId(): string {
  try {
    let userId = localStorage.getItem("analytics.userId");
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("analytics.userId", userId);
    }
    return userId;
  } catch {
    return `user-${Date.now()}`;
  }
}

/**
 * Hash string to number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

