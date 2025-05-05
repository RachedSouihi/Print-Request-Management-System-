package com.microservices.notification_service.exception;


@SuppressWarnings("serial")
public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException(String message) {
        super(message);
    }
}