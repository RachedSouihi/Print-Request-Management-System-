package com.microservices.user_service.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.microservices.common_models_service.model.User;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
