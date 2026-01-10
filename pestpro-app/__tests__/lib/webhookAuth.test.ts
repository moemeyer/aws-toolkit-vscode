import { verifyWebhookSignature, generateWebhookSignature } from "@/lib/webhookAuth";

describe("WebhookAuth", () => {
  const testSecret = "test-webhook-secret-key";
  const testPayload = JSON.stringify({ event: "test", data: { id: 123 } });

  describe("generateWebhookSignature", () => {
    it("should generate signature with timestamp", () => {
      const result = generateWebhookSignature(testPayload, testSecret, true);

      expect(result.signature).toBeDefined();
      expect(result.signature).toMatch(/^sha256=/);
      expect(result.timestamp).toBeDefined();
    });

    it("should generate signature without timestamp", () => {
      const result = generateWebhookSignature(testPayload, testSecret, false);

      expect(result.signature).toBeDefined();
      expect(result.signature).toMatch(/^sha256=/);
      expect(result.timestamp).toBeUndefined();
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid signature with timestamp", () => {
      const { signature, timestamp } = generateWebhookSignature(testPayload, testSecret, true);

      const result = verifyWebhookSignature(testPayload, signature, testSecret, timestamp);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should verify valid signature without timestamp", () => {
      const { signature } = generateWebhookSignature(testPayload, testSecret, false);

      const result = verifyWebhookSignature(testPayload, signature, testSecret);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject signature with tampered payload", () => {
      const { signature, timestamp } = generateWebhookSignature(testPayload, testSecret, true);

      const tamperedPayload = JSON.stringify({ event: "tampered", data: { id: 999 } });
      const result = verifyWebhookSignature(tamperedPayload, signature, testSecret, timestamp);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Signature mismatch");
    });

    it("should reject missing signature", () => {
      const result = verifyWebhookSignature(testPayload, null, testSecret);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Missing signature");
    });

    it("should reject signature with wrong secret", () => {
      const { signature, timestamp } = generateWebhookSignature(testPayload, testSecret, true);

      const result = verifyWebhookSignature(testPayload, signature, "wrong-secret", timestamp);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Signature mismatch");
    });

    it("should reject expired timestamp", () => {
      const oldTimestamp = String(Math.floor(Date.now() / 1000) - 400); // 400 seconds ago
      const { signature } = generateWebhookSignature(testPayload, testSecret, false);

      const result = verifyWebhookSignature(
        testPayload,
        signature,
        testSecret,
        oldTimestamp,
        300 // max age: 5 minutes
      );

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Webhook timestamp too old");
    });

    it("should reject invalid timestamp format", () => {
      const { signature } = generateWebhookSignature(testPayload, testSecret, false);

      const result = verifyWebhookSignature(testPayload, signature, testSecret, "invalid");

      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid timestamp");
    });
  });
});
