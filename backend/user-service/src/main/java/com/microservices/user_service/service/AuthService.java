package com.microservices.user_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class AuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final KeycloakService keycloakService;

    @Value("${keycloak.token-url}")
    private String tokenUrl;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    public AuthService(KeycloakService keycloakService) {
        this.keycloakService = keycloakService;
    }

    public String login(String username, String password) throws Exception {

        return keycloakService.getToken(username, password).toString();
    }

}
