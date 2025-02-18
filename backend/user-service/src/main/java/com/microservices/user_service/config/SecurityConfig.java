package com.microservices.user_service.config;

import com.microservices.user_service.filter.JwtAuthenticationFilter;
import com.microservices.user_service.utils.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF for stateless APIs
                .csrf(csrf -> csrf.disable())
                // Use stateless session management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // Configure request authorization
                .authorizeHttpRequests(auth ->
                        auth
                                // Require authentication for the /user/signed-in endpoint
                                .requestMatchers("/user/signed-in").authenticated()
                                // Permit all other requests
                                .anyRequest().permitAll()
                )
                // Add the custom JWT authentication filter before the default authentication filter
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                )
                // Disable form login to prevent redirects and enable proper 401 responses
                .formLogin(form -> form.disable())
                // Configure exception handling to return 401 Unauthorized for unauthorized requests
                .exceptionHandling(exceptions ->
                        exceptions.authenticationEntryPoint((request, response, authException) ->
                                response.sendError(401, "Unauthorized")
                        )
                );

        return http.build();
    }
}
