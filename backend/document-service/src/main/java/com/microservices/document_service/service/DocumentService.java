package com.microservices.document_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.dto.SubjectDTO;
import com.microservices.common_models_service.model.*;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.FieldRepository;
import com.microservices.common_models_service.repository.SubjectRepository;
import com.microservices.document_service.client.NotificationClient;
import com.microservices.document_service.client.UserClient;
import com.microservices.common_models_service.dto.AdminDocDTO;
import com.microservices.common_models_service.dto.ProfDocDTO;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.DocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {


    private final DocumentRepository documentRepository;
    private final SubjectRepository subjectRepository;
    private final FieldRepository fieldRepository;

    private final UserClient userClient;
    private final NotificationClient notificationClient;




    @Autowired
    public DocumentService(DocumentRepository documentRepository, SubjectRepository subjectRepository, FieldRepository fieldRepository, UserClient userClient, NotificationClient notificationClient) {
        super();
        this.documentRepository = documentRepository;
        this.subjectRepository = subjectRepository;
        this.fieldRepository = fieldRepository;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
    }

    public String createDocument(Document document) {
        try {
            documentRepository.save(document);

            return document.getId().toString();



        }catch (Exception e){
            System.out.println(e.getMessage());

            return "Error creating document";
        }




    }


    public Document getDocument(String id) {

        try{
            return documentRepository.findById(id).orElse(null);

        }catch (Exception e){
            return null;

        }
    }

    public Iterable<Document> getAllDocs(){

        return documentRepository.findAll();


    }

    public List<String> fetchDocumentIds(String userId) throws IOException, InterruptedException {
        String url = "http://localhost:8000/retrieve-docs/" + userId;

        System.out.println("URL: "+ url);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            String responseBody = response.body();
            ObjectMapper mapper = new ObjectMapper();
            try {
                return mapper.readValue(responseBody, new TypeReference<List<String>>() {});
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                System.err.println("Error parsing JSON response: " + e.getMessage());
                return null;
            }
        } else {
            System.err.println("FastAPI request failed with status code: " + response.statusCode());
            return null;
        }
    }

    public Iterable<Document> getDocumentsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of(); // Return an empty list if no IDs are provided
        }
        return documentRepository.findAllById(ids);
    }

    public Iterable<Document> retrieveKDocuments(String userId) throws IOException, InterruptedException {

        List<String> documentIds = fetchDocumentIds(userId);

        if (documentIds != null) {
            return getDocumentsByIds(documentIds);
        }
        return null;


    }



    public Document previewDocument(String documentId) {

        try{

            return documentRepository.findById(documentId)
                    .orElseThrow();


        }catch (Exception e){
            return null;
        }
    }


    public List<SubjectDTO> getSubjects(){
        try {
            List<Subject> subjects = subjectRepository.findAll();

            // Convert Subject entities to SubjectDTOs
            return subjects.stream()
                    .map(subject -> new SubjectDTO(subject.getSubjectId(), subject.getName()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            return Collections.emptyList(); // Return an empty list instead of null
        }
    }



    public List<FieldDTO> getAllFields() {
        return fieldRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FieldDTO convertToDTO(Field field) {
        FieldDTO dto = new FieldDTO();
        dto.setFieldId(field.getFieldId());
        dto.setName(field.getName());
        return dto;
    }



    public Document downloadDocument(String documentId) {
        try{
            Document document = documentRepository.findById(documentId).orElse(null);

            assert document != null;
            document.setDownloads(document.getDownloads() + 1);

            documentRepository.save(document);

            return document;



        }catch (Exception e){
            return null;
        }

    }




    public Document prepareAndSaveDocument(
            MultipartFile file,
            String docType,
            Long subjectId,
            Long fieldId,
            String userId,
            String title,
            String group,
            String deadline,
            String description,
            String level
    ) throws IOException, DateTimeParseException {
        // Handle Subject
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(
                        () -> new RuntimeException("Subject not found")

                );

        // Handle Field (if provided)
        Field field = null;
        if (fieldId != null) {
            field = fieldRepository.findById(fieldId).orElseThrow(
                    () -> new RuntimeException("Field not found")
            );

        }

        // Handle User
        Optional<User> user = userClient.isUserExist(userId);

        if(user.isEmpty()) {

            throw new IllegalArgumentException("User not found");


        }

        // Create Document
        Document doc = new Document();
        doc.setDocument(file.getBytes());
        doc.setDocType(docType);
        doc.setSubject(subject);
        doc.setField(field);
        doc.setUser(user.get());
        doc.setTitle(title);
        doc.setGroup(group);
        doc.setDescription(description);
        doc.setLevel(level);

        // Parse deadline
        if (deadline != null && !deadline.isEmpty()) {
            doc.setDeadline(LocalDate.parse(deadline));
        } else {
            doc.setDeadline(null);
        }


        try {
            Map<String, Object> notificationPayload = Map.of(
                    "title", "Doc announcement",
                    "message", "New document uploaded",
                    "level", level,
                    "field_id", fieldId,
                    "group", group
            );

            notificationClient.sendGroupNotification(notificationPayload);
        } catch (Exception e) {
            System.err.println("Error sending notification: " + e.getMessage());
        }

        // Save and return ID
        return documentRepository.save(doc);
    }




    public List<Document> getDocumentsByType() {
        return documentRepository.findByTypeInAndVisibility(
                List.of("Administrative", "Educational"),
                "For all professors"
        );
    }
    public List<Document> getDocumentsForAdminOnly(User user) {
        return documentRepository.findByTypeInAndVisibilityAndUser(
                List.of("Administrative", "Educational"),
                "For admin only",
                user
        );
    }


    public Document uploadDocument(String title, String type, String visibility, String message, MultipartFile file, User user) throws IOException {
        // Créer le document et le remplir avec les données reçues
        Document document = new Document();
        document.setTitle(title);
        document.setId(UUID.randomUUID().toString());
        document.setType(type);
        document.setVisibility(visibility);
        document.setMessage(message);  // Enregistrer le message
        document.setDocument(file.getBytes()); // Supposons que tu stockes le fichier en bytes

        // Associer l'utilisateur à ce document
        document.setUser(user);
        //document.setUser(user.getProfile().getFirstname() + " " + user.getProfile().getLastname()); // Enregistrer le nom et prénom

        // Sauvegarder le document dans la base de données
        return documentRepository.save(document);
    }

    public List<ProfDocDTO> getDocumentsByUserId(String userId, int page, int size) {
        return documentRepository.findByUser_UserIdOrderByDateDesc(userId, (Pageable) PageRequest.of(page, size))
                .stream()
                .map(this::mapToDTO)  // Appel de la méthode mapToDTO
                .collect(Collectors.toList());
    }

    private ProfDocDTO mapToDTO(Document doc) {
        ProfDocDTO dto = new ProfDocDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setType(doc.getType());
        dto.setDeadline(doc.getDeadline());
        dto.setDate(doc.getDate());
        dto.setUser_id(doc.getUser().getUserId());  // Prend l'ID de l'utilisateur associé
        dto.setDocument(doc.getDocument());  // Le document est un tableau d'octets
        return dto;
    }
    public ProfDocDTO updateDocument(String id, ProfDocDTO dto) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found"));

        doc.setTitle(dto.getTitle());
        doc.setType(dto.getType());
        doc.setDeadline(dto.getDeadline());
        doc.setDate(dto.getDate());
        doc.setDocument(dto.getDocument());

        return mapToDTO(documentRepository.save(doc));  // Appel de la méthode mapToDTO
    }

    public void deleteDocument(String id) {
        if (!documentRepository.existsById(id)) {
            throw new EntityNotFoundException("Document not found");
        }
        documentRepository.deleteById(id);
    }



}









