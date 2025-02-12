import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_SECRET_KEY;
const nonceExpirationMinutes = 2; // Set the expiration time for the nonce

export default function hashPassword(password: string): string {
  const timestamp = new Date().getTime();
  const dataToEncrypt = JSON.stringify({ password, timestamp });
  return CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString();
}

function verifyPassword(encryptedData: string): boolean {
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


