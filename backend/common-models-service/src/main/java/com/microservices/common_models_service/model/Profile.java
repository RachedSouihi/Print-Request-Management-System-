package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "profile")  // Assurez-vous que la table est correctement mappée
public class Profile {

    @Id
    @Column(name = "user_id")  // Correspond à la clé primaire de la table "profile" (user_id)
    private String id ;  // Correspond à user_id dans la table profile

    private String firstname;
    private String lastname;
    private String role;

    @Column(name = "education_level")
    private String educationLevel;

    private String field;

    private String phone;

    private boolean agree;

    @Column(name = "idcard")
    private String idCard;  // Correspond à la colonne "idcard" dans la base de données

    private String subject;

    // Relation avec l'entité User (OneToOne)
    @OneToOne(cascade = CascadeType.ALL)
    @MapsId  // Utilise user_id comme la clé primaire partagée
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)  // Supprime le profil lors de la suppression d'un utilisateur
    @JsonBackReference
    private User user;

    // Validation avant la persistance ou la mise à jour
    @PrePersist
    @PreUpdate
    private void validateRole() {
        if ("professor".equalsIgnoreCase(this.role)) {
            if (this.idCard == null || this.subject == null) {
                throw new IllegalStateException("Professors must have an ID card and a subject.");
            }
        } else {
            this.idCard = null;  // Assurez-vous que les étudiants n'ont pas ce champ
            this.subject = null;
        }
    }

    // Getters et Setters
    public String getId() {
        return id ;
    }

    public void setUserId(String userId) {
        this.id  = userId;
    }

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
            this.idCard = null;  // Assurez-vous que les étudiants n'ont pas ce champ
        }
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        if ("professor".equalsIgnoreCase(this.role)) {
            this.subject = subject;
        } else {
            this.subject = null;  // Assurez-vous que les étudiants n'ont pas ce champ
        }
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
