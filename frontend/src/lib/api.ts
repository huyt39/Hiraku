/**
 * Central API configuration.
 * Set NEXT_PUBLIC_API_URL in .env.local to override.
 */
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default API_URL;
