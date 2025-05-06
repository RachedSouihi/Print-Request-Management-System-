package com.microservices.common_models_service.model;


import jakarta.persistence.*;

@Entity
@Table(name = "configurations")
public class Configuration {

    @Id
    // Assuming the id is not auto-generated and might be a meaningful key
    // If it's a generated key, use @GeneratedValue
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "config_key", unique = true, nullable = false)
    private String configKey;

    @Column(name = "config_value", nullable = true) // config_value might be nullable depending on use case
    private String configValue;

    // No-args constructor
    public Configuration() {
    }

    // All-args constructor
    public Configuration(String id, String configKey, String configValue) {
        this.id = id;
        this.configKey = configKey;
        this.configValue = configValue;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getConfigKey() {
        return configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    // You might also want to override toString(), equals(), and hashCode() if needed
}