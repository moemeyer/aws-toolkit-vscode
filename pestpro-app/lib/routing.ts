import { DestinationType } from "@prisma/client";

export function defaultRouteForEvent(eventName: string): DestinationType[] {
  const analytics: DestinationType[] = [];
  const ads: DestinationType[] = [];

  // Analytics events
  if (
    ["page_view", "cta_click", "phone_click", "form_start", "lead_submitted",
     "booking_started", "booking_confirmed", "article_view", "article_read_50", "media_view"
    ].includes(eventName)
  ) {
    analytics.push(DestinationType.POSTHOG, DestinationType.GA4);
  }

  // Ad conversion events
  if (["lead_submitted", "booking_confirmed", "job_completed"].includes(eventName)) {
    ads.push(
      DestinationType.META_CAPI,
      DestinationType.GOOGLE_ADS_OFFLINE,
      DestinationType.MICROSOFT_ADS_OFFLINE,
      DestinationType.TIKTOK_EVENTS_API,
      DestinationType.SNAP_CAPI,
      DestinationType.PINTEREST_CAPI
    );
  }

  return [...new Set([...analytics, ...ads])];
}
