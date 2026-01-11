import { encryptJson, decryptJson } from "@/lib/crypto";

// Set encryption key for testing
process.env.ENCRYPTION_KEY = "test-encryption-key-at-least-32-chars-long-for-security";

describe("Crypto", () => {
  describe("encryptJson and decryptJson", () => {
    it("should encrypt and decrypt simple object", () => {
      const original = { apiKey: "secret123", endpoint: "https://api.example.com" };

      const encrypted = encryptJson(original);
      const decrypted = decryptJson(encrypted);

      expect(decrypted).toEqual(original);
    });

    it("should encrypt and decrypt complex object", () => {
      const original = {
        credentials: {
          clientId: "client123",
          clientSecret: "secret456",
          refreshToken: "refresh789"
        },
        settings: {
          enabled: true,
          timeout: 5000,
          retries: 3
        },
        tags: ["prod", "analytics"]
      };

      const encrypted = encryptJson(original);
      const decrypted = decryptJson(encrypted);

      expect(decrypted).toEqual(original);
    });

    it("should produce different encrypted values for same input", () => {
      const original = { test: "value" };

      const encrypted1 = encryptJson(original);
      const encrypted2 = encryptJson(original);

      // Different encrypted values (due to random IV)
      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to same value
      expect(decryptJson(encrypted1)).toEqual(original);
      expect(decryptJson(encrypted2)).toEqual(original);
    });

    it("should throw error if encryption key is too short", () => {
      const oldKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = "short";

      expect(() => encryptJson({ test: "value" })).toThrow("ENCRYPTION_KEY missing/too short");

      process.env.ENCRYPTION_KEY = oldKey;
    });

    it("should throw error if encryption key is missing", () => {
      const oldKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => encryptJson({ test: "value" })).toThrow("ENCRYPTION_KEY missing/too short");

      process.env.ENCRYPTION_KEY = oldKey;
    });
  });
});
