package com.microservices.user_service.utils;
import lombok.Data;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import static org.bouncycastle.cms.RecipientId.password;

@Data
public class VerificationData {
    private String code;
    private String email;
    private String hashedPassword;
   // private String password;

   // public String getHashedPassword() {
       // if (password == null) {
          //  throw new NullPointerException("Le mot de passe est null !");
       // }
       // try {
         //   MessageDigest digest = MessageDigest.getInstance("SHA-256");
         //   byte[] hashedBytes = digest.digest(password.getBytes());
          //  return Base64.getEncoder().encodeToString(hashedBytes);
       // } catch (NoSuchAlgorithmException e) {
        //    throw new RuntimeException("Erreur lors du hachage du mot de passe", e);
       // }
   // }

}