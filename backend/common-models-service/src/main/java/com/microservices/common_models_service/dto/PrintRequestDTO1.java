package com.microservices.common_models_service.dto;

import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.PrintRequest;

import java.util.List;
import java.util.stream.Collectors;

public class PrintRequestDTO1 {

    private String requestId;
    private DocumentDTO document; // Nested Document class
    private UserDTO user; // Nested User class
    private String date;
    private int copies;
    private String paperType;
    private double inkUsage;
    private String status;
    private String urgency;
    private List<StatusHistoryEntryDTO> statusHistory;

    // Constructor
    public PrintRequestDTO1(String requestId, DocumentDTO document, UserDTO user, String date, int copies, String paperType, double inkUsage, String status, String urgency, List<StatusHistoryEntryDTO> statusHistory) {
        this.requestId = requestId;
        this.document = document;
        this.user = user;
        this.date = date;
        this.copies = copies;
        this.paperType = paperType;
        this.inkUsage = inkUsage;
        this.status = status;
        this.urgency = urgency;
        this.statusHistory = statusHistory;
    }

    // Default constructor
    public PrintRequestDTO1() {}

    // Getters and setters
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public DocumentDTO getDocument() { return document; }
    public void setDocument(DocumentDTO document) { this.document = document; }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getCopies() { return copies; }
    public void setCopies(int copies) { this.copies = copies; }

    public String getPaperType() { return paperType; }
    public void setPaperType(String paperType) { this.paperType = paperType; }

    public double getInkUsage() { return inkUsage; }
    public void setInkUsage(double inkUsage) { this.inkUsage = inkUsage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public List<StatusHistoryEntryDTO> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryEntryDTO> statusHistory) { this.statusHistory = statusHistory; }

    // Nested User class

    // Nested Document class

    // fromEntity method
    public static PrintRequestDTO1 fromEntity(PrintRequest entity) {
        if (entity == null) return null;

        String userId = entity.getUser() != null ? entity.getUser().getUser_id() : null;
        String firstName = entity.getUser() != null ? entity.getUser().getProfile().getFirstname() : null;
        String lastName = entity.getUser() != null ? entity.getUser().getProfile().getLastname() : null;
        String email = entity.getUser() != null ? entity.getUser().getEmail() : null;
        String paperTypeName = entity.getPaperType() != null ? entity.getPaperType().getPaperType() : null;

        List<StatusHistoryEntryDTO> history = entity.getStatusHistory() != null ?
                entity.getStatusHistory().stream()
                        .map(e -> new StatusHistoryEntryDTO(e.getStatus(), e.getTimestamp().toString()))
                        .collect(Collectors.toList()) : null;

        UserDTO userDTO = new UserDTO(
                userId,
                new ProfileDTO(firstName, lastName),
                email
        );



        Document document = entity.getDocument();
        DocumentDTO documentDTO = document != null ? new DocumentDTO(
                document.getId(),
                document.getSubject()

        ) : null;

        return new PrintRequestDTO1(
                entity.getRequestId(),
                documentDTO,
                userDTO,
                entity.getCreatedAt().toString(),
                entity.getCopies(),
                paperTypeName,
                entity.getInkUsage(),
                entity.getStatus(),
                entity.getUrgency(),
                history
        );
    }

    // StatusHistoryEntryDTO inner class remains the same
    public static class StatusHistoryEntryDTO {
        private String status;
        private String timestamp;

        public StatusHistoryEntryDTO(String status, String timestamp) {
            this.status = status;
            this.timestamp = timestamp;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
}