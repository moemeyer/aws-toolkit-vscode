/**
 * Google Ads Offline Conversion Upload Implementation
 * Uses Google Ads API to upload click conversions with enhanced conversions support
 *
 * Documentation: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */

import { GoogleAdsApi, services, enums } from "google-ads-api";
import { logger } from "../logger.js";

export interface GoogleAdsConfig {
  customerId: string;
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  conversionActionId: string; // Required: Your conversion action ID
  loginCustomerId?: string; // Optional: Manager account ID if using MCC
}

export interface ClickConversion {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  conversionDateTime: string; // ISO 8601 format
  conversionValue?: number;
  currencyCode?: string;
  orderId?: string;

  // Enhanced conversions data (optional but recommended)
  userIdentifiers?: {
    hashedEmail?: string; // SHA-256 hashed
    hashedPhoneNumber?: string; // SHA-256 hashed, E.164 format
    addressInfo?: {
      hashedFirstName?: string;
      hashedLastName?: string;
      hashedStreetAddress?: string;
      city?: string;
      state?: string;
      countryCode?: string;
      postalCode?: string;
    };
  };
}

/**
 * Initialize Google Ads API client
 */
function createGoogleAdsClient(config: GoogleAdsConfig): GoogleAdsApi {
  return new GoogleAdsApi({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    developer_token: config.developerToken
  });
}

/**
 * Upload click conversions to Google Ads
 *
 * @param config - Google Ads API configuration
 * @param conversions - Array of click conversions to upload
 * @returns Upload results with partial failure handling
 */
export async function googleAdsUploadClickConversions(
  config: GoogleAdsConfig,
  conversions: ClickConversion[]
) {
  if (!conversions || conversions.length === 0) {
    return {
      ok: true,
      uploaded: 0,
      failed: 0,
      results: []
    };
  }

  try {
    // Validate config
    if (!config.customerId || !config.developerToken || !config.conversionActionId) {
      throw new Error("Missing required Google Ads configuration");
    }

    // Initialize client
    const client = createGoogleAdsClient(config);
    const customer = client.Customer({
      customer_id: config.customerId,
      refresh_token: config.refreshToken,
      login_customer_id: config.loginCustomerId
    });

    // Build conversion action resource name
    const conversionActionResourceName = `customers/${config.customerId}/conversionActions/${config.conversionActionId}`;

    // Transform conversions to Google Ads format
    const clickConversions = conversions.map(conversion => {
      const clickConversion: any = {
        conversion_action: conversionActionResourceName,
        conversion_date_time: conversion.conversionDateTime
      };

      // Add click identifier (gclid, gbraid, or wbraid)
      if (conversion.gclid) {
        clickConversion.gclid = conversion.gclid;
      } else if (conversion.gbraid) {
        clickConversion.gbraid = conversion.gbraid;
      } else if (conversion.wbraid) {
        clickConversion.wbraid = conversion.wbraid;
      } else {
        logger.warn("Conversion missing click identifier", {
          orderId: conversion.orderId
        });
        return null;
      }

      // Add conversion value if provided
      if (conversion.conversionValue !== undefined) {
        clickConversion.conversion_value = conversion.conversionValue;
      }

      if (conversion.currencyCode) {
        clickConversion.currency_code = conversion.currencyCode;
      }

      if (conversion.orderId) {
        clickConversion.order_id = conversion.orderId;
      }

      // Add enhanced conversions data if provided
      if (conversion.userIdentifiers) {
        const userIdentifiers: any[] = [];

        if (conversion.userIdentifiers.hashedEmail) {
          userIdentifiers.push({
            hashed_email: conversion.userIdentifiers.hashedEmail
          });
        }

        if (conversion.userIdentifiers.hashedPhoneNumber) {
          userIdentifiers.push({
            hashed_phone_number: conversion.userIdentifiers.hashedPhoneNumber
          });
        }

        if (conversion.userIdentifiers.addressInfo) {
          userIdentifiers.push({
            address_info: conversion.userIdentifiers.addressInfo
          });
        }

        if (userIdentifiers.length > 0) {
          clickConversion.user_identifiers = userIdentifiers;
        }
      }

      return clickConversion;
    }).filter(Boolean);

    if (clickConversions.length === 0) {
      return {
        ok: false,
        status: 400,
        error: "No valid conversions to upload",
        uploaded: 0,
        failed: conversions.length
      };
    }

    // Upload conversions with partial failure enabled
    const response = await customer.conversionUploads.uploadClickConversions({
      customer_id: config.customerId,
      conversions: clickConversions,
      partial_failure: true
    });

    // Parse results
    const results = response.results || [];
    const partialFailureError = response.partial_failure_error;

    let uploaded = 0;
    let failed = 0;

    if (partialFailureError) {
      // Some conversions failed
      const errors = partialFailureError.details || [];
      failed = errors.length;
      uploaded = results.length - failed;

      logger.warn("Google Ads partial upload failure", {
        uploaded,
        failed,
        errors: errors.slice(0, 5) // Log first 5 errors
      });
    } else {
      // All succeeded
      uploaded = results.length;
    }

    logger.info("Google Ads conversions uploaded", {
      total: conversions.length,
      uploaded,
      failed
    });

    return {
      ok: uploaded > 0,
      status: 200,
      uploaded,
      failed,
      results: response
    };
  } catch (error: any) {
    logger.error("Google Ads upload failed", error, {
      customerId: config.customerId,
      conversionCount: conversions.length
    });

    return {
      ok: false,
      status: 500,
      error: error.message || "Google Ads upload failed",
      uploaded: 0,
      failed: conversions.length
    };
  }
}

/**
 * Helper to hash user data for enhanced conversions
 * Google requires SHA-256 hashing with normalization
 */
export function hashForEnhancedConversions(value: string): string {
  const crypto = require("crypto");

  // Normalize: trim, lowercase
  const normalized = value.trim().toLowerCase();

  // SHA-256 hash
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

/**
 * Normalize phone number to E.164 format before hashing
 * Example: +1234567890
 */
export function normalizePhoneNumber(phone: string, countryCode: string = "1"): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Add country code if not present
  if (!digits.startsWith(countryCode)) {
    return `+${countryCode}${digits}`;
  }

  return `+${digits}`;
}

/**
 * Test Google Ads API connection
 */
export async function testGoogleAdsConnection(config: GoogleAdsConfig): Promise<boolean> {
  try {
    const client = createGoogleAdsClient(config);
    const customer = client.Customer({
      customer_id: config.customerId,
      refresh_token: config.refreshToken,
      login_customer_id: config.loginCustomerId
    });

    // Simple query to test connection
    const query = `
      SELECT customer.id, customer.descriptive_name
      FROM customer
      LIMIT 1
    `;

    await customer.query(query);

    logger.info("Google Ads connection test successful", {
      customerId: config.customerId
    });

    return true;
  } catch (error) {
    logger.error("Google Ads connection test failed", error);
    return false;
  }
}
