package com.microservices.common_models_service.model;

import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import org.springframework.boot.context.properties.bind.DefaultValue;


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

    @Column(name = "downloads", columnDefinition = "INT DEFAULT 0")
    private int downloads;


    @Column(name="level", columnDefinition = "VARCHAR DEFAULT ''")
    private String level;

    @Column(name="field", columnDefinition = "VARCHAR DEFAULT ''")
    private String field;


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


}
