package com.microservices.user_service.controller;

import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    // Endpoint pour permettre à un étudiant de suivre un professeur
    @PostMapping("/follow")
    public ResponseEntity<String> followUser(@RequestParam String followerId, @RequestParam String followedId) {
        String result = followService.followUser(followerId, followedId);
        return ResponseEntity.ok(result);
    }

    // Endpoint pour permettre à un étudiant d'arrêter de suivre un professeur
    @PostMapping("/unfollow")
    public ResponseEntity<String> unfollowUser(@RequestParam String followerId, @RequestParam String followedId) {
        String result = followService.unfollowUser(followerId, followedId);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/user/{userId}/professors")
    public List<User> getFollowedProfessors(@PathVariable String userId) {
        return followService.getFollowedProfessorsByUser(userId);
    }
}
