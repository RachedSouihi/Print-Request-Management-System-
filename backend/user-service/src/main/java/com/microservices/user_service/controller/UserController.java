package com.microservices.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
//import com.microservices.api_gateway.utils.AESUtil;
import com.microservices.api_gateway.utils.AESUtil;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.EmailService;
import com.microservices.user_service.service.KafkaService;
import com.microservices.user_service.service.UserService;
import com.microservices.user_service.service.VerificationService;
import com.microservices.user_service.utils.VerificationCodeUtil;
import jakarta.annotation.security.PermitAll;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.PathParam;
import org.bouncycastle.jcajce.provider.symmetric.AES;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
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

    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;

    @Value("${app.secret.otp.key}")
    private String OTP_KEY;

    @Autowired
    public UserController(UserService userService, ObjectMapper objectMapper, EmailService emailService, KafkaService kafkaService, VerificationService verificationService) {
        this.userService = userService;
        this.emailService = emailService;
        this.objectMapper = objectMapper;
        this.kafkaService = kafkaService;
        this.verificationService = verificationService;
    }

    /**
     * Checks if a user exists by user ID.
     * @param user_id The ID of the user to check.
     * @return An Optional containing the user if found, otherwise empty.
     */
    @GetMapping
    public Optional<User> isUserExist(@RequestParam String user_id) {
        Optional<User> user = userService.findById(user_id);
        return user.isPresent() ? user : Optional.empty();
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


    @PostMapping("/auth/login")
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


                verificationService.saveTokens(user.getUserId(), access_token, refresh_token, 432000, 777600);


                ResponseCookie access_token_cookie = ResponseCookie.from("access_token", (String) tokens.get("access_token"))
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
    @PostMapping("/auth/signup")
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
    @PostMapping("/auth/verify-email")
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
    @PostMapping("/auth/resend-verif-email")
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
    @GetMapping("/auth/is-signed-in")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> signinPage(Authentication authentication) {
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
        System.out.println(email);
        String oldPassword = AESUtil.decrypt(request.get("oldPassword"), SECRET_KEY, ALGO);
        String newPassword = AESUtil.decrypt(request.get("newPassword"), SECRET_KEY, ALGO);

        System.out.println(oldPassword);
        System.out.println(newPassword);
        System.out.println(email);

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
    public String saveDoc(@RequestHeader HttpHeaders headers, @RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String docId = (String) request.get("documentId");
            userService.saveDocument(userId, docId);
            return "Document saved";
        } catch (Exception e) {
            return e.getMessage();
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
            return ResponseEntity.ok(userService.getUserWithSavedDocuments(userId));
        } catch (Exception e) {
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





    @GetMapping("/send-event")
    public ResponseEntity<?> sendEvent(@RequestHeader HttpHeaders header ,@RequestBody Map<String, Object> request) {

        String topic = (String) request.get("topic");

        Map<String, String> event = (Map<String, String>) request.get("event");


        try{
            return  ResponseEntity.ok(kafkaService.sendMessage(topic, event));

        }catch(Exception e){
            System.out.println(e.getMessage());

            return ResponseEntity.status(500).body(e.getMessage());
        }

    }

}




