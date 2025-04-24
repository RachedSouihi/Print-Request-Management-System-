package com.microservices.common_models_service.model;


import com.microservices.common_models_service.enums.NotificationTypes;
import com.microservices.common_models_service.model.User; // Import your User entity
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notifId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // --- UPDATED PART ---
    @Enumerated(EnumType.STRING) // Stores the enum name (String) in the database
    private NotificationTypes type; // Changed type to the enum
    // --- END UPDATED PART ---

    private String title;
    private String message;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    private boolean read;

    // --- Constructors ---

    public Notification() {
        // Default constructor required by JPA
    }

    // --- UPDATED Constructor ---
    // Constructor now accepts NotificationType enum
    public Notification(User user, NotificationTypes type, String title, String message, LocalDateTime timestamp, boolean read) {
        this.user = user;
        this.type = type; // Assign the enum
        this.title = title;
        this.message = message;
        this.timestamp = timestamp;
        this.read = read;
    }
    // --- END UPDATED Constructor ---


    // --- Getters and Setters ---

    public Long getNotifId() {
        return notifId;
    }

    public void setNotifId(Long notifId) {
        this.notifId = notifId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // --- UPDATED Getter ---
    public NotificationTypes getType() { // Getter returns NotificationType enum
        return type;
    }
    // --- END UPDATED Getter ---

    // --- UPDATED Setter ---
    public void setType(NotificationTypes type) { // Setter accepts NotificationType enum
        this.type = type;
    }
    // --- END UPDATED Setter ---

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    // --- Optional: toString() (adjust to print enum name) ---
    @Override
    public String toString() {
        return "Notification{" +
                "notifId=" + notifId +
                ", userId=" + (user != null ? user.getUser_id() : "null") +
                "type=" + type + // Prints the enum name
                ", title='" + title + '\'' +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                ", read=" + read +
                '}';
    }

    // ... equals() and hashCode()
}