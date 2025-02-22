package com.microservices.common_models_service.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "print_requests")
@Getter
@Setter
public class PrintRequest {
    @Id
    private String requestId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne
    @JoinColumn(name = "doc_id")
    private Document document;

    private String instructions;
    private int copies = 1;
    private boolean color = false;
    private String status = "pending";

    @ManyToOne
    @JoinColumn(name = "paper_type")
    private PaperType paperType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

}