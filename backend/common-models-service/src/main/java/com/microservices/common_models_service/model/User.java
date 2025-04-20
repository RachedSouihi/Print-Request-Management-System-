package com.microservices.common_models_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "user_id")
    private String userId;  // Correspond à user_id dans la table users

    private String email;
    private String password;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean active;

    // Relation un-à-un avec Profile
    @OneToOne(mappedBy = "user", orphanRemoval = true, cascade = CascadeType.ALL)
    @JsonManagedReference
    private Profile profile;

    // Relation plusieurs-à-plusieurs avec Document
    @ManyToMany
    @JoinTable(
            name = "saved_documents",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private Set<Document> savedDocuments = new HashSet<>();

    // Relation plusieurs-à-plusieurs avec Subject
    @ManyToMany
    @JoinTable(
            name = "user_subjects",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    // Relation un-à-plusieurs avec Follow (suivi des utilisateurs)
    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Follow> followings = new HashSet<>();

    @OneToMany(mappedBy = "followed", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Follow> followers = new HashSet<>();

    // Méthodes pour gérer les relations de suivi (Follow)
    public void follow(User userToFollow) {
        if (userToFollow != null && !this.equals(userToFollow)) {
            Follow follow = new Follow();
            follow.setFollower(this);
            follow.setFollowed(userToFollow);
            this.followings.add(follow);
            userToFollow.getFollowers().add(follow);
        }
    }

    public void unfollow(User userToUnfollow) {
        Follow follow = this.followings.stream()
                .filter(f -> f.getFollowed().equals(userToUnfollow))
                .findFirst().orElse(null);
        if (follow != null) {
            this.followings.remove(follow);
            userToUnfollow.getFollowers().remove(follow);
        }
    }

    // Getters et Setters
    public String getUserId() {
        return userId;
    }


    public void setUser_id(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Profile getProfile() {
        return profile;
    }

    public void setProfile(Profile profile) {
        if (profile != null && !this.userId.equals(profile.getId())) {
            throw new IllegalArgumentException("Profile user_id does not match the user's id.");
        }
        this.profile = profile;
    }

    public Set<Document> getSavedDocuments() {
        return savedDocuments;
    }

    public void setSavedDocuments(Set<Document> savedDocuments) {
        this.savedDocuments = savedDocuments;
    }

    public void saveDocument(Document document) {
        if (document != null) {
            savedDocuments.add(document);
        }
    }

    public void removeSavedDocument(Document document) {
        if (document != null) {
            savedDocuments.remove(document);
        }
    }

    public Set<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(Set<Subject> subjects) {
        this.subjects = subjects;
    }

    public void addSubject(Subject subject) {
        if (subject != null) {
            subjects.add(subject);
        }
    }

    public void removeSubject(Subject subject) {
        if (subject != null) {
            subjects.remove(subject);
        }
    }

    public Set<Follow> getFollowings() {
        return followings;
    }

    public void setFollowings(Set<Follow> followings) {
        this.followings = followings;
    }

    public Set<Follow> getFollowers() {
        return followers;
    }

    public void setFollowers(Set<Follow> followers) {
        this.followers = followers;
    }


}
