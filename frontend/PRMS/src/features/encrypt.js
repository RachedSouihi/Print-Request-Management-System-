import CryptoJS from "crypto-js";

const secretKey = "iVaZb2Ismz/f8OjUNhpLkSbQkLsjhWiwT4TaXUJIwbVA=" //import.meta.env.VITE_SECRET_KEY;
const nonceExpirationMinutes = 1; // Set the expiration time for the nonce

export default function hashPassword(password) {
  const timestamp = new Date().getTime();
  const dataToEncrypt = JSON.stringify({ password, timestamp });
  return CryptoJS.AES.encrypt(dataToEncrypt, secretKey).toString();
}

function verifyPassword(encryptedData) {
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

//console.log(hashPassword("myPassword"));


async function generateAESKey(keyLength = 256) {
  try {
    // Generate an AES key
    const key = await crypto.subtle.generateKey(
      {
        name: "AES-CBC", // AES encryption mode
        length: keyLength, // Key length: 128, 192, or 256 bits
      },
      true, // Whether the key is extractable
      ["encrypt", "decrypt"] // Key usages
    );

    // Export the key in raw format (optional)
    const rawKey = await crypto.subtle.exportKey("raw", key);
    console.log("Generated AES Key (raw):", new Uint8Array(rawKey));

    // Convert the raw key to a hexadecimal string (optional)
    const hexKey = Array.from(new Uint8Array(rawKey))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    console.log("Generated AES Key (hex):", hexKey);

    return key;
  } catch (error) {
    console.error("Error generating AES key:", error);
  }
}

// Example usage
//console.log(generateAESKey(256)); // Generate a 256-bit AES key


async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(16)); // Initialization vector

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    encodedData
  );

  return { encrypted, iv };

}


async function fn() {
  const key = await generateAESKey(256);

  const { encrypted, iv } = await encryptData('hello', key)
  console.log("Encrypted Data:", new Uint8Array(encrypted));
}


async function generateAESKey2() {
  const key = await crypto.subtle.generateKey(
      {
          name: "AES-GCM",
          length: 256, // AES-256 (32 bytes)
      },
      true, // Exportable key
      ["encrypt", "decrypt"]
  );

  // Export the key as raw bytes
  const exportedKey = await crypto.subtle.exportKey("raw", key);

  // Convert the raw key to a Base64 string
  const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

  console.log("Generated AES Key (Base64):", base64Key);

  return base64Key; // Send this to the backend
}

// Example usage
generateAESKey2().then((key) => console.log("Use this key in backend:", key));
