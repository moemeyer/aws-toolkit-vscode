import { TrackEventSchema, ConsentSchema } from "@/lib/eventSchema";

describe("EventSchema", () => {
  describe("ConsentSchema", () => {
    it("should accept valid consent data", () => {
      const result = ConsentSchema.safeParse({
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "granted",
        ad_personalization: "denied"
      });

      expect(result.success).toBe(true);
    });

    it("should use default values when not provided", () => {
      const result = ConsentSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.analytics_storage).toBe("denied");
        expect(result.data.ad_storage).toBe("denied");
      }
    });

    it("should reject invalid consent values", () => {
      const result = ConsentSchema.safeParse({
        analytics_storage: "invalid"
      });

      expect(result.success).toBe(false);
    });
  });

  describe("TrackEventSchema", () => {
    it("should accept valid event data", () => {
      const result = TrackEventSchema.safeParse({
        name: "page_view",
        source: "web",
        sessionId: "session123",
        deviceId: "device456",
        payload: { page: "/home" }
      });

      expect(result.success).toBe(true);
    });

    it("should accept event with UTM parameters", () => {
      const result = TrackEventSchema.safeParse({
        name: "cta_click",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "summer-sale",
        utmTerm: "pest control",
        utmContent: "ad1"
      });

      expect(result.success).toBe(true);
    });

    it("should accept event with click IDs", () => {
      const result = TrackEventSchema.safeParse({
        name: "lead_submitted",
        gclid: "gclid123",
        msclkid: "msclkid456",
        fbclid: "fbclid789"
      });

      expect(result.success).toBe(true);
    });

    it("should reject event without name", () => {
      const result = TrackEventSchema.safeParse({
        source: "web"
      });

      expect(result.success).toBe(false);
    });

    it("should use default values", () => {
      const result = TrackEventSchema.safeParse({
        name: "test_event"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe("web");
        expect(result.data.payload).toEqual({});
        expect(result.data.consent.analytics_storage).toBe("denied");
      }
    });

    it("should accept event with external event ID for idempotency", () => {
      const result = TrackEventSchema.safeParse({
        name: "purchase",
        externalEventId: "order-123-timestamp-456"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.externalEventId).toBe("order-123-timestamp-456");
      }
    });
  });
});
