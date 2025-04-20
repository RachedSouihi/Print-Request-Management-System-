package com.microservices.common_models_service.model;



import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "subjects")  // Nom de la table dans la base de données
public class Subject {

    @Id
    private Long id;  // Clé primaire de l'entité

    private String name;  // Nom du sujet (ou autre attribut selon votre cas)

    // Constructeurs
    public Subject() {}

    public Subject(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Subject{id=" + id + ", name='" + name + "'}";
    }
}
