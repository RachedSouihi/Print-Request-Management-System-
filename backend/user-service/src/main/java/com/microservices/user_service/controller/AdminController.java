package com.microservices.user_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user/admin")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/update-user/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable String userId,
            @RequestBody Map<String, Object> payload
    ) {

        try {

            ObjectMapper mapper = new ObjectMapper();


            User updatedUser = mapper.convertValue(payload, User.class);

            System.out.println(updatedUser.getEmail());
            UserDTO user = adminService.updateUser(userId, updatedUser);
            return ResponseEntity.ok(user);


        }catch (Exception e) {

            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}