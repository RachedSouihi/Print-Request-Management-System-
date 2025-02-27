package com.microservices.user_service.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.api_gateway.utils.AESUtil;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.EmailService;
import com.microservices.user_service.service.UserService;
import com.microservices.user_service.service.VerificationService;
import com.microservices.user_service.utils.VerificationCodeUtil;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.Response;
import org.keycloak.jose.jwe.JWE;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;

@RestController
@EnableJpaRepositories(basePackages = "com.microservices.common-models.repository")
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


    @GetMapping
    public Optional<User> isUserExist(@RequestParam String user_id) {
        Optional<User> user = userService.findById(user_id);
        return user.isPresent() ? user : Optional.empty();
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

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> request, HttpServletResponse response) {
        try {

            ObjectMapper mapper = new ObjectMapper();



            String otp = mapper.convertValue(request.get("otp"), String.class);
            
            otp = AESUtil.decrypt(otp, "ch7ZwAD0MfdSebCtrn7c9Gsneg/JqNxtwY5qCaFU1T8=", ALGO);

            User user = mapper.convertValue(request.get("user"), User.class);


            user.setPassword(verificationService.getPassword(user.getEmail()));


            System.out.println("email: " + user.getEmail());
            System.out.println("Password: " + user.getPassword());





            Map<String, Object> otpResponse = verificationService.isOtpValid(user.getEmail() ,otp);
            if((int)otpResponse.get("status") == 200) {
                Map<String,Object> tokens = userService.signUp(user);



                System.out.println("TOKENS: " + tokens);

                user.setUser_id((String) tokens.get("user_id"));
                tokens.put("access_token", AESUtil.encrypt( (String)tokens.get("access_token"), SECRET_KEY, ALGO));
                tokens.put("refresh_token", AESUtil.encrypt( (String)tokens.get("refresh_token"), SECRET_KEY, ALGO));

                ResponseCookie access_token_cookie = ResponseCookie.from("access_token", (String)tokens.get("access_token"))
                        .httpOnly(true)
                        .sameSite("LAX")
                        .path("/")
                        .maxAge(Duration.ofDays(2))
                        .build();


                ResponseCookie refresh_token_cookie = ResponseCookie.from("refresh_token",(String) tokens.get("refersh_token"))
                        .httpOnly(true)
                        .sameSite("LAX")
                        .path("/")
                        .maxAge(Duration.ofDays(3))
                        .build();



                response.addHeader(HttpHeaders.SET_COOKIE, access_token_cookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, refresh_token_cookie.toString());



                return ResponseEntity.ok().body(user);



            }


            return ResponseEntity.status((int)otpResponse.get("status")).body(otpResponse.get("message"));







        } catch (Exception e) {

            System.out.println(e.getMessage());

            return ResponseEntity.status(500).body(e.getMessage());

        }

    }

    @PostMapping("/test")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> test(@RequestBody Map<String, Object> request, HttpServletResponse response) {

        return ResponseEntity.ok("Hello World");
    }

    @GetMapping("/decode-jwt")
    public String verify(@RequestParam String encrypted_token) {
    try {

        return AESUtil.decrypt(encrypted_token, SECRET_KEY, ALGO);
        //return AESUtil.encrypt("eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJqMS1RSFhNczZLb041T1QzVGpwN2VmQmhfQmdGTk9HaUJUS20wRzNyUDF3In0.eyJleHAiOjE3Mzk4NjE3NDksImlhdCI6MTczOTgyNTc0OSwianRpIjoiNzIxM2JjNjAtNjk1YS00MmNkLTg3NzUtYWM0Y2ExNGMzYWE3IiwiaXNzIjoiaHR0cDovLzEyNy4wLjAuMTo5MDAwL3JlYWxtcy9zcHJpbmctbWljcm9zZXJ2aWNlcy1zZWN1cml0eS1yZWFsbSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJiOWZjYThjZi03OGExLTQ0MmItOWIxOS04NzQ3OGU4Mjc4OTEiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzcHJpbmctY2xpZW50LWNyZWRlbnRpYWxzLWlkIiwic2lkIjoiMmZhZDEwYzYtNGEwNi00MTU3LWJkZjctYTcwMGY1ZGY3ZTE5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJ1cm46aWV0Zjp3ZzpvYXV0aDoyLjA6b29iIiwiaHR0cDovLzEyNy4wLjAuMTozMDAwL2NhbGxiYWNrIiwiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1zcHJpbmctbWljcm9zZXJ2aWNlcy1zZWN1cml0eS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVuY3J5cHRlZC10b2tlbnMgZW1haWwiLCJ0b2NuIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1zcHJpbmctbWljcm9zZXJ2aWNlcy1zZWN1cml0eS1yZWFsbSIsImFkbWluIiwidW1hX2F1dGhvcml6YXRpb24iXSwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6InJhY2hlZC5zb3VpaGlAZ21haWwuY29tIn0.bXpp5RQ2HTX4xxviug6Z_AwTPiey1L21DZ6VEbKu3McixHU-CWiOhVo7_6yaw7I9JShxB1xq8xbDjNkVZJGV-wBIHPQvG7pEqXC5TWyQgLcBSAugKMXa5qUdl6GwFVjrw4hXdyUeEEJQ2I4sXWfojS2JpGZ3niGsstN0DOEdt9srgZO32CFhAoS6ATl1vWVS-tIPEHh4fzO6zLG3igK5CbJSxBJPj286CvvKbL0UmemTgcW17ydvNS_-OBxFEj1xv7_qHX1mHBP5ddaVzf72S6INXF1rJ9wUEiC0Ipdc_olLhUmKv0Vg4I2W3vHtGbMKzbRpFUBpq3mEJZzEOeOkwg", SECRET_KEY, ALGO);

    }catch (Exception e){
        return  e.getMessage();
    }

    }

    @PostMapping("/auth/verify-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> request) throws MessagingException {

        String email = request.get("email");
        String password = request.get("password");



        String otp = VerificationCodeUtil.generateVerificationCode(4);


        verificationService.storeOtp(email, otp);
        verificationService.storePassword(email, bCryptPasswordEncoder.encode(password));


       emailService.sendVerificationEmail(email, otp, request.get("firstname"));
        return ResponseEntity.ok("Email sent");
    }


    @PostMapping("/auth/resend-verif-email")
    public ResponseEntity<?> reSendCode(@RequestBody Map<String, String> request) throws MessagingException {

        try {
            String email = request.get("email");

            System.out.println("email resend: " +  email);

            String otp = VerificationCodeUtil.generateVerificationCode(4);
            verificationService.storeOtp(email, otp);
            emailService.sendVerificationEmail(email, otp, request.get("firstname"));
            return ResponseEntity.ok("Email sent");
        }catch(Exception e){
            return ResponseEntity.status(500).body(e.getMessage());
        }





    }


    @GetMapping("/auth/is-signed-in")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> signinPage(Authentication authentication) {

        System.out.println("Authentication: " + authentication);

        // If there's no authentication or if it's anonymous, treat as not signed in.
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            // The user is not signed .
            return ResponseEntity.status(401).build();
        }
        // Otherwise, the user is signed in.
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {

        try{

            Map<String, Object> response = userService.updateProfile(request);
            return ResponseEntity.status((int)response.get("code")).body(response.get("message"));

        }catch(Exception e){

            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> up(@RequestBody Map<String, String> request) throws Exception {

        String email = request.get("email");
        String oldPassword = AESUtil.decrypt(request.get("oldPassword"), SECRET_KEY, ALGO);
        String newPassword = AESUtil.decrypt(request.get("newPassword"), SECRET_KEY, ALGO);

        System.out.println(email);
        System.out.println(oldPassword);
        System.out.println(newPassword);




        try {
            Map<String, Object> response;
            response = userService.updatePassword(email, oldPassword, newPassword, bCryptPasswordEncoder);


            System.out.println(response);
            return ResponseEntity.status((int)response.get("code")).body(response.get("message").toString());





        }catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(500).body(e.getMessage());
        }



    }


    @PostMapping("/add-doc")
    public ResponseEntity<?> addDoc(@RequestHeader HttpHeaders headers) {
        System.out.println("Received headers: {}"+ headers);



        return ResponseEntity.ok().body("Document added");
    }


    @PostMapping("/save-doc")
    public String saveDoc(@RequestHeader HttpHeaders headers, @RequestBody Map<String, Object> request) {

        try{
            System.out.println(request);
            String userId = (String) request.get("userId");
            String docId = (String) request.get("documentId");

            userService.saveDocument(userId, docId);

            return "Document saved";

        }catch (Exception e){
            System.out.println(e.getMessage());
            return e.getMessage();
        }
    }


    @GetMapping("/saved-docs")
    public ResponseEntity<?> getSavedDocs(@RequestParam("userId") String userId) {

        try{
             return ResponseEntity.ok(userService.getUserWithSavedDocuments(userId));



        }catch (Exception e){

            return ResponseEntity.status(500).body(e.getMessage());
        }


    }












}




