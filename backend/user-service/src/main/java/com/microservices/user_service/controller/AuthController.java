package com.microservices.user_service.controller;


import com.microservices.api_gateway.security.CustomJwtDecoder;
import com.microservices.api_gateway.utils.AESUtil;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.user_service.service.AuthService;
import com.microservices.user_service.service.KeyCloakService;
import com.microservices.user_service.service.UserService;
import com.microservices.user_service.service.VerificationService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/user/auth")
public class AuthController {



    private final CustomJwtDecoder jwtDecoder;
    private final UserService userService;
    private final VerificationService verificationService;
    private final KeyCloakService keyCloakService;
    private final AuthService authService;


    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;


    public AuthController(CustomJwtDecoder jwtDecoder, UserService userService, VerificationService verificationService, KeyCloakService keyCloakService, AuthService authService) {
        this.jwtDecoder = jwtDecoder;
        this.userService = userService;
        this.verificationService = verificationService;
        this.keyCloakService = keyCloakService;
        this.authService = authService;
    }





    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestHeader HttpHeaders headers, @RequestBody Map<String, String> request, HttpServletResponse httpResponse) {
        try{
            String email = request.get("email");
            String password = AESUtil.decrypt(request.get("password"), SECRET_KEY, ALGO);
            //System.out.println("Decrypted password: " + AESUtil.decrypt(password, SECRET_KEY, ALGO));

            Map<String, Object> response =  userService.login(email, password);
            System.out.println(response);


            if(Integer.parseInt(response.get("code").toString()) == 200){

                UserDTO user = (UserDTO) response.get("data");
                Map<String, Object> tokens = (Map<String, Object>) response.get("tokens");

                String access_token =  AESUtil.encrypt((String)tokens.get("access_token"), SECRET_KEY, ALGO);

                String refresh_token = AESUtil.encrypt((String) tokens.get("refresh_token"), SECRET_KEY, ALGO);

                System.out.println("refresh token: " + access_token);

                verificationService.saveTokens(user.getUserId(), access_token, refresh_token, 432000, 777600);


                ResponseCookie access_token_cookie = ResponseCookie.from("access_token", access_token)
                        .httpOnly(true)
                        .sameSite("LAX")
                        .path("/")
                        .maxAge(Duration.ofDays(2))
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, access_token_cookie.toString());


                System.out.println("Response is ready");

                return ResponseEntity.ok(user);

            }else{
                return ResponseEntity.status(HttpStatusCode.valueOf((Integer) response.get("code"))).body(response.get("message"));

            }

        }catch (Exception e){
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());


        }

    }







    // AuthController.java
    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(
            @CookieValue(name = "access_token") String encryptedAccessToken,
            HttpServletResponse httpResponse
    ) {
        try {


            // Decode the token to check expiration
            Jwt jwt = jwtDecoder.decode(encryptedAccessToken);
            String userId = jwt.getSubject();

            // Check if the token is expired
            if (Objects.requireNonNull(jwt.getExpiresAt()).isBefore(Instant.now())) {

                System.out.println("Invalid access token");

                // Retrieve encrypted refresh token from Redis
                String encryptedRefreshToken = verificationService.getRefreshToken(userId);
                if (encryptedRefreshToken == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token not found");
                }

                // Decrypt the refresh token
                String refreshToken = AESUtil.decrypt(encryptedRefreshToken, SECRET_KEY, ALGO);

                // Get new tokens from Keycloak
                Map<String, String> newTokens = keyCloakService.refreshAccessToken(refreshToken);
                if (newTokens == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to refresh token");
                }

                // Encrypt new tokens
                String newAccessToken = newTokens.get("access_token");
                String newRefreshToken = newTokens.get("refresh_token");
                String encryptedNewAccessToken = AESUtil.encrypt(newAccessToken, SECRET_KEY, ALGO);
                String encryptedNewRefreshToken = AESUtil.encrypt(newRefreshToken, SECRET_KEY, ALGO);

                // Save new tokens in Redis
                verificationService.saveTokens(userId, encryptedNewAccessToken, encryptedNewRefreshToken, 432000, 777600);

                // Set the new access token in a cookie
                ResponseCookie newAccessTokenCookie = ResponseCookie.from("access_token", encryptedNewAccessToken)
                        .httpOnly(true)
                        .sameSite("LAX")
                        .path("/")
                        .maxAge(Duration.ofDays(2))
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, newAccessTokenCookie.toString());

                // Return the new access token
                return ResponseEntity.ok()
                        .body(Map.of(
                                "status", "refreshed",
                                "access_token", encryptedNewAccessToken
                        ));
            } else {

                System.out.println("Valid access token");
                // Token is still valid
                return ResponseEntity.ok().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication check failed: " + e.getMessage());
        }
    }



    @PostMapping("/save-chosen-subjects/{userId}")
    public ResponseEntity<String> saveChosenSubjects(
            @RequestHeader HttpHeaders headers,


            @PathVariable("userId") String userId,
            @RequestBody List<String> subjectNames) {

        try {
            System.out.println(userId);
            System.out.println(subjectNames);
            String result = authService.saveChosenSubjects(userId, subjectNames);
            if (result.startsWith("Error")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + e.getMessage());
        }
    }



}
