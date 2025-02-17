package com.microservices.user_service.service;

import com.microservices.user_service.utils.VerificationData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

// VerificationService.java
@Service
public class VerificationService {



    @Autowired
    private RedisTemplate<String, VerificationData> redisTemplate;

    private static final Duration EXPIRATION = Duration.ofMinutes(10);

    public void storeVerificationData(String email, VerificationData data) {
        redisTemplate.opsForValue().set(
                "verification:" + email,
                data,
                EXPIRATION
        );
    }

    public VerificationData getVerificationData(String email) {
        return redisTemplate.opsForValue().get("verification:" + email);
    }
}