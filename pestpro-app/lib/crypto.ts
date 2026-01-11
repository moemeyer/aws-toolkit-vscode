import CryptoJS from "crypto-js";

/**
 * Encrypt JSON config for storing destination secrets in DB.
 * Uses AES with ENCRYPTION_KEY. For production, consider KMS.
 */
export function encryptJson(obj: any): string {
  const key = process.env.ENCRYPTION_KEY || "";
  if (!key || key.length < 32) throw new Error("ENCRYPTION_KEY missing/too short");
  const plaintext = JSON.stringify(obj);
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

export function decryptJson(enc: string): any {
  const key = process.env.ENCRYPTION_KEY || "";
  if (!key || key.length < 32) throw new Error("ENCRYPTION_KEY missing/too short");
  const bytes = CryptoJS.AES.decrypt(enc, key);
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(plaintext);
}
