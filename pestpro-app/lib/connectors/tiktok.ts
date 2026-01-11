/**
 * TikTok Events API Connector
 * Server-side event tracking for TikTok Ads
 *
 * Documentation: https://business-api.tiktok.com/portal/docs?id=1771100865818625
 */

import crypto from "crypto";
import { logger } from "../logger.js";

export interface TikTokConfig {
  accessToken: string;
  pixelCode: string; // TikTok Pixel ID
}

export interface TikTokEvent {
  event: string; // Event name (e.g., "ViewContent", "CompletePayment")
  event_time: number; // Unix timestamp in seconds
  event_id?: string; // Deduplication ID

  // User data (should be hashed)
  user?: {
    email?: string; // SHA-256 hashed
    phone_number?: string; // SHA-256 hashed
    external_id?: string; // Your user ID
    ttp?: string; // TikTok Click ID (ttclid)
    ip?: string;
    user_agent?: string;
  };

  // Page/context data
  page?: {
    url?: string;
    referrer?: string;
  };

  // Event properties
  properties?: {
    content_type?: string;
    content_id?: string;
    content_name?: string;
    value?: number;
    currency?: string;
    quantity?: number;
    description?: string;
  };
}

/**
 * Hash data for TikTok (SHA-256)
 */
export function hashForTikTok(value: string): string {
  if (!value) return "";

  // Normalize: trim and lowercase
  const normalized = value.trim().toLowerCase();

  // SHA-256 hash
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

/**
 * Send events to TikTok Events API
 */
export async function tiktokSendEvents(
  config: TikTokConfig,
  events: TikTokEvent[]
) {
  if (!events || events.length === 0) {
    return { ok: true, sent: 0 };
  }

  try {
    const url = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

    const payload = {
      pixel_code: config.pixelCode,
      event_source: "web",
      event_source_id: config.pixelCode,
      data: events.map(event => ({
        event: event.event,
        event_time: event.event_time,
        event_id: event.event_id,
        user: event.user,
        page: event.page,
        properties: event.properties
      })),
      test_event_code: process.env.TIKTOK_TEST_EVENT_CODE // Optional for testing
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": config.accessToken
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.code !== 0) {
      throw new Error(result.message || "TikTok Events API error");
    }

    logger.info("TikTok events sent", {
      pixelCode: config.pixelCode,
      eventCount: events.length
    });

    return {
      ok: true,
      status: response.status,
      sent: events.length,
      result
    };
  } catch (error: any) {
    logger.error("TikTok Events API failed", error, {
      pixelCode: config.pixelCode,
      eventCount: events.length
    });

    return {
      ok: false,
      status: 500,
      error: error.message,
      sent: 0
    };
  }
}

/**
 * Standard TikTok event names
 */
export const TIKTOK_EVENTS = {
  VIEW_CONTENT: "ViewContent",
  CLICK_BUTTON: "ClickButton",
  CONTACT: "Contact",
  SUBMIT_FORM: "SubmitForm",
  COMPLETE_REGISTRATION: "CompleteRegistration",
  COMPLETE_PAYMENT: "CompletePayment",
  ADD_TO_CART: "AddToCart",
  INITIATE_CHECKOUT: "InitiateCheckout",
  SEARCH: "Search",
  DOWNLOAD: "Download"
} as const;
