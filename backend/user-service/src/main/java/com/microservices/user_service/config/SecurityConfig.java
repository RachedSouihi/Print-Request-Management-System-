package com.microservices.user_service.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        // Autoriser les routes spécifiques sans authentification
                        .requestMatchers("/user/verify-email", "/user/signup", "/auth/login").permitAll()
                        // Autoriser la route /update-password pour les utilisateurs authentifiés
                        .requestMatchers("/update-password").permitAll()
                        .requestMatchers("/user/sendOtp").permitAll()
                        // Toutes les autres routes nécessitent une authentification
                        .anyRequest().authenticated()
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // Activer la configuration CORS
                .csrf(csrf -> csrf.disable());  // Désactiver CSRF si vous avez une API REST

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Frontend React
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));  // Accepte tous les headers
        configuration.setExposedHeaders(List.of("Authorization")); // Permet d'exposer le token JWT
        configuration.setAllowCredentials(true);  // Autorise l'envoi de cookies et d'infos d'authentification

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);  // Applique CORS sur tous les endpoints
        return source;
    }
}
