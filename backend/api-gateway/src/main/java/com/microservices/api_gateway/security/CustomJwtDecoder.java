package com.microservices.api_gateway.security;


import com.microservices.api_gateway.utils.AESUtil;
import io.jsonwebtoken.JwtParser;
import org.bouncycastle.jcajce.provider.symmetric.AES;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

@Component
public class CustomJwtDecoder implements JwtDecoder {

    private final String secretKey;
    private final String algo;
    private final NimbusJwtDecoder jwtParser;

    public CustomJwtDecoder(
            @Value("${app.secret.key}") String secretKey,
            @Value("${app.encrytion.algo}") String algo) {
        this.secretKey = secretKey;
        this.algo = algo;
        this.jwtParser = NimbusJwtDecoder.withJwkSetUri("http://127.0.0.1:9000/realms/spring-microservices-security-realm/protocol/openid-connect/certs")
                .build();
    }


    @Override
    public Jwt decode(String encryptedToken) throws JwtException {

        System.out.println("Encrypted JWT : " + encryptedToken);
        try {

            if (encryptedToken.startsWith("Bearer ")) {
                encryptedToken = encryptedToken.substring(7); // Remove "Bearer " (7 characters)
            }
            // Step 1: Decrypt the token using your function
            String decryptedJwt = AESUtil.decrypt(encryptedToken, secretKey, algo);
            System.out.println("Decrypted JWT: " + decryptedJwt);
            // Step 2: Parse and validate the JWT
            return jwtParser.decode(decryptedJwt);
        } catch (Exception e) {
           System.out.println("Failed to decrypt and validate JWT");
        }
        return null;
    }


}
