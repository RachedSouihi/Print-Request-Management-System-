package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.PaperType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaperTypeRepository extends JpaRepository<PaperType, String> {
}
