package com.microservices.user_service.filter;

import com.microservices.user_service.utils.JwtTokenProvider;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("Executing JWT Authentication Filter for request: " + request.getRequestURI());

        try {
            // 1. Extract the JWT token from the header or cookie.
            String token = jwtTokenProvider.resolveToken(request);
            if (token != null) {
                System.out.println("Extracted JWT token: " + token);

                // 2. Validate the token.
                if (jwtTokenProvider.validateToken(token)) {
                    System.out.println("JWT token is valid.");

                    // 3. Get the Authentication object from the token.
                    Authentication auth = jwtTokenProvider.getAuthentication(token);
                    System.out.println("Extracted Authentication: " + auth);

                    // Set the authentication in the SecurityContext.
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.out.println("JWT token is not valid.");
                }
            } else {
                System.out.println("No JWT token found in request.");
            }
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT error: " + e.getMessage());
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid/Expired JWT");
            return;
        }

        // Proceed with the filter chain.
        filterChain.doFilter(request, response);
    }
}
