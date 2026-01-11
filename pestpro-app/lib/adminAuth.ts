/**
 * Simple admin token authentication
 * For production, use NextAuth with proper session management
 */

export function requireAdmin(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  return !!token && token === process.env.ADMIN_TOKEN;
}

/**
 * Get admin token from request headers
 */
export function getAdminToken(req: Request): string | null {
  return req.headers.get("x-admin-token");
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "Unauthorized" }),
    {
      status: 401,
      headers: { "Content-Type": "application/json" }
    }
  );
}
