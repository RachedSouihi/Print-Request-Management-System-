package com.microservices.common_models_service.repository;


import com.microservices.common_models_service.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
