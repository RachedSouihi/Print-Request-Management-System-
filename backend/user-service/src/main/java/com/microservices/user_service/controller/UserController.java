package com.microservices.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.AuthService;
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
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.microservices.user_service.service.KeyCloakService;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    private final AuthService authService;
    private final UserService userService;
    private final EmailService emailService;
    private final VerificationService verificationService;
    private final ObjectMapper objectMapper;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Value("${app.secret.key}")
    private String SECRET_KEY;

    @Value("${app.encrytion.algo}")
    private String ALGO;
    @Autowired
    private KeyCloakService keyCloakService;



    @Autowired
    public UserController(AuthService authService, UserService userService, EmailService emailService,
                          VerificationService verificationService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.userService = userService;
        this.emailService = emailService;
        this.verificationService = verificationService;
        this.objectMapper = objectMapper;
    }

    // ===========================
    // Endpoints d'authentification
    // ===========================

    @GetMapping  ("/auth/login")
    public ResponseEntity<?> login(@RequestParam("username") String username,
                                   @RequestParam("password") String password) {
        try {
            String token = authService.login(username, password);
            return ResponseEntity.ok().body("{\"access_token\": \"" + token + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ===========================
    // Endpoints de gestion des utilisateurs
    // ===========================

    // Génération d'une clé secrète
    @GetMapping("/user/generate-secret-key")
    public ResponseEntity<?> generateSecretKey() throws Exception {
        String secret_key = AESUtil.generateSecretKeyBase64();
        return ResponseEntity.ok(secret_key);
    }

    // Vérification d'un mot de passe encrypté
    @GetMapping("/user/check-pwd")
    public ResponseEntity<String> checkPassword(@RequestBody Map<String, String> request) {
        try {
            String encryptedPayload = request.get("encryptedPayload");
            String decryptedPayload = AESUtil.decrypt(encryptedPayload, SECRET_KEY, ALGO);
            Map<String, Object> payloadMap = objectMapper.readValue(decryptedPayload, HashMap.class);
            long timestamp = ((Number) payloadMap.get("timestamp")).longValue();
            long currentTime = new Date().getTime();
            long timeDifference = currentTime - timestamp;
            long expirationMillis = 1 * 60 * 1000; // 1 minute
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

    // Inscription d'un utilisateur
    @PostMapping("/user/signup")
    public ResponseEntity<String> signup(@RequestBody Map<String, Object> payload) {
        try {
            // Extraire l'OTP
            String otp = (String) payload.get("otp");

            // Extraire l'objet 'user' et le désérialiser manuellement
            Map<String, Object> userMap = (Map<String, Object>) payload.get("user");
            String email = (String) userMap.get("email");
            String password = (String) userMap.get("password");
            String firstname = (String) userMap.get("firstname");

            // Créer un objet User à partir des données extraites
            User user = new User();
            user.setEmail(email);
            user.setPassword(password);


            // Logique d'inscription (vérification de l'OTP, etc.)
            if (otp == null || otp.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP manquant.");
            }

            // Exemple de traitement d'inscription
            // Vous pouvez ajouter ici la logique pour valider l'OTP et enregistrer l'utilisateur dans la base de données

            return ResponseEntity.ok("Inscription réussie pour l'email : " + user.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur interne : " + e.getMessage());
        }
    }



    // Envoi d'un e-mail de vérification
    @PostMapping("/user/verify-email")
    public ResponseEntity<?> sendVerificationEmail(@RequestBody Map<String, String> request) throws MessagingException {
        String email = request.get("email");
        String password = request.get("password");
        String firstname = request.get("firstname");

        // Générer et stocker l'OTP
        verificationService.generateAndStoreOtp(email, password);

        // Récupérer les données de vérification depuis Redis
        VerificationData data = verificationService.getVerificationData(email);

        // Envoyer l'email avec le code de vérification
        emailService.sendVerificationEmail(email, data.getCode(), firstname);

        return ResponseEntity.ok("Email sent");
    }

    // Vérification de l'état de connexion
    @GetMapping("/user/is-signed-in")
   // @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<?> isSignedIn(Authentication authentication) {
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok().build();
    }

    // Endpoint de test
    @PostMapping("/user/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("test");
    }
    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Missing email or newPassword");
        }

        String response = keyCloakService.updatePassword(email, newPassword);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/user/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String verificationCode = request.get("verificationCode");

        // Vérifier que l'OTP correspond à celui stocké
        VerificationData data = verificationService.getVerificationData(email);

        if (data == null || !data.getCode().equals(verificationCode)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Code incorrect.");
        }

        return ResponseEntity.ok("Code vérifié.");
    }


}







