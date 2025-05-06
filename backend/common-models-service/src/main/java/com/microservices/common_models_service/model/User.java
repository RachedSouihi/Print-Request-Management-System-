package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String user_id;

    private String email;

    @JsonIgnore // Add this annotation
    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active;



    @OneToOne(mappedBy = "user", orphanRemoval = true, cascade = CascadeType.ALL)
    @JsonManagedReference
    private Profile profile;

    @ManyToMany
    @JoinTable(
            name = "saved_documents",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private Set<Document> savedDocuments = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "user_subjects",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    // Getters and Setters
    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        this.profile = profile;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Set<Document> getSavedDocuments() {
        return savedDocuments;
    }

    public void setSavedDocuments(Set<Document> savedDocuments) {
        this.savedDocuments = savedDocuments;
    }

    public void saveDocument(Document document) {
        savedDocuments.add(document);
    }

    public void removeSavedDocument(Document document) {
        savedDocuments.remove(document);
    }

    public Set<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(Set<Subject> subjects) {
        this.subjects = subjects;
    }

    public void addSubject(Subject subject) {
        subjects.add(subject);
    }

    public void removeSubject(Subject subject) {
        subjects.remove(subject);
    }

    public boolean hasSavedDocument(Document document) {
        return savedDocuments.contains(document);
    }

    public void unsaveDocument(Document document) {
        savedDocuments.remove(document);
    }

    // Method to set createdAt and active status before persisting
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Set active to true if password is not null, false otherwise
        active = (password != null);
    }
}
