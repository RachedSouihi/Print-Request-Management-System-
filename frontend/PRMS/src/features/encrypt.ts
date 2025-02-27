import CryptoJS from "crypto-js";


//Base 64 secret key
const secretKey = import.meta.env.VITE_SECRET_KEY;
const nonceExpirationMinutes = 1; // Set the expiration time for the nonce

export default function hashPassword(password: string): string {
  const timestamp = new Date().getTime();
  const dataToEncrypt = JSON.stringify({ password, timestamp });
  return CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString();
}

export function verifyPassword(encryptedData: string): boolean {
  const decryptedData = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
  const { password, timestamp } = JSON.parse(decryptedData);

  const currentTime = new Date().getTime();
  const expirationTime = timestamp + nonceExpirationMinutes * 60 * 1000;

  if (currentTime > expirationTime) {
    return false; // Nonce has expired
  }

  // Add your password verification logic here
  return true;
}

export async function encryptData(data: string, base64SecretKey: string): Promise<string> {
  try {
    // Decode the Base64 secret key to raw bytes
    const secretKeyBytes = Uint8Array.from(atob(base64SecretKey), c => c.charCodeAt(0));

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

    // Convert to URL-safe Base64 (replace '+' with '-', '/' with '_', and remove padding)
    return btoa(String.fromCharCode(...encryptedBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

export async function encryptOTP(otp: string): Promise<string> {
  try {
    const encryptedOTP = await encryptData(otp, import.meta.env.VITE_OTP_SECRET_KEY);
    return encryptedOTP

  } catch (error) {
    console.error("Error:", error);
    return ''; // Return an empty string or handle the error appropriately
  }
}





export async function encryptPassword(data: any): Promise<string> {
  try {
    const encryptedPassword = await encryptData(data, secretKey);
    return encryptedPassword

  } catch (error) {
    console.error("Error:", error);
    return ''; // Return an empty string or handle the error appropriately
  }
}


