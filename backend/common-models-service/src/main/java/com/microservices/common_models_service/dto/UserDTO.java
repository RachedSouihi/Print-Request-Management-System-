package com.microservices.common_models_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.microservices.common_models_service.model.Field;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.Subject;
import com.microservices.common_models_service.model.User;

import java.util.List;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    private String user_id;
    private ProfileDTO profile; // Use ProfileDTO here
    private String email;

    private String idCard;

    private String group;

    private boolean active;
    private List<DocumentDTO> savedDocuments;

    // Constructors

    public UserDTO() {}
    public UserDTO(String user_id){
        this.user_id = user_id;

    }

    public UserDTO(String id, ProfileDTO profile, String email) {
        this.user_id = id;
        this.profile = profile;
        this.email = email;
    }

    public UserDTO(String id, ProfileDTO profile, String email, List<DocumentDTO> savedDocuments) {
        this.user_id = id;
        this.profile = profile;
        this.email = email;


        this.savedDocuments = savedDocuments;
    }

    public UserDTO(String userId, boolean active, String email, String firstname, String lastname, String role, String phone, String educationLevel, String field) {

        this.user_id = userId;
        this.email = email;
        this.active = active;
        this.profile = new ProfileDTO(firstname, lastname, role, phone, educationLevel, field);

    }


    public UserDTO(String userId, boolean active, String email, String firstname, String lastname, String role, String phone, String educationLevel, Field field, String group) {

        this.user_id = userId;
        this.email = email;
        this.active = active;
        this.profile = new ProfileDTO(firstname, lastname, role, phone, educationLevel, field, group);

    }

    public UserDTO(String userId, boolean active, String idCard, String email, String firstname, String lastname, String role, String phone, String educationLevel, Field field, Subject subject) {

        this.user_id = userId;
        this.email = email;
        this.active = active;
        this.profile = new ProfileDTO(idCard, firstname, lastname, role, phone, educationLevel, field, subject);

    }




    // Getters and Setters


    @JsonProperty("user_id") // Ensure JSON key is "user_id"
    public String getUserId() {
        return user_id;
    }
    public void setUserId(String userId) {
        this.user_id = userId;
    }

    public ProfileDTO getProfile() {
        return profile;
    }

    public void setProfile(ProfileDTO profile) {
        this.profile = profile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<DocumentDTO> getSavedDocuments() {
        return savedDocuments;
    }

    public void setSavedDocuments(List<DocumentDTO> savedDocuments) {
        this.savedDocuments = savedDocuments;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }




    public static UserDTO fromUser(User user) {
        Profile profile = user.getProfile();



        return new UserDTO(
                user.getUser_id(),
                user.isActive(),
                user.getEmail(),
                profile.getFirstname(),
                profile.getLastname(),
                profile.getRole(),
                profile.getPhone(),
                profile.getEducationLevel(),
                profile.getField(),
                profile.getGroup()
        );
    }




}