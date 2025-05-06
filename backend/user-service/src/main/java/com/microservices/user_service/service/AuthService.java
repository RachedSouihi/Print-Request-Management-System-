package com.microservices.user_service.service;


import com.microservices.common_models_service.model.Subject;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.SubjectRepository;
import com.microservices.common_models_service.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public AuthService(UserRepository userRepository, SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public String saveChosenSubjects(String userId, List<String> subjectNames) {
        try {
            // Check if the user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));

            // Find subjects by name
            List<Subject> subjects = subjectRepository.findAllByNames(subjectNames);
            if (subjects.size() != subjectNames.size()) {
                Set<String> availableSubjects = subjectRepository.findAll().stream()
                        .map(Subject::getName)
                        .collect(Collectors.toSet());
                String missingSubjects = subjectNames.stream()
                        .filter(name -> !availableSubjects.contains(name))
                        .collect(Collectors.joining(", "));
                return "Error: The following subjects are not available: " + missingSubjects;
            }

            // Set the subjects for the user
            user.setSubjects(new HashSet<>(subjects));

            return "Subjects saved successfully";
        } catch (NoSuchElementException e) {
            return e.getMessage();
        } catch (Exception e) {
            return "Error: Failed to save subjects. " + e.getMessage();
        }
    }

}
