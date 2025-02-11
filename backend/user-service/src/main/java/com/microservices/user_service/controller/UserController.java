package com.microservices.user_service.controller;


import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.UserService;
import jakarta.ws.rs.QueryParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;


    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }






    @GetMapping("/signup")
        public ResponseEntity<?> signup(@RequestBody User user) {
        try{
            return ResponseEntity.ok(userService.signUp(user));



        }catch(Exception e){

            return ResponseEntity.ok(e.getMessage());

        }

        }





        @GetMapping("/get-token")
    public ResponseEntity<Map<String, Object>> getToken(@QueryParam("username") String username, @QueryParam("password") String password) throws Exception {
        return ResponseEntity.ok(userService.getToken(username, password));
    }

}
