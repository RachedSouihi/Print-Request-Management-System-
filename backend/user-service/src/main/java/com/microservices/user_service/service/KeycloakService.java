package com.microservices.user_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.User;
import org.springframework.http.*;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;

@Service
public class KeycloakService {

    private final Keycloak keycloak;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String token_url = "http://127.0.0.1:8180/realms/spring-microservices-security-realm/protocol/openid-connect/token";

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String client_id;

    @Value("${keycloak.credentials.secret}")
    private String client_secret;

    public KeycloakService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public void assignAdminRole(User student) {

        String email = student.getEmail();
        String name= student.getName();
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        UserRepresentation user = new UserRepresentation();

        user.setUsername(name);
        user.setEmail(email);
        user.setEnabled(true);

        jakarta.ws.rs.core.Response response = usersResource.create(user);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user: " + response.getStatus());
        }

        CredentialRepresentation password = new CredentialRepresentation();
        password.setType(CredentialRepresentation.PASSWORD);
        password.setValue("default-password"); // Change this to a secure password
        password.setTemporary(false);

        String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

        RoleRepresentation adminRole = realmResource.roles().get("admin").toRepresentation();
        usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(adminRole));
    }

    public Map getToken(String username, String password) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Properly format request body
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", client_id);
        body.add("client_secret", client_secret);
        body.add("grant_type", "password");
        body.add("username", username);
        body.add("password", password);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(token_url, request, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            // Parse JSON response into a Map
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(response.getBody(), Map.class);
        } else {
            throw new RuntimeException("Failed to get token: " + response.getBody());
        }
    }

}