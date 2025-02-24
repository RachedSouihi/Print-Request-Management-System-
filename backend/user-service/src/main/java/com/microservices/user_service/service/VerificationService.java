package com.microservices.user_service.service;

import com.microservices.user_service.utils.VerificationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class VerificationService {

    @Autowired
    private RedisTemplate<String, VerificationData> redisTemplate;

    private static final Duration EXPIRATION = Duration.ofMinutes(10);  // Expiration de 10 minutes pour l'OTP

    // Stocker les données de vérification dans Redis
    public void storeVerificationData(String email, VerificationData data) {
        String key = "verification:" + email;
        redisTemplate.opsForValue().set(key, data, EXPIRATION);  // Stockage avec expiration
        System.out.println("✅ Données de vérification stockées pour l'email : " + email);
    }

    // Récupérer les données de vérification depuis Redis
    public VerificationData getVerificationData(String email) {
        String key = "verification:" + email;
        VerificationData data = redisTemplate.opsForValue().get(key);

        if (data == null) {
            System.out.println("❌ Aucune donnée trouvée dans Redis pour cet email.");
        }
        return data;
    }

    // Générer et stocker un OTP dans Redis
    public void generateAndStoreOtp(String email, String password) {
        // Générer un OTP aléatoire de 4 chiffres
        String generatedOtp = String.format("%04d", (int)(Math.random() * 10000));

        // Hacher le mot de passe
        String hashedPassword = password; // Vous pouvez ajouter un algorithme de hachage comme BCrypt ici.

        // Créer un objet VerificationData
        VerificationData data = new VerificationData();
        data.setCode(generatedOtp);
        data.setHashedPassword(hashedPassword);

        // Stocker l'OTP et les autres données de vérification
        storeVerificationData(email, data);
        System.out.println("✅ OTP généré et stocké pour l'email : " + email);
    }
}
