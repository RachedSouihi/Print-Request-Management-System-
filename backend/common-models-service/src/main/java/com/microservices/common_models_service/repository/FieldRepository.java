package com.microservices.common_models_service.repository;



import com.microservices.common_models_service.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    Optional<Field> findByName(String name);
}
