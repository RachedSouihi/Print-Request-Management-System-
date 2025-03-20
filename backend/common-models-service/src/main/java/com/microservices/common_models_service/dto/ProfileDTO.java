package com.microservices.common_models_service.dto;

public class ProfileDTO {
    private String firstname;
    private String lastname;
    private String role;
    private String phone;
    private String educationLevel;
    private String field;


    // Constructors
    public ProfileDTO() {}

    public ProfileDTO(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public ProfileDTO(String firstname, String lastname, String role, String phone, String educationLevel, String field) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.phone = phone;
        this.educationLevel = educationLevel;
        this.field = field;
    }

    // Getters and Setters
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }


    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
