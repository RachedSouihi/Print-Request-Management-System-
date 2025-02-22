package com.microservices.common_models_service.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "documents")

public class Document {
    @Id
    private String id;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "doc_type")
    private String docType; // e.g., "PDF", "DOCX"

    @Lob
    private byte[] document; // Use @Lob alone

    private String subject;
    private String description;


    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
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

    public void setDescription(String description) {
        this.description = description;
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
}
