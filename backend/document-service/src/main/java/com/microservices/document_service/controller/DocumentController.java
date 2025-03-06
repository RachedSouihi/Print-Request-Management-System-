package com.microservices.document_service.controller;



import com.microservices.common_models_service.model.Document;

import com.microservices.document_service.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/add")
    public ResponseEntity<Document> addDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("docType") String docType,
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
            @RequestParam("level") String level,
            @RequestParam("section") String section,
            @RequestParam("class") String className,
            @RequestParam("examDate") String examDate,
            @RequestParam("printMode") String printMode) {

        try {
            Document savedDocument = documentService.addDocument(file, docType, subject, description, level, section, className, examDate, printMode);
            return ResponseEntity.ok(savedDocument);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        Optional<Document> document = documentService.getDocumentById(id);
        return document.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
