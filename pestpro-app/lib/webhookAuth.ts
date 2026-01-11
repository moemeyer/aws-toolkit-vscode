/**
 * Webhook signature verification
 * Ensures webhook requests are authentic and haven't been tampered with
 */

import crypto from "crypto";

export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Verify webhook signature using HMAC-SHA256
 *
 * @param payload - Raw request body as string
 * @param signature - Signature from request header
 * @param secret - Webhook secret key
 * @param timestamp - Optional timestamp for replay attack prevention
 * @param maxAge - Maximum age of webhook in seconds (default: 5 minutes)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
  timestamp?: string | null,
  maxAge: number = 300
): WebhookVerificationResult {
  if (!signature) {
    return { valid: false, error: "Missing signature" };
  }

  if (!secret) {
    return { valid: false, error: "Webhook secret not configured" };
  }

  // Verify timestamp to prevent replay attacks
  if (timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);

    if (isNaN(webhookTime)) {
      return { valid: false, error: "Invalid timestamp" };
    }

    if (Math.abs(now - webhookTime) > maxAge) {
      return { valid: false, error: "Webhook timestamp too old" };
    }
  }

  // Create expected signature
  const signedPayload = timestamp ? `${timestamp}.${payload}` : payload;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  // Support both "sha256=..." and raw hex formats
  const providedSignature = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  // Timing-safe comparison
  try {
    const bufExpected = Buffer.from(expectedSignature, "hex");
    const bufProvided = Buffer.from(providedSignature, "hex");

    if (bufExpected.length !== bufProvided.length) {
      return { valid: false, error: "Signature mismatch" };
    }

    const isValid = crypto.timingSafeEqual(bufExpected, bufProvided);

    return isValid
      ? { valid: true }
      : { valid: false, error: "Signature mismatch" };
  } catch (error) {
    return { valid: false, error: "Invalid signature format" };
  }
}

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  includeTimestamp: boolean = true
): { signature: string; timestamp?: string } {
  const timestamp = includeTimestamp
    ? Math.floor(Date.now() / 1000).toString()
    : undefined;

  const signedPayload = timestamp ? `${timestamp}.${payload}` : payload;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return {
    signature: `sha256=${signature}`,
    timestamp
  };
}

/**
 * Middleware for webhook signature verification
 */
export async function withWebhookVerification(
  req: Request,
  secret: string
): Promise<Response | null> {
  // Only verify POST/PUT/PATCH requests
  if (!["POST", "PUT", "PATCH"].includes(req.method)) {
    return null;
  }

  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  // Get raw body for signature verification
  const rawBody = await req.text();

  const result = verifyWebhookSignature(rawBody, signature, secret, timestamp);

  if (!result.valid) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: result.error || "Webhook verification failed"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Re-create request with parsed body for downstream handlers
  // Note: In actual implementation, you'd need to pass the parsed body
  // or use a different pattern to avoid consuming the stream twice

  return null;
}

/**
 * Create webhook delivery headers
 */
export function createWebhookHeaders(
  payload: any,
  secret: string,
  additionalHeaders?: Record<string, string>
): Record<string, string> {
  const payloadString = JSON.stringify(payload);
  const { signature, timestamp } = generateWebhookSignature(payloadString, secret);

  return {
    "Content-Type": "application/json",
    "X-Webhook-Signature": signature,
    "X-Webhook-Timestamp": timestamp!,
    "User-Agent": "PestPro-Webhook/1.0",
    ...additionalHeaders
  };
}
