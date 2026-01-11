/**
 * Microsoft Advertising Offline Conversion Upload Implementation
 * Uses Microsoft Advertising API to upload offline conversions
 *
 * Documentation: https://learn.microsoft.com/en-us/advertising/guides/offline-conversions
 */

import { logger } from "../logger.js";

export interface MicrosoftAdsConfig {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  accountId: string;
  conversionGoalId?: string; // Optional: specific conversion goal
}

export interface OfflineConversion {
  msclkid: string; // Microsoft Click ID (required)
  conversionName: string; // Name of the conversion goal
  conversionTime: string; // ISO 8601 format
  conversionValue?: number;
  conversionCurrency?: string;

  // Optional enhanced data
  hashedEmailAddress?: string; // SHA-256 hashed
  hashedPhoneNumber?: string; // SHA-256 hashed
}

interface MicrosoftTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Get Microsoft Ads OAuth access token
 */
async function getAccessToken(config: MicrosoftAdsConfig): Promise<string> {
  const tokenUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: "refresh_token",
    scope: "https://ads.microsoft.com/ads.manage"
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft OAuth failed: ${error}`);
  }

  const data: MicrosoftTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Upload offline conversions to Microsoft Ads using REST API
 *
 * @param config - Microsoft Ads API configuration
 * @param conversions - Array of offline conversions to upload
 * @returns Upload results
 */
export async function microsoftAdsUploadOfflineConversions(
  config: MicrosoftAdsConfig,
  conversions: OfflineConversion[]
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
    if (!config.customerId || !config.accountId || !config.developerToken) {
      throw new Error("Missing required Microsoft Ads configuration");
    }

    // Get access token
    const accessToken = await getAccessToken(config);

    // Build API endpoint
    const endpoint = `https://api.ads.microsoft.com/v13/customers/${config.customerId}/offlineconversions`;

    // Transform conversions to Microsoft Ads format
    const offlineConversions = conversions.map(conversion => {
      const msConversion: any = {
        MicrosoftClickId: conversion.msclkid,
        ConversionName: conversion.conversionName,
        ConversionTime: conversion.conversionTime,
        ConversionCurrencyCode: conversion.conversionCurrency || "USD"
      };

      if (conversion.conversionValue !== undefined) {
        msConversion.ConversionValue = conversion.conversionValue;
      }

      // Add enhanced conversion data if provided
      if (conversion.hashedEmailAddress) {
        msConversion.HashedEmailAddress = conversion.hashedEmailAddress;
      }

      if (conversion.hashedPhoneNumber) {
        msConversion.HashedPhoneNumber = conversion.hashedPhoneNumber;
      }

      return msConversion;
    });

    // Prepare SOAP request body
    // Note: Microsoft Ads API uses SOAP, so we need to format accordingly
    const soapEnvelope = buildSoapRequest(
      config,
      offlineConversions,
      accessToken
    );

    // Make API call
    const response = await fetch(
      "https://campaign.api.bingads.microsoft.com/Api/Advertiser/CampaignManagement/v13/CampaignManagementService.svc",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "ApplyOfflineConversions",
          "Authorization": `Bearer ${accessToken}`,
          "DeveloperToken": config.developerToken,
          "CustomerId": config.customerId,
          "CustomerAccountId": config.accountId
        },
        body: soapEnvelope
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Microsoft Ads API error: ${errorText}`);
    }

    const responseText = await response.text();

    // Parse SOAP response
    const result = parseSoapResponse(responseText);

    logger.info("Microsoft Ads conversions uploaded", {
      total: conversions.length,
      uploaded: result.uploaded,
      failed: result.failed
    });

    return {
      ok: result.uploaded > 0,
      status: 200,
      uploaded: result.uploaded,
      failed: result.failed,
      results: result
    };
  } catch (error: any) {
    logger.error("Microsoft Ads upload failed", error, {
      customerId: config.customerId,
      conversionCount: conversions.length
    });

    return {
      ok: false,
      status: 500,
      error: error.message || "Microsoft Ads upload failed",
      uploaded: 0,
      failed: conversions.length
    };
  }
}

/**
 * Build SOAP request for ApplyOfflineConversions
 */
function buildSoapRequest(
  config: MicrosoftAdsConfig,
  conversions: any[],
  accessToken: string
): string {
  const conversionsXml = conversions
    .map(
      c => `
      <OfflineConversion>
        <ConversionCurrencyCode>${c.ConversionCurrencyCode}</ConversionCurrencyCode>
        <ConversionName>${escapeXml(c.ConversionName)}</ConversionName>
        <ConversionTime>${c.ConversionTime}</ConversionTime>
        <ConversionValue>${c.ConversionValue || 0}</ConversionValue>
        <MicrosoftClickId>${c.MicrosoftClickId}</MicrosoftClickId>
        ${c.HashedEmailAddress ? `<HashedEmailAddress>${c.HashedEmailAddress}</HashedEmailAddress>` : ""}
        ${c.HashedPhoneNumber ? `<HashedPhoneNumber>${c.HashedPhoneNumber}</HashedPhoneNumber>` : ""}
      </OfflineConversion>
    `
    )
    .join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Header>
    <h:ApplicationToken xmlns:h="https://bingads.microsoft.com/CampaignManagement/v13">${config.developerToken}</h:ApplicationToken>
    <h:AuthenticationToken xmlns:h="https://bingads.microsoft.com/CampaignManagement/v13">${accessToken}</h:AuthenticationToken>
    <h:CustomerId xmlns:h="https://bingads.microsoft.com/CampaignManagement/v13">${config.customerId}</h:CustomerId>
    <h:CustomerAccountId xmlns:h="https://bingads.microsoft.com/CampaignManagement/v13">${config.accountId}</h:CustomerAccountId>
  </s:Header>
  <s:Body>
    <ApplyOfflineConversionsRequest xmlns="https://bingads.microsoft.com/CampaignManagement/v13">
      <OfflineConversions>
        ${conversionsXml}
      </OfflineConversions>
    </ApplyOfflineConversionsRequest>
  </s:Body>
</s:Envelope>`;
}

/**
 * Parse SOAP response from Microsoft Ads API
 */
function parseSoapResponse(xml: string): { uploaded: number; failed: number; errors?: any[] } {
  // Basic XML parsing - in production, use a proper XML parser
  const hasError = xml.includes("<faultstring>") || xml.includes("AdApiFaultDetail");

  if (hasError) {
    // Extract error message
    const errorMatch = xml.match(/<faultstring>(.*?)<\/faultstring>/);
    const errorMessage = errorMatch ? errorMatch[1] : "Unknown error";

    logger.warn("Microsoft Ads API returned error", { error: errorMessage });

    return {
      uploaded: 0,
      failed: 1,
      errors: [{ message: errorMessage }]
    };
  }

  // Check for partial errors in response
  const partialErrors = xml.match(/<PartialErrors>([\s\S]*?)<\/PartialErrors>/);

  if (partialErrors) {
    // Count errors
    const errorCount = (xml.match(/<BatchError>/g) || []).length;

    return {
      uploaded: Math.max(0, 1 - errorCount), // Simplified - should track per conversion
      failed: errorCount,
      errors: []
    };
  }

  // Success
  return {
    uploaded: 1,
    failed: 0
  };
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Helper to hash user data for enhanced conversions
 */
export function hashForMicrosoftAds(value: string): string {
  const crypto = require("crypto");

  // Normalize: trim, lowercase, remove spaces
  const normalized = value.trim().toLowerCase().replace(/\s/g, "");

  // SHA-256 hash
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

/**
 * Test Microsoft Ads API connection
 */
export async function testMicrosoftAdsConnection(config: MicrosoftAdsConfig): Promise<boolean> {
  try {
    const accessToken = await getAccessToken(config);

    logger.info("Microsoft Ads connection test successful", {
      customerId: config.customerId
    });

    return true;
  } catch (error) {
    logger.error("Microsoft Ads connection test failed", error);
    return false;
  }
}
