package com.microservices.user_service.utils;

import java.time.Instant;

public class KafkaEvent {
    private String title;
    private String text;
    private String timestamp; // Or use String if you prefer

    // Default constructor (required for serialization)
    public KafkaEvent() {}

    // Parameterized constructor
    public KafkaEvent(String title, String text, String timestamp) {
        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
    }

    // Getters and setters (required for serialization)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
