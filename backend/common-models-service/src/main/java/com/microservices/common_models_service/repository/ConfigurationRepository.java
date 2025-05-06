package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, String> {
    // You can add custom query methods here if needed
}