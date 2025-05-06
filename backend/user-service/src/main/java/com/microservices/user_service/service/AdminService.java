package com.microservices.user_service.service;

import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional

public class AdminService {

    private final UserRepository userRepository;

    @Autowired
    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO updateUser(String userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Update User fields
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setActive(updatedUser.isActive());

        // Update Profile
        Profile updatedProfile = updatedUser.getProfile();
        if (updatedProfile != null) {
            Profile existingProfile = existingUser.getProfile();
            if (existingProfile == null) {
                existingProfile = new Profile();
                existingProfile.setUser(existingUser);
                existingUser.setProfile(existingProfile);
            }

            // Always update common fields
            existingProfile.setFirstname(updatedProfile.getFirstname());
            existingProfile.setLastname(updatedProfile.getLastname());
            existingProfile.setRole(updatedProfile.getRole());
            existingProfile.setPhone(updatedProfile.getPhone());
            existingProfile.setEducationLevel(updatedProfile.getEducationLevel());
            existingProfile.setField(updatedProfile.getField());
            existingProfile.setGroup(updatedProfile.getGroup());

            // Role-specific fields
            if ("professor".equalsIgnoreCase(updatedProfile.getRole())) {
                existingProfile.setIdCard(updatedProfile.getIdCard());
                existingProfile.setSubject(updatedProfile.getSubject());
            } else {
                existingProfile.setIdCard(null);
                existingProfile.setSubject(null);
            }
        }

        User u =  userRepository.save(existingUser);


        return new UserDTO(
                u.getUser_id(),
                u.isActive(),
                u.getProfile() != null ? u.getProfile().getIdCard() : null,
                u.getEmail(),
                u.getProfile().getFirstname(),
                u.getProfile().getLastname(),
                u.getProfile().getRole(),
                u.getProfile().getPhone(),
                u.getProfile().getEducationLevel(),
                u.getProfile().getField(),

                u.getProfile().getSubject()
        );
    }

}