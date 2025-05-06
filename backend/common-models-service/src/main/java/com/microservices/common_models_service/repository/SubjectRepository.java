package com.microservices.common_models_service.repository;

import com.microservices.common_models_service.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByName(String name);

    List<Subject> findByNameIn(Collection<String> names);



    @Query("SELECT s FROM Subject s WHERE s.name IN :names")
    List<Subject> findAllByNames(@Param("names") List<String> names);
}
