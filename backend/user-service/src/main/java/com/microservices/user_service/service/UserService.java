package com.microservices.user_service.service;


import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;

import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.common_models_service.repository.ProfileRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    private final KeyCloakService keyCloakService;


    @Autowired
    public UserService(UserRepository userRepository, ProfileRepository profileRepository, KeyCloakService keyCloakService) {
        super();
        this.userRepository = userRepository;
        this.keyCloakService = keyCloakService;
        this.profileRepository = profileRepository;
    }



    public Map<String, Object> getToken(String username, String password) throws Exception {
        return keyCloakService.getToken(username, password);
    }




    public User signUp(User user) {
        try{
            keyCloakService.createUserKeyCloak(user.getEmail(), user.getPassword());
            Profile profile = user.getProfile();
            user.setProfile(profile);
            profile.setUser(user);
            userRepository.save(user);
            profileRepository.save(profile);

            Map<String, Object> token = keyCloakService.getToken(user.getEmail(), user.getPassword());

            return user;



        }catch (Exception e){
            return null;
        }


    }
}
