package com.microservices.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;


public class SecurityConfig {


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {



        return httpSecurity.authorizeHttpRequests(authorizeRequests -> authorizeRequests
                .requestMatchers("/auth/login").permitAll()
                .anyRequest()
                .authenticated()).oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())).build();
    }


    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("http://127.0.0.1:8090/realms/spring-microservices-security-realm/protocol/openid-connect/certs").build();
    }


}
