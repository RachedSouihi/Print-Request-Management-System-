package com.microservices.common_models_service.repository;

import com.microservices.common_models_service.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {

    // Recherche d'un profil en fonction de l'ID utilisateur
    //Profile findByUser_User_id(String id ); // "user_user_id" fait référence à user_id de l'entité User
    Optional<Profile> findById(String id );
}
