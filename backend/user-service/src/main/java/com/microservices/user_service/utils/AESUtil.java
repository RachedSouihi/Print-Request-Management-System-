package com.microservices.user_service.utils;


import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESUtil {

    private static final String ALGORITHM = "AES";

    public static String decrypt(String encryptedData, String secretKey) throws Exception {
        // Decode the secret key
        byte[] keyBytes = secretKey.getBytes("UTF-8");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, ALGORITHM);

        // Initialize the cipher
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, keySpec);

        // Decode and decrypt the data
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedData);
        byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

        return new String(decryptedBytes, "UTF-8");
    }

    public static String generateSecretKeyBase64() throws Exception {
        KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
        keyGenerator.init(256); // Use 256-bit key for strong security
        SecretKey secretKey = keyGenerator.generateKey();

        // Convert the key to Base64 format
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }
}