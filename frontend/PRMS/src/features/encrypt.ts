import CryptoJS from "crypto-js";

// Base64 secret key
const secretKey = import.meta.env.VITE_SECRET_KEY;
const nonceExpirationMinutes = 1; // Expiration time for nonce
console.log("Import Meta ENV:", import.meta.env);
console.log("Secret Key:", import.meta.env.VITE_SECRET_KEY);


export default function hashPassword(password: string): string {
  const timestamp = Date.now();
  const dataToEncrypt = JSON.stringify({ password, timestamp });

  if (!secretKey) {
    throw new Error("Secret key is not defined");
  }

  return CryptoJS.AES.encrypt(dataToEncrypt, CryptoJS.enc.Utf8.parse(secretKey)).toString();
}

export function verifyPassword(encryptedData: string): boolean {
  if (!secretKey) {
    throw new Error("Secret key is not defined");
  }

  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(secretKey));
    const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedData) {
      return false; // Decryption failed
    }

    const { timestamp } = JSON.parse(decryptedData);
    const currentTime = Date.now();
    const expirationTime = timestamp + nonceExpirationMinutes * 60 * 1000;

    return currentTime <= expirationTime; // Check expiration
  } catch (error) {
    console.error("Decryption error:", error);
    return false;
  }
}

export async function encryptData(data: string, base64SecretKey: string): Promise<string> {
  try {
    if (!base64SecretKey) {
      throw new Error("Base64 secret key is missing");
    }

    // Decode Base64 key safely
    const secretKeyBytes = new Uint8Array(
      atob(base64SecretKey)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    // Import the secret key
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyBytes,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    // Generate a random IV (16 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      key,
      new TextEncoder().encode(data)
    );

    // Combine IV and encrypted data
    const encryptedBytes = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);

    // Convert to Base64
    return btoa(String.fromCharCode(...encryptedBytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""); // URL-safe Base64
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

export async function encryptPassword(password: string): Promise<string> {
  try {
    if (!secretKey) {
      throw new Error("Secret key is not defined");
    }

    return await encryptData(password, secretKey);
  } catch (error) {
    console.error("Error:", error);
    return ""; // Return empty string on failure
  }
}
