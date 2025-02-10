package com.microservices.common_models_service.model;

// Profile.java

import jakarta.persistence.*;
import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "profile")
public class Profile {
    @Id
    private UUID user_id;

    private String firstname;
    private String lastname;
    private String role;
    private Date created_at;

    @OneToOne
    @MapsId // Shares the same UUID as User
    @JoinColumn(name = "user_id", referencedColumnName = "user_id") // Explicitly reference "user_id"
    private User user;
}