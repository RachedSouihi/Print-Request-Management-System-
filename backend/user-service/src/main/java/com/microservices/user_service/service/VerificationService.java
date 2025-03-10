package com.microservices.user_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class VerificationService {






    @Autowired
    private RedisTemplate<String, String> otpRedisTemplate;

    @Autowired
    private RedisTemplate<String, String> passwordRedisTemplate;

    @Autowired
    private RedisTemplate<String, String> tokensRedisTemplate;


    private static final Duration OTP_EXPIRATION = Duration.ofMinutes(1);



    public void saveTokens(String userId, String accessToken, String refreshToken, long accessExpiry, long refreshExpiry) {
        tokensRedisTemplate.opsForValue().set(accessToken, refreshToken, accessExpiry, TimeUnit.NANOSECONDS);
        tokensRedisTemplate.opsForValue().set("REFRESH_TOKEN_" + userId, refreshToken, refreshExpiry, TimeUnit.SECONDS);

    }

    public String getAccessToken(String userId) {
        return tokensRedisTemplate.opsForValue().get("ACCESS_TOKEN_" + userId);
    }

    public String getRefreshToken(String userId) {
        return tokensRedisTemplate.opsForValue().get("REFRESH_TOKEN_" + userId);
    }

    public void deleteTokens(String userId) {
        tokensRedisTemplate.delete("ACCESS_TOKEN_" + userId);
        tokensRedisTemplate.delete("REFRESH_TOKEN_" + userId);
    }


    public void storeOtp(String email, String otp) {
        otpRedisTemplate.opsForValue().set("otp:" + email, otp, OTP_EXPIRATION);
    }


    public void storePassword(String email, String password) {
        passwordRedisTemplate.opsForValue().set(
                "verification:" + email,
                password
        );
    }

    public String getPassword(String email) {
        return passwordRedisTemplate.opsForValue().get("verification:" + email);
    }

    public String getOtp(String email) {
        return otpRedisTemplate.opsForValue().get("otp:" + email);
    }





    public Map<String, Object> isOtpValid(String email, String otp) {

        Map<String, Object> response = new HashMap<>();

        String storedOtp = getOtp(email);

        if(storedOtp == null) {

            response.put("status", 401);
            response.put("message", "OTP not valid");


        }else if(storedOtp.equals(otp)){
            response.put("status", 200);
        }else{
            response.put("status", 403);
            response.put("message", "Wrong OTP");
        }


        return response;
    }
}
