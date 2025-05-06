package com.microservices.common_models_service.dto;



import java.time.LocalDate;

public class ProfDocDTO {
    private String id;
    private String title;
    private String type;
    private LocalDate deadline;
    private LocalDate date;
    private String user_id;
    private byte[] document;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getUser_id() { return user_id; }
    public void setUser_id(String user_id) { this.user_id = user_id; }

    public byte[] getDocument() { return document; }
    public void setDocument(byte[] document) { this.document = document; }
}
