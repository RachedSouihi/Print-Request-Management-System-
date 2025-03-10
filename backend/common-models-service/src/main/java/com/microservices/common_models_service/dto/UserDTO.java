package com.microservices.common_models_service.dto;

import java.util.List;

public class UserDTO {
    private String userId;
    private ProfileDTO profile; // Use ProfileDTO here
    private String email;
    private List<DocumentDTO> savedDocuments;

    // Constructors
    public UserDTO() {}

    public UserDTO(String id, ProfileDTO profile, String email) {
        this.userId = id;
        this.profile = profile;
        this.email = email;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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
}