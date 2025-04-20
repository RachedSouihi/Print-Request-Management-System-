package com.microservices.user_service.service;

import com.microservices.common_models_service.model.Follow;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.FollowRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.common_models_service.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    // Méthode pour permettre à un étudiant de suivre un professeur
    public String followUser(String followerId, String followedId) {
        try {
            // Recherche de l'utilisateur qui suit
            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new RuntimeException("User with followerId: " + followerId + " not found"));

            // Recherche de l'utilisateur suivi
            User followed = userRepository.findById(followedId)
                    .orElseThrow(() -> new RuntimeException("User with followedId: " + followedId + " not found"));

            System.out.println("📥 Reçu followerId: [" + followerId + "], followedId: [" + followedId + "]");

            Profile followerProfile = profileRepository.findById(followerId).orElse(null);
            Profile followedProfile = profileRepository.findById(followedId).orElse(null);
            System.out.println("FollowerId: " + followerId + ", FollowedId: " + followedId);


            if (followerProfile == null || followedProfile == null) {
                return "Error: Profile not found for one or both users.";
            }

            if ("student".equalsIgnoreCase(followerProfile.getRole()) &&
                    "professor".equalsIgnoreCase(followedProfile.getRole())) {

                if (followRepository.existsByFollowerIdAndFollowedId(followerId, followedId)) {
                    return "Error: You are already following this professor.";
                }

                Follow follow = new Follow();
                follow.setFollowerId(follower.getUserId());
                follow.setFollowedId(followed.getUserId());


                followRepository.save(follow);
                return "You are now following the professor successfully.";

            } else {
                return "Error: Only students can follow professors.";
            }
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }


    // Méthode pour permettre à un étudiant d'arrêter de suivre un professeur
    public String unfollowUser(String followerId, String followedId) {
        try {
            // Vérifier si l'utilisateur suit déjà l'autre utilisateur
            Follow follow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId)
                    .orElseThrow(() -> new RuntimeException("You are not following this user"));

            followRepository.delete(follow);
            return "You have unfollowed the professor successfully.";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
