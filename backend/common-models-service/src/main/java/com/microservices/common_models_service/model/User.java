package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "users")
public class User {
    @Id
    private String user_id; // No @GeneratedValue because the ID is manually assigned

    private String email;
    private String password;


    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active;

   /*@OneToOne(mappedBy = "user", orphanRemoval = true)
    @JsonManagedReference
    private Profile profile;*/




    @OneToOne(mappedBy = "user", orphanRemoval = true, cascade = CascadeType.ALL) // Changed to CascadeType.ALL
    @JsonManagedReference
    private Profile profile;



    @ManyToMany
    @JoinTable(
            name = "saved_documents",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private Set<Document> savedDocuments = new HashSet<>();


    // Getters and Setters

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
}