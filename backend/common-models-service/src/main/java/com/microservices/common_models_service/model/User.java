package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String user_id; // No @GeneratedValue because the ID is manually assigned

    private String email;
    private String password;

   /*@OneToOne(mappedBy = "user", orphanRemoval = true)
    @JsonManagedReference
    private Profile profile;*/


    @OneToOne(mappedBy = "user", orphanRemoval = true, cascade = CascadeType.ALL) // Changed to CascadeType.ALL
    @JsonManagedReference
    private Profile profile;

    // Getters and Setters
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
}