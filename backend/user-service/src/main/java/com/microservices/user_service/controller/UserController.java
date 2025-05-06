package com.microservices.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.api_gateway.utils.AESUtil;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.*;
import com.microservices.user_service.utils.VerificationCodeUtil;
import jakarta.annotation.security.PermitAll;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.PathParam;
import org.bouncycastle.jcajce.provider.symmetric.AES;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * UserController handles all user-related operations such as signup, login, profile updates, and document management.
 */
@RestController
@EnableJpaRepositories(basePackages = "com.microservices.common-models.repository")
@RequestMapping("/user")
public class UserController {


    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final KafkaService kafkaService;
    private final UserService userService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
    private final VerificationService verificationService;
    private final KeyCloakService keyCloakService;

    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;

    @Value("${app.secret.otp.key}")
    private String OTP_KEY;

    @Autowired
    public UserController(UserService userService, ObjectMapper objectMapper, EmailService emailService, KafkaService kafkaService, VerificationService verificationService, KeyCloakService keyCloakService) {
        this.userService = userService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.kafkaService = kafkaService;
        this.verificationService = verificationService;
        this.keyCloakService = keyCloakService;
    }

    /**
     * Checks if a user exists by user ID.
     * @param user_id The ID of the user to check.
     * @return An Optional containing the user if found, otherwise empty.
     */

    @GetMapping
    public Optional<?> isUserExist(@RequestParam String user_id) {
        Optional<User> user = userService.findById(user_id);


        if(user.isPresent()) {

            User u = new User();

            u.setUser_id(user_id);

            return Optional.of(u);
        }


        return Optional.empty();


    }



    @PostMapping("/add-user")
    public ResponseEntity<?> addUser(@RequestBody Map<String, Object> payload) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            User user = mapper.convertValue(payload.get("user"), User.class);
            User savedUser = userService.addUser(user);
            return savedUser != null
                    ? ResponseEntity.status(HttpStatus.CREATED).body(savedUser)
                    : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User creation failed");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    @GetMapping("/get-all-users")
    //@PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> getAllUsers() {
        try{

            return ResponseEntity.ok(userService.getAllUsers());

        }catch(Exception e){

            return ResponseEntity.status(500).body(e.getMessage());

        }


    }

    /**
     * Generates a new secret key.
     * @return The generated secret key.
     * @throws Exception If an error occurs during key generation.
     */
    @GetMapping("/generate-secret-key")
    public ResponseEntity<?> generateSecretKey() throws Exception {
        String secret_key = AESUtil.generateSecretKeyBase64();
        return ResponseEntity.ok(secret_key);
    }








    /**
     * Validates the encrypted password payload.
     * @param request The request containing the encrypted payload.
     * @return A response indicating whether the payload is valid or expired.
     */
    @GetMapping("check-pwd")
    public ResponseEntity<String> checkPWD(@RequestBody Map<String, String> request) {
        try {
            String encryptedPayload = request.get("encryptedPayload");
            String decryptedPayload = AESUtil.decrypt(encryptedPayload, SECRET_KEY, ALGO);
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> payloadMap = objectMapper.readValue(decryptedPayload, HashMap.class);
            String password = (String) payloadMap.get("password");
            long timestamp = (long) payloadMap.get("timestamp");
            long currentTime = new Date().getTime();
            long timeDifference = currentTime - timestamp;
            long expirationMillis = 1 * 60 * 1000;

            if (timeDifference > expirationMillis) {
                return ResponseEntity.status(401).body("Payload expired");
            } else {
                return ResponseEntity.ok("Payload valid");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Decryption failed");
        }
    }

    @GetMapping("/get-access-token")
    public ResponseEntity<?> getAccessToken(@RequestHeader HttpHeaders headers, @RequestParam String userId) {


        return ResponseEntity.ok(verificationService.getAccessToken(userId));
    }
    @GetMapping("/get-refresh-token")
    public ResponseEntity<?> getRefreshToken(@RequestHeader HttpHeaders headers, @RequestParam String userId) {


        return ResponseEntity.ok(verificationService.getRefreshToken(userId));
    }

    @PostMapping("/save-access-token")
    public ResponseEntity<?> saveAccessToken(@RequestHeader HttpHeaders headers, @RequestParam String userId ,@RequestParam String accessToken) {

        try{
            verificationService.saveAccessToken(userId, accessToken);

            return ResponseEntity.ok("Success");

        }catch (Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @GetMapping("/get-tokens")

    public ResponseEntity<?> getTokens(@RequestHeader HttpHeaders headers, @RequestParam String user_id) {

        try{
            String token= verificationService.getAccessToken(user_id);
            System.out.println("access_token is :"  + token);
            return ResponseEntity.ok(token);

        }catch (Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

    /**
     * Handles user signup.
     * @param request The signup request containing user details and OTP.
     * @param httpResponse The HTTP response.
     * @return A response indicating the result of the signup process.
     */
    @PostMapping("/auth0/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> request, HttpServletResponse httpResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String otp = mapper.convertValue(request.get("otp"), String.class);

            System.out.println("encrypted otp: " + otp);

            otp = AESUtil.decrypt(otp, OTP_KEY, ALGO);

            System.out.println("dectypted otp: " + otp);


            User user = mapper.convertValue(request.get("user"), User.class);

            String decryptedJson = AESUtil.decrypt(
                    verificationService.getPassword(user.getEmail()),
                    SECRET_KEY,
                    ALGO
            );

            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, String> decryptedPasswdMap = objectMapper.readValue(decryptedJson, Map.class);

            String password = decryptedPasswdMap.get("passwd"); // Extracting the password




            user.setPassword(
                    password
            );
            Map<String, Object> otpResponse = verificationService.isOtpValid(user.getEmail(), otp);
            if ((int) otpResponse.get("status") == 200) {
                System.out.println("OTP valid");
                Map<String, Object> response = userService.signUp(user, bCryptPasswordEncoder);
                System.out.println(response);

                Map<String, Object> tokens = (Map<String, Object>) response.get("tokens");

                String access_token = (String) tokens.get("access_token");


                user = mapper.convertValue(response.get("user"), User.class);

                user.setPassword(null);
                tokens.put("access_token", AESUtil.encrypt(access_token, SECRET_KEY, ALGO));
                //tokens.put("refresh_token", AESUtil.encrypt((String) tokens.get("refresh_token"), SECRET_KEY, ALGO));
                verificationService.saveTokens(user.getUser_id(), (String) tokens.get("access_token"), (String) tokens.get("refresh_token"), 432000, 777600);
                ResponseCookie access_token_cookie = ResponseCookie.from("access_token", (String) tokens.get("access_token"))
                        .httpOnly(true)
                        .sameSite("LAX")
                        .path("/")
                        .maxAge(Duration.ofDays(2))
                        .build();
                httpResponse.addHeader(HttpHeaders.SET_COOKIE, access_token_cookie.toString());
                return ResponseEntity.ok().body(user);
            }
            return ResponseEntity.status((int) otpResponse.get("status")).body(otpResponse.get("message"));
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }



    /**
     * Verifies an encrypted JWT token.
     * @param encrypted_token The encrypted token.
     * @return The decrypted token.
     */
    @GetMapping("/decode-jwt")
    public String verify(@RequestHeader HttpHeaders headers ,@RequestParam String encrypted_token) {
        System.out.println(encrypted_token);
        try {
            return AESUtil.decrypt(encrypted_token, SECRET_KEY, ALGO);
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    /**
     * Sends a verification email with OTP.
     * @param request The request containing email and password.
     * @return A response indicating the result of the email sending process.
     * @throws MessagingException If an error occurs during email sending.
     */
    @PostMapping("/auth0/verify-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) throws Exception {
        String email = request.get("email");
        String password = request.get("password");
        String otp = VerificationCodeUtil.generateVerificationCode(4);
        verificationService.storeOtp(email, otp);
        verificationService.storePassword(email, password);
        emailService.sendVerificationEmail(email, otp, request.get("firstname"));
        return ResponseEntity.ok("Email sent");
    }







    /**
     * Resends the verification email with OTP.
     * @param request The request containing email.
     * @return A response indicating the result of the email sending process.
     * @throws MessagingException If an error occurs during email sending.
     */
    @PostMapping("/auth0/resend-verif-email")
    public ResponseEntity<?> reSendCode(@RequestBody Map<String, String> request) throws MessagingException {
        try {
            String email = request.get("email");
            String otp = VerificationCodeUtil.generateVerificationCode(4);
            verificationService.storeOtp(email, otp);
            emailService.sendVerificationEmail(email, otp, request.get("firstname"));
            return ResponseEntity.ok("Email sent");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    /**
     * Checks if the user is signed in.
     * @param authentication The authentication object.
     * @return A response indicating whether the user is signed in.
     */
    @GetMapping("/auth0/check-auth")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> signinPage(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/auth0/check-role")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> checkRole(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok().build();
    }





    /**
     * Updates the user profile.
     * @param request The request containing profile details.
     * @return A response indicating the result of the profile update.
     */
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
        System.out.println(request);

        try {
            Map<String, Object> response = userService.updateProfile(request);

            System.out.println(response);
            return ResponseEntity.status((int) response.get("code")).body(response.get("user"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    /**
     * Updates the user password.
     * @param request The request containing email, old password, and new password.
     * @return A response indicating the result of the password update.
     * @throws Exception If an error occurs during password update.
     */
    @PutMapping("/update-password")
    public ResponseEntity<?> up(@RequestHeader HttpHeaders headers ,@RequestBody Map<String, String> request) throws Exception {
       try{
        String email = request.get("email");
        String oldPassword = AESUtil.decrypt(request.get("oldPassword"), SECRET_KEY, ALGO);
        String newPassword = AESUtil.decrypt(request.get("newPassword"), SECRET_KEY, ALGO);


            Map<String, Object> response = userService.updatePassword(email, oldPassword, newPassword, bCryptPasswordEncoder);
            return ResponseEntity.status(Integer.parseInt((String) response.get("code"))).body(response.get("message").toString());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    /**
     * Adds a document.
     * @param headers The HTTP headers.
     * @return A response indicating the result of the document addition.
     */
    @PostMapping("/add-doc")
    public ResponseEntity<?> addDoc(@RequestHeader HttpHeaders headers) {
        return ResponseEntity.ok().body("Document added");
    }

    /**
     * Saves a document.
     * @param headers The HTTP headers.
     * @param request The request containing user ID and document ID.
     * @return A response indicating the result of the document saving process.
     */
    @PostMapping("/save-doc")
    public ResponseEntity<?> saveDoc(@RequestHeader HttpHeaders headers, @RequestBody Map<String, Object> request) {
        try {
            System.out.println("Saving docs");
            String userId = (String) request.get("userId");


            System.out.println("UserID: " + userId);

            String docId = (String) request.get("documentId");
            System.out.println("DocId: " + docId);

            long date_milliseconds = (long) request.get("date_milliseconds");

            System.out.println("TIMESTAMP: " + date_milliseconds);


            //boolean kafkaResponse = kafkaService.sendEvent("inputtopic" ,userId, docId, "save", date_milliseconds);
            String response = userService.toggleSaveDocument(userId, docId);

            if(response != null){
                return ResponseEntity.ok().body(response);
            }
            return ResponseEntity.status(500).body("Save document failed");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/send-kafka-event")
    public boolean sendKafkaEvent(@RequestHeader HttpHeaders headers, @RequestBody Map<String, String> request) {

        try{

            String topic = request.get("topic");
            String userId = request.get("userId");

            String docId = request.get("docId");

            String eventType = request.get("eventType");


            long timestamp = System.currentTimeMillis();



            return  kafkaService.sendEvent(topic ,userId, docId, eventType, timestamp);




        }catch (Exception e) {


            return false;

        }
    }


    /**
     * Retrieves saved documents for a user.
     * @param userId The ID of the user.
     * @return A response containing the saved documents.
     */
    @GetMapping("/saved-docs")
    public ResponseEntity<?> getSavedDocs(@RequestParam("userId") String userId) {
        try {
            return ResponseEntity.ok(userService.getSavedDocuments(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/track-doc-click")


    public ResponseEntity<?> trackDocClick(@RequestHeader HttpHeaders headers, @RequestBody Map<String, String> request) {

        try{
            String userId = request.get("userId");

            String docId = request.get("docId");

            boolean kafkaResponse = kafkaService.sendEvent("inputtopic" ,userId, docId, "click", System.currentTimeMillis());

            if(kafkaResponse){
                return ResponseEntity.ok().build();

            }else{

                return ResponseEntity.status(500).build();

            }
        }catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());

        }

    }


    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@RequestHeader HttpHeaders headers, @PathVariable("userId") String userId) {

        System.out.println("USer id: " + userId);
        try{

            return ResponseEntity.ok(
                    userService.getUserInformations(userId)
            );

        }catch (Exception e) {

            return ResponseEntity.status(500).body(e.getMessage());
        }

    }






}




