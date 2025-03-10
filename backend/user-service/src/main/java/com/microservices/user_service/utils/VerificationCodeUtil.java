package com.microservices.user_service.utils;

import java.security.SecureRandom;

public class VerificationCodeUtil {

    /**
     *
     */
    public static String generateVerificationCode(int length) {
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
        }
        return code.toString();
    }
}
