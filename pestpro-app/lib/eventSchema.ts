import { z } from "zod";

export const ConsentSchema = z.object({
  analytics_storage: z.enum(["granted", "denied"]).default("denied"),
  ad_storage: z.enum(["granted", "denied"]).default("denied"),
  ad_user_data: z.enum(["granted", "denied"]).default("denied"),
  ad_personalization: z.enum(["granted", "denied"]).default("denied")
}).passthrough();

export const TrackEventSchema = z.object({
  name: z.string().min(1),
  source: z.string().default("web"),

  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
  userId: z.string().optional(),

  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  referrer: z.string().optional(),
  landingUrl: z.string().optional(),

  gclid: z.string().optional(),
  gbraid: z.string().optional(),
  wbraid: z.string().optional(),
  msclkid: z.string().optional(),
  fbclid: z.string().optional(),
  ttclid: z.string().optional(),

  externalEventId: z.string().optional(),

  consent: ConsentSchema.default({
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  }),

  payload: z.record(z.any()).default({})
});

export type TrackEvent = z.infer<typeof TrackEventSchema>;
