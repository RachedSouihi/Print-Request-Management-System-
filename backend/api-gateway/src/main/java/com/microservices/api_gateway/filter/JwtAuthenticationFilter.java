package com.microservices.api_gateway.filter;


import com.microservices.api_gateway.config.SecurityProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final SecurityProperties securityProperties;
    private final PathMatcher pathMatcher;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, SecurityProperties securityProperties) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.securityProperties = securityProperties;
        this.pathMatcher = new AntPathMatcher();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Check if current request URI matches any permitted path
        boolean isPermitted = securityProperties.getPermittedPaths().stream()
                .anyMatch(path -> pathMatcher.match(path, request.getRequestURI()));

        if (isPermitted) {
            System.out.println("Skipping JWT validation for permitted endpoint: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = jwtTokenProvider.resolveToken(request);

            if (token != null && jwtTokenProvider.validateToken(token)) {
                Authentication auth = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("Valid JWT authentication set for request: " + request.getRequestURI());
            } else {
                System.out.println("No valid JWT found for request: " + request.getRequestURI());
            }
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid/Expired JWT");
            return;
        }

        filterChain.doFilter(request, response);
    }
}