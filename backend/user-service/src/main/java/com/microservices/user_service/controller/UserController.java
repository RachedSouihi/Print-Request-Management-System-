package com.microservices.user_service.controller;



import com.microservices.user_service.service.KeyCloakService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.microservices.user_service.service.AuthService;

@RestController
@RequestMapping("/auth")
public class UserController {

    private final AuthService authService;


    public UserController(AuthService authService, KeyCloakService keycloakService) {
        this.authService = authService;

    }

    @GetMapping ("/login")
    public ResponseEntity<?> login(@RequestParam ("username")String username, @RequestParam("password") String password) {
        try {
            String token = authService.login(username, password);
            return ResponseEntity.ok().body("{\"access_token\": \"" + token + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
