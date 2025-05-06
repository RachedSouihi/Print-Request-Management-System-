package com.microservices.common_models_service.repository;

import com.microservices.common_models_service.model.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {


    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);



    // Add an entity graph to fetch the user along with savedDocuments
    @EntityGraph(attributePaths = "savedDocuments")
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findUserWithDocuments(@Param("userId") String userId);

    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserId(@Param("userId") String userId);

    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findById (@Param("userId") String userId);





}


