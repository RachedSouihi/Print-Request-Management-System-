package com.microservices.user_service.service;

import com.microservices.common_models_service.enums.NotificationTypes;
import com.microservices.common_models_service.model.Follow;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.FollowRepository;
import com.microservices.common_models_service.repository.ProfileRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.user_service.client.NotificationClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    private ProfileRepository profileRepository;



    private final NotificationClient notificationClient;



    @Autowired
    public FollowService(NotificationClient notificationClient, ProfileRepository profileRepository, UserRepository userRepository) {
        this.notificationClient = notificationClient;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;

    }
    private final RestTemplate restTemplate = new RestTemplate(); // Pour appeler l'API de notification

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
                follow.setFollowerId(follower.getUser_id());
                follow.setFollowedId(followed.getUser_id());

                followRepository.save(follow);

                // Prepare the notification payload
                Map<String, Object> notificationPayload = new HashMap<>();
                notificationPayload.put("user_id", followedId);
                notificationPayload.put("title", "New Follower");
                notificationPayload.put("message", follower.getProfile().getFirstname() + " started following you.");
                notificationPayload.put("type", NotificationTypes.NEW_FOLLOWER); // Set the type

                // Call the /notify-user endpoint
                try {

                    notificationClient.notifyUser(notificationPayload);
                    System.out.println("✅ Notification sent to the user");
                } catch (Exception e) {
                    System.out.println("❌ Error sending notification: " + e.getMessage());
                }

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

    public List<User> getFollowedProfessorsByUser(String userId) {
        try {
            // Récupérer tous les follows où cet utilisateur est le follower
            List<Follow> follows = followRepository.findByFollowerId(userId);

            // Mapper vers les User correspondants, en filtrant uniquement les professeurs
            return follows.stream()
                    .map(follow -> userRepository.findById(follow.getFollowedId()).orElse(null))
                    .filter(user -> user != null && user.getProfile() != null)
                    .filter(user -> "professor".equalsIgnoreCase(user.getProfile().getRole()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve followed professors: " + e.getMessage());
        }
    }
}
