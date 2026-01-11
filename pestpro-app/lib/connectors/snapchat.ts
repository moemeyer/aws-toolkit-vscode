/**
 * Snapchat Conversions API (CAPI) Connector
 * Server-side event tracking for Snapchat Ads
 *
 * Documentation: https://marketingapi.snapchat.com/docs/conversion.html
 */

import crypto from "crypto";
import { logger } from "../logger.js";

export interface SnapchatConfig {
  accessToken: string;
  pixelId: string; // Snap Pixel ID
}

export interface SnapchatEvent {
  event_type: string; // Event name
  event_conversion_type: "WEB" | "MOBILE_APP" | "OFFLINE";
  event_tag: "unique" | "all"; // For deduplication
  timestamp: number; // Unix timestamp in milliseconds

  // User data (should be hashed with SHA-256)
  hashed_email?: string;
  hashed_phone_number?: string;
  hashed_ip_address?: string;
  user_agent?: string;
  uuid_c1?: string; // First-party cookie (_scid)

  // Click ID
  click_id?: string; // ScCid from Snap ads

  // Event properties
  item_category?: string;
  item_ids?: string[];
  description?: string;
  number_items?: number;
  price?: number;
  currency?: string;
  transaction_id?: string;
  level?: string;
  client_dedup_id?: string; // Deduplication ID
}

/**
 * Hash data for Snapchat (SHA-256)
 */
export function hashForSnapchat(value: string): string {
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
 * Send conversion events to Snapchat CAPI
 */
export async function snapchatSendEvents(
  config: SnapchatConfig,
  events: SnapchatEvent[]
) {
  if (!events || events.length === 0) {
    return { ok: true, sent: 0 };
  }

  try {
    const url = `https://tr.snapchat.com/v2/conversion`;

    const payload = {
      pixel_id: config.pixelId,
      data: events.map(event => ({
        event_type: event.event_type,
        event_conversion_type: event.event_conversion_type || "WEB",
        event_tag: event.event_tag || "unique",
        timestamp: event.timestamp,

        // User identifiers (hashed)
        hashed_email: event.hashed_email,
        hashed_phone_number: event.hashed_phone_number,
        hashed_ip_address: event.hashed_ip_address,
        user_agent: event.user_agent,
        uuid_c1: event.uuid_c1,

        // Click ID
        click_id: event.click_id,

        // Event data
        item_category: event.item_category,
        item_ids: event.item_ids,
        description: event.description,
        number_items: event.number_items,
        price: event.price,
        currency: event.currency || "USD",
        transaction_id: event.transaction_id,
        level: event.level,
        client_dedup_id: event.client_dedup_id
      }))
    };

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
      throw new Error(result.message || "Snapchat CAPI error");
    }

    logger.info("Snapchat events sent", {
      pixelId: config.pixelId,
      eventCount: events.length
    });

    return {
      ok: true,
      status: response.status,
      sent: events.length,
      result
    };
  } catch (error: any) {
    logger.error("Snapchat CAPI failed", error, {
      pixelId: config.pixelId,
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
 * Standard Snapchat event types
 */
export const SNAPCHAT_EVENTS = {
  PAGE_VIEW: "PAGE_VIEW",
  ADD_CART: "ADD_CART",
  VIEW_CONTENT: "VIEW_CONTENT",
  ADD_BILLING: "ADD_BILLING",
  SIGN_UP: "SIGN_UP",
  SEARCH: "SEARCH",
  PURCHASE: "PURCHASE",
  START_CHECKOUT: "START_CHECKOUT",
  SAVE: "SAVE",
  CUSTOM_EVENT_1: "CUSTOM_EVENT_1",
  CUSTOM_EVENT_2: "CUSTOM_EVENT_2",
  CUSTOM_EVENT_3: "CUSTOM_EVENT_3",
  CUSTOM_EVENT_4: "CUSTOM_EVENT_4",
  CUSTOM_EVENT_5: "CUSTOM_EVENT_5"
} as const;
