package com.microservices.user_service.utils;



import java.security.SecureRandom;

public class VerificationCodeUtil {

    private static final String DIGITS = "0123456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Génère un code de vérification composé uniquement de chiffres.
     *
     * @param length La longueur souhaitée du code.
     * @return Le code de vérification généré.
     */
    public static String generateVerificationCode(int length) {
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(DIGITS.length());
            code.append(DIGITS.charAt(index));
        }
        return code.toString();
    }
}
