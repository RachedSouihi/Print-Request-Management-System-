package com.microservices.user_service.utils;

import java.time.Instant;

public class KafkaEvent {
    private String id;
    private String user_id;
    private String doc_id; // Or use String if you prefer

    private String event;

    private long timestamp;




    // Default constructor (required for serialization)
    public KafkaEvent() {
    }

    public KafkaEvent(String id, String user_id, String doc_id, String event, long timestamp) {
        this.id = id;
        this.user_id = user_id;
        this.doc_id = doc_id;
        this.event = event;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getDoc_id() {
        return doc_id;
    }

    public void setDoc_id(String doc_id) {
        this.doc_id = doc_id;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}

