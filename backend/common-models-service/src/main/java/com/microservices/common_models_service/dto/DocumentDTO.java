package com.microservices.common_models_service.dto;

public class DocumentDTO {


    private String id;
    private String subject;

    public DocumentDTO() {}

    public DocumentDTO(String subject, String id) {
        this.subject = subject;
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
