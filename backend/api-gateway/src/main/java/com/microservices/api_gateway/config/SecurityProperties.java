package com.microservices.api_gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    private List<String> permittedPaths = new ArrayList<>();

    // Getters and setters
    public List<String> getPermittedPaths() {
        return permittedPaths;
    }

    public void setPermittedPaths(List<String> permittedPaths) {
        this.permittedPaths = permittedPaths;
    }
}