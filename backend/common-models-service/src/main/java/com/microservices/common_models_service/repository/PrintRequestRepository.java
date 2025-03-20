package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.PrintRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrintRequestRepository extends JpaRepository<PrintRequest, String> {
}
