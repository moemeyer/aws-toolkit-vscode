"use client";

import { useEffect } from "react";

function readOrCreate(key: string) {
  if (typeof window === "undefined") return null;

  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

function getParams() {
  if (typeof window === "undefined") return {};

  const p = new URLSearchParams(window.location.search);

  return {
    // UTMs
    utmSource: p.get("utm_source") || undefined,
    utmMedium: p.get("utm_medium") || undefined,
    utmCampaign: p.get("utm_campaign") || undefined,
    utmTerm: p.get("utm_term") || undefined,
    utmContent: p.get("utm_content") || undefined,

    // Click IDs if present
    gclid: p.get("gclid") || undefined,
    gbraid: p.get("gbraid") || undefined,
    wbraid: p.get("wbraid") || undefined,
    msclkid: p.get("msclkid") || undefined,
    fbclid: p.get("fbclid") || undefined,
    ttclid: p.get("ttclid") || undefined
  };
}

export default function TrackClient() {
  useEffect(() => {
    const sessionId = readOrCreate("pp_session_id");
    const deviceId = readOrCreate("pp_device_id");
    const params = getParams();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "page_view",
        source: "web",
        sessionId,
        deviceId,
        referrer: document.referrer || undefined,
        landingUrl: window.location.href,
        ...params,
        consent: {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted"
        },
        payload: {
          title: document.title,
          path: window.location.pathname
        }
      })
    }).catch(() => {
      // Silently fail - don't block page load
    });
  }, []);

  return null;
}
