package com.microservices.common_models_service.dto;

public class ProfileDTO {
    private String firstname;
    private String lastname;

    // Constructors
    public ProfileDTO() {}

    public ProfileDTO(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
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

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
}
