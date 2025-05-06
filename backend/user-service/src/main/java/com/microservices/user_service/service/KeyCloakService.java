package com.microservices.user_service.service;



import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.User;
import org.keycloak.admin.client.resource.UserResource;
import org.springframework.beans.factory.annotation.Autowired;
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

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeyCloakService {

    private final Keycloak keycloak;

    private final RestTemplate restTemplate = new RestTemplate();

    private final String token_url = "http://127.0.0.1:9000/realms/spring-microservices-security-realm/protocol/openid-connect/token";

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String client_id;

    @Value("${keycloak.credentials.secret}")
    private String client_secret;

    @Autowired
    public KeyCloakService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public String createUserKeyCloak(String username, String password) {
        try {
            //String email = user.getEmail();
            // String firstname = user.getProfile().getFirstname();
            //String lastname = user.getProfile().getLastname();

            //String role = user.getProfile().getRole();

            //String password = user.getPassword();
            RealmResource realmResource = keycloak.realm(realm);
            UsersResource usersResource = realmResource.users();
            UserRepresentation user_rep = getUserRepresentation(username, password);


            jakarta.ws.rs.core.Response response = usersResource.create(user_rep);

            if (response.getStatus() != 201) {
                //throw new RuntimeException("Failed to create user: " + response.getStatus());

                return "Failed to create user";
            }

            String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

            //Set the role to the user
            RoleRepresentation userRole = realmResource.roles().get("admin").toRepresentation();
            usersResource.get(userId).roles().realmLevel().add(Collections.singletonList(userRole));



            return "User created";

        }catch (Exception e) {
            return "Can't create user";
        }
    }

    private static UserRepresentation getUserRepresentation(String username, String password) {

        UserRepresentation user_rep = new UserRepresentation();

        // user_rep.setFirstName(firstname);
        //user_rep.setLastName(lastname);
        user_rep.setUsername(username);
        user_rep.setEmail(username);
        user_rep.setEnabled(true);

        //Set the user password
        CredentialRepresentation passwordCred = new CredentialRepresentation();
        passwordCred.setTemporary(false);
        passwordCred.setType(CredentialRepresentation.PASSWORD);
        passwordCred.setValue(password);

        // Attach the password to the user representation
        user_rep.setCredentials(Collections.singletonList(passwordCred));
        return user_rep;
    }

    public Map<String, Object> getToken(String username, String password) throws Exception {
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




    // KeyCloakService.java
    public Map<String, String> refreshAccessToken(String refreshToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", client_id);
        body.add("client_secret", client_secret);
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", refreshToken);

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(token_url, HttpMethod.POST, entity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, String> tokens = new HashMap<>();
            tokens.put("access_token", (String) response.getBody().get("access_token"));
            tokens.put("refresh_token", (String) response.getBody().get("refresh_token"));
            return tokens;
        }
        return null;
    }



    public String updatePassword(String email, String newPassword){

        UsersResource usersResource = keycloak.realm(realm).users();
        List<UserRepresentation> users = usersResource.search(email, true);


        if (users != null && !users.isEmpty()) {


            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setTemporary(false); // Change to true if you want the user to change on next login

            credential.setValue(newPassword);

            UserResource userResource = usersResource.get(users.get(0).getId());
            userResource.resetPassword(credential);



            return "Password updated";
        }


        return null;

    }


    public Map<String, Object> updateProfile(Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String email = (String) request.get("email");
        String firstName = (String) request.get("firstname");
        String lastName = (String) request.get("lastname");
        String phone = (String) request.get("phone");

        UsersResource usersResource = keycloak.realm(realm).users();
        List<UserRepresentation> users = usersResource.search(email, true);

        if (users != null && !users.isEmpty()) {
            try {
                UserRepresentation userRep = users.get(0);

                // Update first and last name if provided
                if (firstName != null && !firstName.isEmpty()) {
                    userRep.setFirstName(firstName);
                }
                if (lastName != null && !lastName.isEmpty()) {
                    userRep.setLastName(lastName);
                }

                // Update phone number as an attribute if provided
                if (phone != null && !phone.isEmpty()) {
                    Map<String, List<String>> attributes = userRep.getAttributes();
                    if (attributes == null) {
                        attributes = new HashMap<>();
                    }
                    attributes.put("phone", Collections.singletonList(phone));
                    userRep.setAttributes(attributes);
                }

                // Update the user in Keycloak
                UserResource userResource = usersResource.get(userRep.getId());
                userResource.update(userRep);

                response.put("code", 200);
                response.put("message", "Profile updated successfully.");
            } catch (Exception e) {
                response.put("code", 500);
                response.put("message", "Error updating profile: " + e.getMessage());
            }
        } else {
            response.put("code", 404);
            response.put("message", "User not found for email: " + email);
        }

        return response;
    }
}