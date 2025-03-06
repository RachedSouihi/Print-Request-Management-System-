package com.microservices.document_service.Config;



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
                        .requestMatchers("/documents/add").permitAll()   // Protéger l'ajout de documents
                        .requestMatchers("/documents/**").permitAll()  // Accès libre aux autres routes (ex: get by ID)
                        .anyRequest().permitAll()
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // Activer la configuration CORS
                .csrf(csrf -> csrf.disable()) ; // Désactiver CSRF pour les appels API REST
                  // Authentification Basic

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Frontend React
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));  // Accepte tous les headers
        configuration.setExposedHeaders(List.of("Authorization")); // Permet d'exposer le token JWT si utilisé
        configuration.setAllowCredentials(true);  // Autorise l'envoi de cookies et d'infos d'authentification

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);  // Applique CORS sur tous les endpoints
        return source;
    }
}
