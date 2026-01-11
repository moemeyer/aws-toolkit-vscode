/**
 * CSRF Protection using the Double Submit Cookie pattern
 * More info: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import crypto from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("base64url");
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(req: Request): boolean {
  // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return true;
  }

  // Get token from header
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  // Get token from cookie
  const cookieHeader = req.headers.get("cookie");
  const cookieToken = parseCsrfCookie(cookieHeader);

  // Both must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Use timing-safe comparison
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Parse CSRF token from cookie header
 */
function parseCsrfCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map(c => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Middleware to require CSRF token
 */
export async function withCsrfProtection(req: Request): Promise<Response | null> {
  // Skip CSRF for API endpoints that use other authentication
  // (like webhook signatures or API keys)
  const url = new URL(req.url);

  // Skip for webhook endpoints (they should use signature verification instead)
  if (url.pathname.includes("/webhook")) {
    return null;
  }

  // Skip for public read-only endpoints
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return null;
  }

  if (!verifyCsrfToken(req)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "CSRF token validation failed"
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  return null;
}

/**
 * Generate CSRF cookie header
 */
export function getCsrfCookieHeader(token: string): string {
  const isProduction = process.env.NODE_ENV === "production";

  return [
    `${CSRF_COOKIE_NAME}=${token}`,
    "Path=/",
    "SameSite=Strict",
    isProduction ? "Secure" : "",
    "HttpOnly"
  ]
    .filter(Boolean)
    .join("; ");
}

/**
 * Endpoint to get CSRF token (typically called on app initialization)
 */
export function createCsrfTokenResponse(): Response {
  const token = generateCsrfToken();

  return new Response(
    JSON.stringify({ token }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": getCsrfCookieHeader(token)
      }
    }
  );
}
