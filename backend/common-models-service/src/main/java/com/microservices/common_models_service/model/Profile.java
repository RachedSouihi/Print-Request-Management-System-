package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.microservices.common_models_service.model.User;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
public class Profile {
    @Id
    private String user_id; // ✅ Nécessaire si vous utilisez @MapsId

    private String firstname;
    private String lastname;
    private String role;

    @Column(name = "education_level")
    private String educationLevel;
    private String field;
    private String phone;
    private boolean agree;

    @OneToOne
    @MapsId // ✅ L'ID de Profile sera le même que l'ID de User
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;

    // Getters et Setters
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
    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}

