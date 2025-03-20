package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.lang.Nullable;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;


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
    private LocalDate deadline; // New attribute

    @Nullable
    private String instructions; // New attribute





    @Lob
    @JsonIgnore
    private byte[] document; // Use @Lob alone

    private String subject;
    private String description;

    @Column(name = "downloads", columnDefinition = "INT DEFAULT 0")
    private int downloads;

    @Nullable
    private Float rating;


    private String level;

    private String field;

    private LocalDate date;


    @Nullable
    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(@Nullable String instructions) {
        this.instructions = instructions;
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

    @PrePersist
    public void onCreate() {
        date = LocalDate.now();
    }

    @ManyToMany(mappedBy = "savedDocuments")
    private Set<User> savedByUsers = new HashSet<>();


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public float getRating() {
        return (rating != null) ? rating : 0.0f;

    }

    public void setRating(float rating) {
        this.rating = rating;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getDescription() {
        return description;
    }

    public String getSubject() {
        return subject;
    }

    public byte[] getDocument() {
        return document;
    }

    public String getDocType() {
        return docType;
    }

    public User getUser() {
        return user;
    }

    public String getId() {
        return id;
    }

    public int getDownloads(){
        return downloads;
    }

    public void setDownloads(int downloads) {
        this.downloads = downloads;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }

    public void setDocType(String docType) {
        this.docType = docType;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setId(String id) {
        this.id = id;
    }


    public Set<User> getSavedByUsers() {
        return savedByUsers;
    }
    public void setSavedByUsers(Set<User> savedByUsers) {
        this.savedByUsers = savedByUsers;
    }

}
