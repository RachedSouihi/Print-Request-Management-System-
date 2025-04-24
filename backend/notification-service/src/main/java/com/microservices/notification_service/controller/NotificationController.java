package com.microservices.notification_service.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.User;
import com.microservices.notification_service.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    private final NotificationService notificationService;


    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send-notif")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> payload) {

        try{

            ObjectMapper mapper = new ObjectMapper();

            User targetUser = mapper.convertValue(payload.get("user"), User.class);
            String title = mapper.convertValue(payload.get("title"), String.class);
            String message = mapper.convertValue(payload.get("message"), String.class);


            notificationService.sendNotification(targetUser, title, message);


            return ResponseEntity.ok("Notification sent successfully");



        }catch (Exception e){

            return ResponseEntity.status(500).body(e.getMessage());


        }
    }


    @PostMapping("/send-group-notification")

    public ResponseEntity<?> sendGroupNotification(@RequestBody Map<String, Object> payload) {

        ObjectMapper mapper = new ObjectMapper();

        String title = mapper.convertValue(payload.get("title"), String.class);
        String message = mapper.convertValue(payload.get("message"), String.class);

        String level = mapper.convertValue(payload.get("level"), String.class);
        String field = mapper.convertValue(payload.get("field"), String.class);

        String group = mapper.convertValue(payload.get("group"), String.class);



        notificationService.sendGroupNotification(level, field, group, title, message);



        return ResponseEntity.ok("Notification sent successfully");






    }




}
