package com.microservices.common_models_service.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "fields")
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "field_id")
    private Long fieldId;

    @Column(nullable = false, unique = true)
    private String name;

    public Field() {
    }

    public Field(String name) {
        this.name = name;
    }

    // Getters and Setters
    @JsonProperty("field_id") // Ensure JSON key is "user_id"
    public Long getFieldId() {
        return fieldId;
    }

    public void setFieldId(Long fieldId) {
        this.fieldId = fieldId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}