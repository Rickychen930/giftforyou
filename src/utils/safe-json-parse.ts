/**
 * Safe JSON parsing utilities
 * Handles all edge cases and provides consistent error handling
 */

/**
 * Safely parse JSON from Response text
 * @param text - The text to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T = unknown>(text: string, fallback: T): T {
  if (!text || typeof text !== "string") {
    return fallback;
  }

  const trimmed = text.trim();
  if (trimmed === "") {
    return fallback;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (err) {
    console.warn("JSON parse error:", err instanceof Error ? err.message : "Unknown error", { text: trimmed.slice(0, 100) });
    return fallback;
  }
}

/**
 * Safely parse JSON from Response
 * @param response - Fetch Response object
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export async function safeResponseJson<T = unknown>(
  response: Response,
  fallback: T
): Promise<T> {
  try {
    const text = await response.text();
    return safeJsonParse<T>(text, fallback);
  } catch (err) {
    console.warn("Response text read error:", err instanceof Error ? err.message : "Unknown error");
    return fallback;
  }
}

/**
 * Parse JSON with error message
 * @param text - The text to parse
 * @param errorContext - Context for error message
 * @returns Parsed JSON
 * @throws Error if parsing fails
 */
export function parseJsonOrThrow<T = unknown>(text: string, errorContext = "response"): T {
  if (!text || typeof text !== "string") {
    throw new Error(`Empty ${errorContext} body`);
  }

  const trimmed = text.trim();
  if (trimmed === "") {
    throw new Error(`Empty ${errorContext} body`);
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse ${errorContext}: ${err instanceof Error ? err.message : "Invalid JSON"}`
    );
  }
}

/**
 * Parse JSON from Response with error message
 * @param response - Fetch Response object
 * @param errorContext - Context for error message
 * @returns Parsed JSON
 * @throws Error if parsing fails
 */
export async function parseResponseOrThrow<T = unknown>(
  response: Response,
  errorContext = "response"
): Promise<T> {
  try {
    const text = await response.text();
    return parseJsonOrThrow<T>(text, errorContext);
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Failed to read ${errorContext}`);
  }
}

