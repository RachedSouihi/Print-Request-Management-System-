package com.microservices.document_service.service;

import com.microservices.common_models_service.model.Document;

import java.util.List;
import java.util.UUID;

public class DocumentPageResponse {
    private List<Document> documents;
    private UUID nextLastId;
    private boolean hasMore;

    // Constructeur
    public DocumentPageResponse(List<Document> documents, UUID nextLastId, boolean hasMore) {
        this.documents = documents;
        this.nextLastId = nextLastId;
        this.hasMore = hasMore;
    }

    // Getters
    public List<Document> getDocuments() {
        return documents;
    }

    public UUID getNextLastId() {
        return nextLastId;
    }

    public boolean isHasMore() {
        return hasMore;
    }
}
