package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    private Long subjectId;

    private String name;



    @OneToMany(mappedBy = "subject") // Documents reference Subject via 'subject' field
    private Set<Document> documents = new HashSet<>();




    @ManyToMany(mappedBy = "subjects")
    private Set<User> users = new HashSet<>();

    public Subject() {
    }

    public Subject(String name) {
        this.name = name;
    }


// Getters and Setters

    @JsonProperty("subject_id") // Ensure JSON key is "user_id"

    public Long getSubjectId() {
        return subjectId;
    }




    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }


    public Set<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(Set<Document> documents) {
        this.documents = documents;
    }


    public void addDocument(Document document) {
        documents.add(document);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    public void addUser(User user) {
        users.add(user);
    }

    public void removeUser(User user) {
        users.remove(user);
    }
}