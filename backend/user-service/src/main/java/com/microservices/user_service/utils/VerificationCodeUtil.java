package com.microservices.user_service.utils;

import java.security.SecureRandom;

public class VerificationCodeUtil {
    // Define the characters you want to include in your verification code.
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generates a secure random verification code.
     *
     * @param length The desired length of the code.
     * @return A randomly generated code.
     */
    public static String generateVerificationCode(int length) {
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        return code.toString();
    }
}
