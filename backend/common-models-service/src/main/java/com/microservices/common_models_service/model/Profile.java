// Updated Profile.java
package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
public class Profile {
    @Id
    private String user_id;

    private String firstname;
    private String lastname;
    private String role;

    @Column(name = "education_level")
    private String educationLevel;
    private String field;
    private String phone;
    private boolean agree;

    // Professor-specific fields
    private String idCard;
    private String subject;

    @OneToOne(cascade = CascadeType.ALL)
    @MapsId
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;

    @PrePersist
    @PreUpdate
    private void validateRole() {
        if ("professor".equalsIgnoreCase(this.role)) {
            if (this.idCard == null || this.subject == null) {
                throw new IllegalStateException("Professors must have an ID card and a subject.");
            }
        } else {
            this.idCard = null; // Ensure students don't have this field
            this.subject = null;
        }
    }

    // Getters and Setters
    public String getUser_id() {
        return user_id;
    }
    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }
    public String getLastname() {
        return lastname;
    }
    public void setLastname(String lastname) {
        this.lastname = lastname;
    }
    public String getFirstname() {
        return firstname;
    }
    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }
    public String getRole() {
        return role;
    }
    public void setRole(String role) {
        this.role = role;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public String getEducationLevel() {
        return educationLevel;
    }
    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }
    public String getField() {
        return field;
    }
    public void setField(String field) {
        this.field = field;
    }
    public boolean isAgree() {
        return agree;
    }
    public void setAgree(boolean agree) {
        this.agree = agree;
    }
    public String getIdCard() {
        return idCard;
    }
    public void setIdCard(String idCard) {
        if ("professor".equalsIgnoreCase(this.role)) {
            this.idCard = idCard;
        } else {
            this.idCard = null; // Ensure students don't have this field
        }
    }
    public String getSubject() {
        return subject;
    }
    public void setSubject(String subject) {
        if ("professor".equalsIgnoreCase(this.role)) {
            this.subject = subject;
        } else {
            this.subject = null; // Ensure students don't have this field
        }
    }
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}
