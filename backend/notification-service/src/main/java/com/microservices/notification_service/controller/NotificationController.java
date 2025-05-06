package com.microservices.notification_service.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.dto.NotificationDTO;
import com.microservices.common_models_service.model.Notification;
import com.microservices.common_models_service.model.User;
import com.microservices.notification_service.exception.NotificationNotFoundException;
import com.microservices.notification_service.service.NotificationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    private final NotificationService notificationService;


    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }



    @GetMapping("/get-notifications/{user_id}")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable("user_id") String userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId);
        return ResponseEntity.ok(notifications);
    }
    @PutMapping("/mark-read/{id}")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable("id") Long id) {
        try {
            notificationService.markNotificationAsRead(id); // Call the service method
            return new ResponseEntity<>("Notification marked as read", HttpStatus.OK);
        } catch (NotificationNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to mark notification as read", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/mark-all-read/{user_id}")
    public ResponseEntity<String> markAllNotificationsAsRead(@PathVariable("user_id") String userId) {
        try {
            notificationService.markAllNotificationsAsRead(userId);
            return new ResponseEntity<>("All notifications marked as read for user: " + userId, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to mark all notifications as read", HttpStatus.INTERNAL_SERVER_ERROR);
        }
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


    @PostMapping("/notify-user")
    public ResponseEntity<String> notifyUser(@RequestBody Map<String, Object> payload) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String userId = mapper.convertValue(payload.get("user_id"), String.class);
            String title = mapper.convertValue(payload.get("title"), String.class);
            String message = mapper.convertValue(payload.get("message"), String.class);

            notificationService.createUserNotification(userId, title, message);

            return ResponseEntity.ok("User notified successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/send-group-notification")

    public ResponseEntity<?> sendGroupNotification(@RequestHeader HttpHeaders header, @RequestBody Map<String, Object> payload) {

        ObjectMapper mapper = new ObjectMapper();

        String title = mapper.convertValue(payload.get("title"), String.class);
        String message = mapper.convertValue(payload.get("message"), String.class);

        String level = mapper.convertValue(payload.get("level"), String.class);
        int field = mapper.convertValue(payload.get("field_id"), Integer.class);

        String group = mapper.convertValue(payload.get("group"), String.class);

        System.out.println("title: " + title);
        System.out.println("message: " + message);
        System.out.println("level: " + level);
        System.out.println("field: " + field);
        System.out.println("group: " + group);



        notificationService.sendGroupNotification(level, field, group, title, message);



        return ResponseEntity.ok("Notification sent successfully");






    }






}
