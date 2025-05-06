package com.microservices.user_service.service;



import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.microservices.user_service.utils.KafkaEvent;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Service
public class KafkaService {

    private final KafkaTemplate<String, KafkaEvent> kafkaTemplate;

    public KafkaService(KafkaTemplate<String, KafkaEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }





    public boolean sendEvent(String topic, String userId, String docId, String event, long timestamp) {


        // Get the current date and time in UTC
        OffsetDateTime currentDateTimeUTC = OffsetDateTime.now(ZoneOffset.UTC);

        // Define the desired format (which is already matched by ISO_INSTANT)
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;

        // Format the current date and time
        String formattedCurrentDate = currentDateTimeUTC.format(formatter);

        KafkaEvent kafkaEvent = new KafkaEvent(
                UUID.randomUUID().toString(),
                userId,
                docId,
                event,
                timestamp

        );




        try {
            kafkaTemplate.send(topic, kafkaEvent);


            return true;
        }catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
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
