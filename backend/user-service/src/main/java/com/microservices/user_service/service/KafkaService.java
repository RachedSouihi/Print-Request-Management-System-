package com.microservices.user_service.service;



import com.microservices.user_service.utils.KafkaEvent;
import org.springframework.kafka.core.KafkaTemplate;


import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class KafkaService {

    private final KafkaTemplate<String, KafkaEvent> kafkaTemplate;

    public KafkaService(KafkaTemplate<String, KafkaEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public String sendMessage(String topic, Map<String, String> event) {


        String title = event.get("title");
        String message = event.get("text");
        String timestamp = event.get("timestamp");

        KafkaEvent kafkaEvent = new KafkaEvent();

        kafkaEvent.setTitle(title);
        kafkaEvent.setText(message);
        kafkaEvent.setTimestamp(timestamp);


        try {
            kafkaTemplate.send(topic, kafkaEvent);


            return "Message sent";
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return "Error sending message";
        }
        // Optional: Add a callback to handle success/failure
        /*
        ListenableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic, message);
        future.addCallback(new ListenableFutureCallback<>() {
            @Override
            public void onSuccess(SendResult<String, String> result) {
                System.out.println("Sent message: " + message);
            }

            @Override
            public void onFailure(Throwable ex) {
                System.err.println("Failed to send message: " + ex.getMessage());
            }
        });
        */
    }
}
