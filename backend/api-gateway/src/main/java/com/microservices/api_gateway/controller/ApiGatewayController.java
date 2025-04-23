package com.microservices.api_gateway.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.dto.PrintRequestDTO;
import com.microservices.common_models_service.dto.PrintRequestDTO1;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@RestController
@RequestMapping("/broadcast")
@CrossOrigin(origins = "http://localhost:5173")
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


    @GetMapping("/test-notif")
    public void sendNotification(@RequestParam("username")  String username) {
        // Send the notification to the specific user’s queue
        Map<String, String> r= new HashMap<>();

        r.put("username", username);
        r.put("message", "A simple notification");

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", r);
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
