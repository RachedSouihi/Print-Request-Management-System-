package com.microservices.common_models_service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

public class PrintRequestDTO {
    private String id;
    private String docType;
    private String subject;
    private String description;
    private int downloads;
    private Float rating;
    private String level;
    private String field;
    private LocalDateTime date;
    private String userId;
    //private Set<Long> savedByUserIds;

    public PrintRequestDTO() {}

    public PrintRequestDTO(String id, String docType, String subject, String description, int downloads, Float rating, String level, String field, LocalDateTime date, String userId) {
        this.id = id;
        this.docType = docType;
        this.subject = subject;
        this.description = description;
        this.downloads = downloads;
        this.rating = rating;
        this.level = level;
        this.field = field;
        this.date = date;
        this.userId = userId;
        //this.savedByUserIds = savedByUserIds;
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

    public int getDownloads() { return downloads; }
    public void setDownloads(int downloads) { this.downloads = downloads; }

    public Float getRating() { return rating; }
    public void setRating(Float rating) { this.rating = rating; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    // public Set<Long> getSavedByUserIds() { return savedByUserIds; }
    // public void setSavedByUserIds(Set<Long> savedByUserIds) { this.savedByUserIds = savedByUserIds; }
}