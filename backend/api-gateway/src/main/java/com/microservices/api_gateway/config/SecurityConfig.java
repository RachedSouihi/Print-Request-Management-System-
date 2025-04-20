package com.microservices.api_gateway.config;

import com.microservices.api_gateway.filter.JwtAuthenticationFilter;
import com.microservices.api_gateway.filter.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private SecurityProperties securityProperties;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, SecurityProperties securityProperties) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.securityProperties = securityProperties;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Configure CORS
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", config);

        // Apply CORS configuration
        http.cors().configurationSource(source);

        // Configure security
        http
                .csrf().disable()
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider, securityProperties),
                        UsernamePasswordAuthenticationFilter.class
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(securityProperties.getPermittedPaths().toArray(new String[0])).permitAll()
                        .requestMatchers(
                                "/user/get-all-users",
                                "/user/save-doc",
                                "/user/saved-docs",
                                "/doc",
                                "/doc/docs-metadata",
                                "/p-request/all",
                                "/p-request/send-print-request",
                                "/p-request/approve",
                                "/user/decode-jwt",
                                "/user/generate-secret-key",
                                "/user/save-access-token",
                                "/user/update-password",
                                "/user/get-tokens",
                                "/user/auth/verify-email",
                                "/user/auth/resend-verif-email",
                                "/user/auth/signup",
                                "/user/auth/login",
                                "/api/follow/follow",
                                "/api/follow/unfollow"
                        ).permitAll()
                        .anyRequest().permitAll()
                )
                .formLogin().disable()
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(
                        (request, response, authException) -> response.sendError(401, "Unauthorized")
                ));

        return http.build();
    }
}
