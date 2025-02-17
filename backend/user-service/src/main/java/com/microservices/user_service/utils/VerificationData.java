package com.microservices.user_service.utils;
import lombok.Data;

@Data
public class VerificationData {
    private String code;
    private String email;
    private String hashedPassword;
}