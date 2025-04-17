package com.microservices.common_models_service.repository;

import com.microservices.common_models_service.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
@Repository
public interface SubjectRepository extends JpaRepository<Subject,Long> {

    List<Subject> findByNameIn(Collection<String> names);
}
