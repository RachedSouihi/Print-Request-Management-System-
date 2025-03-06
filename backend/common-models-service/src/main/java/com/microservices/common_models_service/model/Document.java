package com.microservices.common_models_service.model;



import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "documents")
//@JsonInclude(JsonInclude.Include.NON_NULL) // Exclut les champs null du JSON
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
    private String level;
    private String section;
    private String className; // "class" est un mot-clé réservé en Java
    private String examDate;
    private String printMode;



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
    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getExamDate() {
        return examDate;
    }

    public void setExamDate(String examDate) {
        this.examDate = examDate;
    }

    public String getPrintMode() {
        return printMode;
    }

    public void setPrintMode(String printMode) {
        this.printMode = printMode;
    }

}
