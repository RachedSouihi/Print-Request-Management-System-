package com.microservices.user_service.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.EmailService;
import com.microservices.user_service.service.UserService;
import com.microservices.user_service.service.VerificationService;
import com.microservices.user_service.utils.AESUtil;
import com.microservices.user_service.utils.VerificationCodeUtil;
import com.microservices.user_service.utils.VerificationData;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;

@RestController
@EnableJpaRepositories(basePackages = "com.microservices.common-models.repository")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequestMapping("/user")
public class UserController {

    private final ObjectMapper objectMapper;





    private final EmailService emailService;


    private final UserService userService;

    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private final VerificationService verificationService;

    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;


    @Autowired
    public UserController(UserService userService, ObjectMapper objectMapper, EmailService emailService, VerificationService verificationService) {
        this.userService = userService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.verificationService = verificationService;
    }



    @GetMapping("/generate-secret-key")
    public ResponseEntity<?> generateSecretKey() throws Exception {

        String secret_key = AESUtil.generateSecretKeyBase64();

        // In Spring Boot
        //byte[] keyBytes = Base64.getDecoder().decode(SECRET_KEY);
        //System.out.println("Key length: " + keyBytes.length + " bytes"); // Should print "32"

        return ResponseEntity.ok(secret_key);
    }


    @GetMapping("check-pwd")
    public ResponseEntity<String> login(@RequestBody Map<String, String> request) {

        try {
            // Decrypt the payload
            String encryptedPayload = request.get("encryptedPayload");
            String decryptedPayload = AESUtil.decrypt(encryptedPayload, SECRET_KEY, ALGO);

            // Parse the decrypted JSON
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> payloadMap = objectMapper.readValue(decryptedPayload, HashMap.class);

            // Extract the password and timestamp
            String password = (String) payloadMap.get("password");
            long timestamp = (long) payloadMap.get("timestamp");

            // Validate the timestamp
            long currentTime = new Date().getTime();
            long timeDifference = currentTime - timestamp;
            long expirationMillis = 1 * 60 * 1000;

            if (timeDifference > expirationMillis) {
                return ResponseEntity.status(401).body("Payload expired");
            }else{
                return  ResponseEntity.ok("Payload valid");
            }

            // Proceed with password validation (e.g., hash and compare with the database)


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Decryption failed");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> request, HttpServletResponse response) {
        try {

            ObjectMapper mapper = new ObjectMapper();



            String otp = mapper.convertValue(request.get("otp"), String.class);


            User user = mapper.convertValue(request.get("user"), User.class);

            VerificationData data = verificationService.getVerificationData(user.getEmail());

            user.setPassword(data.getHashedPassword());
            System.out.println("third line success:");





            if(otp.equals(data.getCode())) {
                Map<String,Object> tokens = userService.signUp(user);
                ResponseCookie cookie1 = ResponseCookie.from("token", tokens.get("access_token").toString())
                        .httpOnly(true)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(Duration.ofDays(2))
                        .build();


                ResponseCookie cookie2 = ResponseCookie.from("token", tokens.get("access_token").toString())
                        .httpOnly(true)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(Duration.ofDays(10))
                        .build();



                response.addHeader(HttpHeaders.SET_COOKIE, cookie1.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, cookie2.toString());



                return ResponseEntity.ok().body("Login successful");



            }

            return ResponseEntity.status(401).body("Invalid otp");







        } catch (Exception e) {

            return ResponseEntity.ok().body(e.getMessage());

        }

    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) throws MessagingException {

        System.out.println("Starting email verification");
        String email = request.get("email");
        String password = request.get("password");

        System.out.println(email);
        System.out.println(password);

        VerificationData data = new VerificationData();
        data.setCode(VerificationCodeUtil.generateVerificationCode(4));
        data.setEmail(email);
        data.setHashedPassword(bCryptPasswordEncoder.encode(password));

        verificationService.storeVerificationData(email, data);

        emailService.sendVerificationEmail(data.getEmail(), data.getCode(), request.get("firstname"));
        return ResponseEntity.ok("Email sent");
    }


    @GetMapping("/signed-in")
    public String signinPage(Authentication authentication) {
        // If there's no authentication or if it's anonymous, treat as not signed in.
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            // The user is not signed .
            return "not signed in";
        }
        // Otherwise, the user is signed in.
        return "signed in";
    }








}




