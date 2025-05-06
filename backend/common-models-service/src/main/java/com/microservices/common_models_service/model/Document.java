package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    private String id;

    private String title;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "doc_type")
    private String docType; // e.g., "PDF", "DOCX"

    @Nullable
    @Column(name = "\"group\"")
    private String group;

    @Nullable
    private LocalDate deadline;

    @Nullable
    private String instructions;

    @Lob
    @JsonIgnore
    private byte[] document;

    private String description;

    @Column(name = "downloads", columnDefinition = "INT DEFAULT 0")
    private int downloads;

    @Nullable
    private Float rating;

    private String level;

    private LocalDate date;

    @Nullable
    @Column(name = "type")
    private String type; // Administrative or Educational

    @Nullable
    @Column(name = "visibility")
    private String visibility; // Public or Private

    @Nullable
    @Column(name = "message")
    private String message;

    @ManyToMany(mappedBy = "savedDocuments")
    private Set<User> savedByUsers = new HashSet<>();

    // ======== New Relations ========

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "field_id")
    private Field field;

    // ========================= Getters and Setters ==============================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDocType() {
        return docType;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    @Nullable
    public String getGroup() {
        return group;
    }

    public void setGroup(@Nullable String group) {
        this.group = group;
    }

    @Nullable
    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(@Nullable LocalDate deadline) {
        this.deadline = deadline;
    }

    @Nullable
    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(@Nullable String instructions) {
        this.instructions = instructions;
    }

    public byte[] getDocument() {
        return document;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDownloads() {
        return downloads;
    }

    public void setDownloads(int downloads) {
        this.downloads = downloads;
    }

    public float getRating() {
        return (rating != null) ? rating : 0.0f;
    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    @Nullable
    public String getType() {
        return type;
    }

    public void setType(@Nullable String type) {
        this.type = type;
    }

    @Nullable
    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(@Nullable String visibility) {
        this.visibility = visibility;
    }

    @Nullable
    public String getMessage() {
        return message;
    }

    public void setMessage(@Nullable String message) {
        this.message = message;
    }

    public Set<User> getSavedByUsers() {
        return savedByUsers;
    }

    public void setSavedByUsers(Set<User> savedByUsers) {
        this.savedByUsers = savedByUsers;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public Field getField() {
        return field;
    }

    public void setField(Field field) {
        this.field = field;
    }

    // ========================= Hooks ==============================

    @PrePersist
    public void onCreate() {
        this.date = LocalDate.now();
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.visibility == null) {
            this.visibility = "Public";
        }
    }
}
