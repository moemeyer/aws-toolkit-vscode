/**
 * Pinterest Conversions API Connector
 * Server-side event tracking for Pinterest Ads
 *
 * Documentation: https://developers.pinterest.com/docs/conversions/conversions/
 */

import crypto from "crypto";
import { logger } from "../logger.js";

export interface PinterestConfig {
  accessToken: string;
  adAccountId: string;
  conversionToken?: string; // Optional for enhanced measurement
}

export interface PinterestEvent {
  event_name: string; // Event type
  action_source: "web" | "app" | "offline";
  event_time: number; // Unix timestamp in seconds
  event_id?: string; // Deduplication ID
  event_source_url?: string;

  // User data (should be hashed with SHA-256)
  user_data?: {
    em?: string[]; // Hashed emails
    ph?: string[]; // Hashed phone numbers (E.164 format)
    ge?: string[]; // Hashed gender (f, m, or n)
    db?: string[]; // Hashed date of birth (YYYYMMDD)
    ln?: string[]; // Hashed last name
    fn?: string[]; // Hashed first name
    ct?: string[]; // Hashed city
    st?: string[]; // Hashed state (2-letter code)
    zp?: string[]; // Hashed zip code
    country?: string[]; // Hashed country (2-letter code)
    external_id?: string[]; // Your user IDs (hashed)
    click_id?: string; // Pinterest click ID (epik)
    partner_id?: string;
  };

  // Custom data
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_name?: string;
    content_category?: string;
    content_brand?: string;
    contents?: Array<{
      item_id: string;
      item_name?: string;
      item_category?: string;
      item_brand?: string;
      item_price?: number;
      item_quantity?: number;
    }>;
    num_items?: number;
    order_id?: string;
    search_string?: string;
    opt_out_type?: string;
    np?: string; // "1" for new user
  };

  // App data (for mobile apps)
  app_data?: {
    app_id?: string;
    app_name?: string;
    app_version?: string;
  };
}

/**
 * Hash data for Pinterest (SHA-256)
 */
export function hashForPinterest(value: string): string {
  if (!value) return "";

  // Normalize: trim, lowercase, remove spaces
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");

  // SHA-256 hash
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

/**
 * Send conversion events to Pinterest API
 */
export async function pinterestSendEvents(
  config: PinterestConfig,
  events: PinterestEvent[]
) {
  if (!events || events.length === 0) {
    return { ok: true, sent: 0 };
  }

  try {
    const url = `https://api.pinterest.com/v5/ad_accounts/${config.adAccountId}/events`;

    const payload = {
      data: events.map(event => ({
        event_name: event.event_name,
        action_source: event.action_source || "web",
        event_time: event.event_time,
        event_id: event.event_id,
        event_source_url: event.event_source_url,
        user_data: event.user_data,
        custom_data: event.custom_data,
        app_data: event.app_data
      }))
    };

    // Add optional conversion token for enhanced measurement
    if (config.conversionToken) {
      (payload as any).conversion_token = config.conversionToken;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Pinterest Conversions API error");
    }

    logger.info("Pinterest events sent", {
      adAccountId: config.adAccountId,
      eventCount: events.length
    });

    return {
      ok: true,
      status: response.status,
      sent: events.length,
      result
    };
  } catch (error: any) {
    logger.error("Pinterest Conversions API failed", error, {
      adAccountId: config.adAccountId,
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
 * Test Pinterest API connection
 */
export async function testPinterestConnection(config: PinterestConfig): Promise<boolean> {
  try {
    // Test with a simple API call to get ad account info
    const url = `https://api.pinterest.com/v5/ad_accounts/${config.adAccountId}`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Pinterest API connection failed");
    }

    logger.info("Pinterest connection test successful", {
      adAccountId: config.adAccountId
    });

    return true;
  } catch (error) {
    logger.error("Pinterest connection test failed", error);
    return false;
  }
}

/**
 * Standard Pinterest event names
 */
export const PINTEREST_EVENTS = {
  PAGE_VISIT: "page_visit",
  VIEW_CATEGORY: "view_category",
  SEARCH: "search",
  ADD_TO_CART: "add_to_cart",
  CHECKOUT: "checkout",
  WATCH_VIDEO: "watch_video",
  SIGNUP: "signup",
  LEAD: "lead",
  CUSTOM: "custom"
} as const;
