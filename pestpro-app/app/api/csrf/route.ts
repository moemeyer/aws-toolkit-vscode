import { createCsrfTokenResponse } from "@/lib/csrf";

/**
 * GET /api/csrf
 * Returns a CSRF token and sets it as a cookie
 * Client should call this on app initialization and include the token in subsequent requests
 */
export async function GET() {
  return createCsrfTokenResponse();
}
