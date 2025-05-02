package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    List<Document> findByTypeInAndVisibility(List<String> types, String visibility);
    List<Document> findByTypeInAndVisibilityAndUser(List<String> types, String visibility, User user);

}
