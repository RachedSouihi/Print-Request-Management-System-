package com.microservices.document_service.service;



import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public Document addDocument(MultipartFile file, String docType, String subject, String description,
                                String level, String section, String className, String examDate, String printMode) throws IOException {
        Document document = new Document();
        document.setId(UUID.randomUUID().toString());
        document.setDocType(docType);
        document.setSubject(subject);
        document.setDescription(description);
        document.setDocument(file.getBytes());
        document.setLevel(level);
        document.setSection(section);
        document.setClassName(className);
        document.setExamDate(examDate);
        document.setPrintMode(printMode);

        return documentRepository.save(document);
    }


    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }
}
