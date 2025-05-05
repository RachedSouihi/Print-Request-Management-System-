package com.microservices.api_gateway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.api_gateway.security.CustomJwtDecoder;
import com.microservices.common_models_service.dto.PrintRequestDTO;
import com.microservices.common_models_service.dto.PrintRequestDTO1;
import com.microservices.common_models_service.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@RestController
@RequestMapping("/broadcast")
public class ApiGatewayController {


    @Autowired
    private SimpMessagingTemplate messagingTemplate;


   



    @PostMapping("/print-request")
    public void broadcastPrintRequest(@RequestBody PrintRequestDTO1 printRequest) {
        try {
            // Convert the PrintRequest to JSON and log it
            //ObjectMapper objectMapper = new ObjectMapper();
            //String jsonMessage = objectMapper.writeValueAsString(printRequest);
            System.out.println("Broadcasting Print Request JSON: " + printRequest);

            // Send the message to WebSocket subscribers
            messagingTemplate.convertAndSend("/topic/printRequests", printRequest);
        } catch (Exception e) {
            System.out.println("Error broadcasting print request: " + e.getMessage());
        }

    }


    @PostMapping("/send-test-notification")
    public void sendNotification(@RequestParam String userId, @RequestBody Notification notification) {
        // Send the notification to the specific user’s queue
        //Map<String, String> r= new HashMap<>();

        //r.put("username", username);
        //r.put("message", "A simple notification");

       

        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }


    @PostMapping("/send-group-notification")
    public void sendSpecificNotification(@RequestHeader HttpHeaders header,  @RequestBody Notification notification, @RequestParam("level") String level, @RequestParam("field") String field, @RequestParam("group") String group) {




        String topic;
       if(field != null && !field.isEmpty()) {
           topic = String.format("/topic/notifications/%s/%s/%s", level, field, group);


       }else{
           topic = String.format("/topic/notifications/%s/%s", level, group);


       }

       System.out.println(topic);

        messagingTemplate.convertAndSend(topic, notification);
    }


    @PostMapping("/notify")
    public void sendFollowNotification(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String message = payload.get("message");

            Map<String, String> notif = new HashMap<>();
            notif.put("username", username);
            notif.put("message", message);
            System.out.println(username);

            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notif);
        } catch (Exception e) {
        }

    }

    // ✅ Nouveau endpoint pour notification lors du follow
    @PostMapping("/notify")
    public void sendFollowNotification(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String message = payload.get("message");

            Map<String, String> notif = new HashMap<>();
            notif.put("username", username);
            notif.put("message", message);
            System.out.println(username);

            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notif);
            System.out.println("🔔 Notification envoyée à : " + username);
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de l'envoi de la notification : " + e.getMessage());
        }

    }

}
