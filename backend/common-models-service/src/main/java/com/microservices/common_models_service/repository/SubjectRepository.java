package com.microservices.common_models_service.repository;



import com.microservices.common_models_service.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // Méthode pour trouver les sujets par une liste de noms
    List<Subject> findByNameIn(List<String> names);

    // Vous pouvez ajouter d'autres méthodes personnalisées ici si nécessaire
}
