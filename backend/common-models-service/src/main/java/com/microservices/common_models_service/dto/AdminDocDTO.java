package com.microservices.common_models_service.dto;

public class AdminDocDTO {
    private String id;
    private String title;
    private String type;
    private String date;
    private String author;
    private String fileType;
    private String visibility;
    private String message;
    private byte[] document;

    // Constructor
    public AdminDocDTO(String id, String title, String type, String date, String author, String fileType, String visibility, String message, byte[] document) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.date = date;
        this.author = author;
        this.fileType = fileType;
        this.visibility = visibility;
        this.message = message;
        this.document = document; // Initialisation du champ document
    }

    // Empty constructor (important for deserialization)
    public AdminDocDTO() {
    }

    // Getters and Setters

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public byte[] getDocument() {
        return document;
    }

    public void setDocument(byte[] document) {
        this.document = document;
    }
}
