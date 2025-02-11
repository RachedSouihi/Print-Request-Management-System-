package com.microservices.common_models_service.model;


import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.UUID;

@Entity
@Table(name = "users") // Rename the table to "users"
public class User {
    @Id
    @GeneratedValue
    @UuidGenerator(style = UuidGenerator.Style.RANDOM)
    private UUID user_id;

    private String email;
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;

    public String getEmail() {
        return "";
    }

    public String getName() {
        return "";
    }
}
