package com.microservices.common_models_service.repository;

import com.microservices.common_models_service.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    // Vérifier si une relation de suivi existe entre deux utilisateurs (followerId et followedId)
    boolean existsByFollowerIdAndFollowedId(String followerId, String followedId);

    // Trouver un suivi spécifique basé sur les ids des utilisateurs (followerId et followedId)
    Optional<Follow> findByFollowerIdAndFollowedId(String followerId, String followedId);

    // Supprimer un suivi en fonction des ids des utilisateurs (followerId et followedId)
    void deleteByFollowerIdAndFollowedId(String followerId, String followedId);


    List<Follow> findByFollowerId(String followerId); // 👈
}
