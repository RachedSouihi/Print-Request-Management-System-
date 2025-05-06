package com.microservices.api_gateway.filter;

import com.microservices.api_gateway.utils.AESUtil;
import io.jsonwebtoken.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    @Value("${keycloak.publickey}")
    private String publicKeyString; // PEM encoded public key

    // AES decryption properties (add these to your application.properties)
    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;
    


    private final String authCookieName = "access_token"; // Your cookie name

    // Resolve token from header or cookie and then decrypt it.
    public String resolveToken(HttpServletRequest request) throws Exception {
        String token = null;
        // First, check for an Authorization header.
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            token = bearerToken.substring(7);
        } else {
            // Otherwise, check the cookies.
            Cookie[] cookies = request.getCookies();
            System.out.println(Arrays.toString(cookies));
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (authCookieName.equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }

        System.out.println("ACCESS_TOKEN: "+ token);
        try {
            return AESUtil.decrypt(token, SECRET_KEY, ALGO);

        }catch (Exception e) {

            return token;
        }
    }

    // Convert PEM String to PublicKey
    private PublicKey getPublicKey() {
        try {
            String publicKeyPEM = publicKeyString
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] decoded = Base64.getDecoder().decode(publicKeyPEM);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            return keyFactory.generatePublic(keySpec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse public key", e);
        }
    }

    // Validate JWT (expiration, signature, etc.)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getPublicKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            throw new JwtException("Expired JWT", e);
        } catch (UnsupportedJwtException | MalformedJwtException | SignatureException | IllegalArgumentException e) {
            throw new JwtException("Invalid JWT: " + e.getMessage(), e);
        }
    }

    // Extract authentication details from the token
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getPublicKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        String username = claims.getSubject();

        // Extract roles from "realm_access.roles"
        Map<String, Object> realmAccess = claims.get("realm_access", Map.class);
        List<String> roles = (realmAccess != null) ?
                (List<String>) realmAccess.get("roles") :
                List.of();

        List<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(username, null, authorities);
    }
}
