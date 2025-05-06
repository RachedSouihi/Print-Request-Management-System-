package com.microservices.common_models_service.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.FieldDTO;
import com.microservices.common_models_service.model.User;


@JsonInclude(JsonInclude.Include.NON_NULL) // Add this
public class DocumentDTO {
    private String id;
    private String docType;
    private SubjectDTO subject;

    private String level;
    private FieldDTO field;
    private int downloads;
    private Float rating;
    private String description;

    private UserDTO user; // Now using UserDTO instead of User entity

    // Constructors
    public DocumentDTO() {}


   /* public DocumentDTO(String id, String docType, String subject, String level, String field, int downloads, Float rating, String description, UserDTO user) {
        this.id = id;
        this.docType = docType;
        this.subject = subject;
        this.field = field;
        this.description = description;
        this.user = user;
        this.level = level;
        this.downloads = downloads;
        this.rating = rating;

    }*/

    public DocumentDTO(String id, String docType, String subject, String level, String field, int downloads, Float rating, String description) {
        this.id = id;
        this.docType = docType;
        this.subject = new SubjectDTO();
        this.field = new FieldDTO();
        this.description = description;
        this.level = level;
        this.downloads = downloads;
        this.rating = rating;

    }

    public DocumentDTO(String id, SubjectDTO subject){
        this.id = id;
        this.subject = subject;
    }

    public DocumentDTO(String id, String docType, Long subjectId, String subjectName,  String level, Long fieldId, String fieldName, int downloads, Float rating, String description, UserDTO user) {
        this.id = id;
        this.docType = docType;
        this.subject = subjectId != null ? new SubjectDTO(subjectId, subjectName): null;
        this.level = level;
        this.field = fieldId != null ? new FieldDTO(fieldId, fieldName): null;
        this.downloads = downloads;
        this.rating = rating;
        this.description = description;
        this.user = user;
    }




    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public SubjectDTO getSubject() { return subject; }
    public void setSubject(SubjectDTO subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public String getLevel() {
        return level;
    }

    public FieldDTO getField() {
        return field;
    }

    public int getDownloads() {
        return downloads;
    }

    public Float getRating() {
        return rating;
    }
}
