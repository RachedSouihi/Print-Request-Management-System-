package com.microservices.user_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.User;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class KeyCloakService {

    private final Keycloak keycloak;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String token_url = "http://127.0.0.1:8180/realms/spring-microservices-security-realm/protocol/openid-connect/token";

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String client_id;

    @Value("${keycloak.credentials.secret}")
    private String client_secret;

    public KeyCloakService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public String createUserKeyCloak(String username, String password) {
        try {
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            UserRepresentation user_rep = getUserRepresentation(username, password);

            jakarta.ws.rs.core.Response response = usersResource.create(user_rep);

            if (response.getStatus() != 201) {
                return "Failed to create user";
            }

            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

            // Définir le rôle de l'utilisateur
            RoleRepresentation userRole = realmResource.roles().get("admin").toRepresentation();
            usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(userRole));

            return "User created";
        } catch (Exception e) {
            return "Can't create user";
        }
    }

    private static UserRepresentation getUserRepresentation(String username, String password) {
        UserRepresentation user_rep = new UserRepresentation();
        user_rep.setUsername(username);
        user_rep.setEmail(username);
        user_rep.setEnabled(true);

        // Définir le mot de passe de l'utilisateur
        CredentialRepresentation passwordCred = new CredentialRepresentation();
        passwordCred.setTemporary(false);
        passwordCred.setType(CredentialRepresentation.PASSWORD);
        passwordCred.setValue(password);

        // Associer le mot de passe à la représentation de l'utilisateur
        user_rep.setCredentials(Collections.singletonList(passwordCred));
        return user_rep;
    }

    public Map<String, Object> getToken(String username, String password) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Formatage correct du corps de la requête
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", client_id);
        body.add("client_secret", client_secret);
        body.add("grant_type", "password");
        body.add("username", username);
        body.add("password", password);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(token_url, request, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(response.getBody(), Map.class);
        } else {
            throw new RuntimeException("Failed to get token: " + response.getBody());
        }
    }

    // Méthode updatePassword rendue non statique pour permettre l'accès aux variables d'instance
    public String updatePassword(String email, String newPassword) {
        UsersResource usersResource = keycloak.realm(realm).users();


        // Recherche directe de l'utilisateur par e-mail
        List<UserRepresentation> users = usersResource.search(email, 0, 1); // Limite à 1 résultat

        System.out.println(users);

        if (users != null && !users.isEmpty()) {
            UserRepresentation user = users.get(0);
            System.out.println("Utilisateur trouvé : " + user.getEmail());

            // Créer le nouveau mot de passe
            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setTemporary(false);
            credential.setValue(newPassword);

            // Accéder à l'utilisateur pour mettre à jour le mot de passe
            UserResource userResource = usersResource.get(user.getId());
            userResource.resetPassword(credential);

            return "Password updated successfully";
        }

        return "User not found";
    }


}
