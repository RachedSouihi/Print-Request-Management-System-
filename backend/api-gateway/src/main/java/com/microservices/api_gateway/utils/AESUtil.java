package com.microservices.api_gateway.utils;



import org.springframework.beans.factory.annotation.Value;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

public class AESUtil {

    public static String encrypt(String plaintext, String secretKey, String algorithm) throws Exception {
        // 1. Decode the secret key from Base64
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);

        // 2. Validate key length (16, 24, or 32 bytes)
        if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
            throw new IllegalArgumentException("Invalid AES key length: " + keyBytes.length + " bytes");
        }

        // 3. Generate a secure random IV (16 bytes for AES-CBC)
        byte[] iv = new byte[16];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(iv);

        // 4. Initialize cipher with IV and key
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv));

        // 5. Encrypt the plaintext
        byte[] encryptedBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

        // 6. Combine IV + ciphertext into a single byte array
        byte[] combined = new byte[iv.length + encryptedBytes.length];
        System.arraycopy(iv, 0, combined, 0, iv.length);
        System.arraycopy(encryptedBytes, 0, combined, iv.length, encryptedBytes.length);

        // 7. Encode to URL-safe Base64 without padding (matches your decrypt logic)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(combined);
    }





    public static String decrypt(String encryptedData, String secretKey, String algorithm) throws Exception {

        // 1. Convert URL-safe Base64 to standard Base64 and add padding
        String base64Data = encryptedData
                .replace('-', '+')
                .replace('_', '/');

        // Pad with '=' to make length a multiple of 4
        int padding = (4 - (base64Data.length() % 4)) % 4;
        base64Data += "=".repeat(padding);

        // 2. Decode the Base64 data
        byte[] encryptedBytes = Base64.getDecoder().decode(base64Data);

        // 3. Extract IV (first 16 bytes) and ciphertext
        byte[] iv = new byte[16];
        System.arraycopy(encryptedBytes, 0, iv, 0, iv.length);
        byte[] ciphertext = new byte[encryptedBytes.length - iv.length];
        System.arraycopy(encryptedBytes, iv.length, ciphertext, 0, ciphertext.length);

        // 4. Decode the secret key
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);

        // 5. Validate key length (must be 16, 24, or 32 bytes)
        if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
            throw new IllegalArgumentException("Invalid AES key length: " + keyBytes.length + " bytes");
        }

        // 6. Initialize cipher with IV
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(iv));

        // 7. Decrypt the data
        byte[] decryptedBytes = cipher.doFinal(ciphertext);
        return new String(decryptedBytes, "UTF-8");
    }




    public static String generateSecretKeyBase64() throws Exception {
        // Initialize AES KeyGenerator with 256-bit key length
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(256); // 256-bit key
        SecretKey secretKey = keyGenerator.generateKey();

        // Convert the key to a Base64-encoded string
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }

    public static String generateSecretKey(int keySize, String algorithm) throws Exception {

        // Initialize the KeyGenerator for AES
        KeyGenerator keyGenerator = KeyGenerator.getInstance(algorithm);
        keyGenerator.init(keySize); // Set the key size

        // Generate the secret key
        SecretKey secretKey = keyGenerator.generateKey();

        // Encode the key in Base64 for easy storage and transmission
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}




