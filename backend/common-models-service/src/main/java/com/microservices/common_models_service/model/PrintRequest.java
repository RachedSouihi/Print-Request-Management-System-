package com.microservices.common_models_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "print_requests")
@Getter
@Setter
public class PrintRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "request_id", nullable = false, unique = true)
    private String requestId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne
    @JoinColumn(name = "doc_id", nullable = false)
    private Document document;

    private String instructions;
    private int copies = 1;
    private boolean color = false;
    private String status = "pending";

    @ManyToOne
    @JoinColumn(name = "paper_type_id", nullable = false)
    private PaperType paperType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
