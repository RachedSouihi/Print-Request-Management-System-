package com.microservices.common_models_service.dto;


import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.User;

public class DocumentDTO {
    private String id;
    private String docType;
    private String subject;
    private String level;
    private String field;
    private int downloads;
    private Float rating;
    private String description;

    private UserDTO user; // Now using UserDTO instead of User entity

    // Constructors
    public DocumentDTO() {}


    public DocumentDTO(String id, String docType, String subject, String level, String field, int downloads, Float rating, String description, UserDTO user) {
        this.id = id;
        this.docType = docType;
        this.subject = subject;
        this.field = field;
        this.description = description;
        this.user = user;
        this.level = level;
        this.downloads = downloads;
        this.rating = rating;

    }

    public DocumentDTO(String id, String docType, String subject, String level, String field, int downloads, Float rating, String description) {
        this.id = id;
        this.docType = docType;
        this.subject = subject;
        this.field = field;
        this.description = description;
        this.level = level;
        this.downloads = downloads;
        this.rating = rating;

    }

    public DocumentDTO(String id, String subject){
        this.id = id;
        this.subject = subject;
    }

    public DocumentDTO(String id, String docType, String subject, String level, String field, int downloads, float rating, String description, User user) {
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public String getLevel() {
        return level;
    }

    public String getField() {
        return field;
    }

    public int getDownloads() {
        return downloads;
    }

    public Float getRating() {
        return rating;
    }
}
