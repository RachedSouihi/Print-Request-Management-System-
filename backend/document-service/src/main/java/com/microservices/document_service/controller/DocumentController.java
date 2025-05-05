package com.microservices.document_service.controller;
import com.microservices.common_models_service.dto.DocumentDTO;
import com.microservices.common_models_service.dto.ProfileDTO;
import com.microservices.common_models_service.dto.SubjectDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.*;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.document_service.dto.DocumentMetadataDTO;
import com.microservices.document_service.service.DocumentService;
import org.apache.commons.io.input.BOMInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.microservices.document_service.client.UserClient;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@RestController
@RequestMapping("/doc")
public class DocumentController {

    private final DocumentService documentService;


    private final UserClient userClient;

    private final UserRepository userRepository;

    private UserDTO mapToUserDTO(User user) {
        if (user == null) {
            return null;
        }

        ProfileDTO p = new ProfileDTO(user.getProfile().getFirstname(), user.getProfile().getLastname());
        return new UserDTO(user.getUser_id(), p, user.getEmail());


    }





    public DocumentController(DocumentService documentService, UserRepository UserRepository, UserClient userClient, DocumentRepository documentRepository) {
        this.documentService = documentService;
        this.userRepository = UserRepository;
        this.userClient = userClient;
    }

    @GetMapping("/spec-doc")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<String> specDoc() {

        return ResponseEntity.ok("okay");
    }



    // File: DocumentController.java
    @PostMapping("add-doc")
    public ResponseEntity<String> createDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("doc_type") String docType,
            @RequestParam("subject") String subject,
            @RequestParam("field_id") String fieldId,
            @RequestParam("user_id") String userId,
            @RequestParam("title") String title,
            @RequestParam("group") String group,
            @RequestParam("deadline") String deadline,
            @RequestParam("description") String description,
            @RequestParam("level") String level
    ) {
        try {

            System.out.println("userId: " + userId);
            System.out.println("title: "+ title);
            System.out.println("group: " + group);
            System.out.println("deadline: " + deadline);

            System.out.println("description: " + description);


            System.out.println("level: " + level);
            System.out.println("subject: " + subject);
            System.out.println("field: " + fieldId);



            // Delegate all logic to the service
            Document document = documentService.prepareAndSaveDocument(
                    file, docType, Long.parseLong(subject), Long.parseLong(fieldId), userId,
                    title, group, deadline, description, level
            );



            if(document.getId() == null || document.getId().isEmpty()){
                ResponseEntity.status(500).body("An error has occurred, try again please");
            }



            return ResponseEntity.ok("Document created");
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format for deadline. Use format: yyyy-MM-dd");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.internalServerError().body("Error creating document");
        }
    }











    @GetMapping("/docs-metadata")
    public ResponseEntity<List<DocumentMetadataDTO>> getAllDocumentsMetadata() {


        Iterable<Document> docs = documentService.getAllDocs();
        List<DocumentMetadataDTO> metadataList = new ArrayList<>();

        for (Document doc : docs) {
            UserDTO userDTO = mapToUserDTO(doc.getUser());
            metadataList.add(new DocumentMetadataDTO(
                    doc.getId(),
                    doc.getDocType(),
                    doc.getSubject().getName(),
                    doc.getLevel(),

                    doc.getField().getName(),
                    doc.getDownloads(),
                    doc.getRating(),


                    doc.getDescription(),
                    userDTO
            ));
        }
        return ResponseEntity.ok(metadataList);
    }








    @GetMapping("/all")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {

        Iterable<Document> docs = documentService.getAllDocs();


        List<DocumentDTO> dtos = new ArrayList<>();
        for (Document doc : docs) {
            DocumentDTO dto = new DocumentDTO(
                    doc.getId(),
                    doc.getDocType() ,
                    doc.getSubject().getSubjectId(),
                    doc.getSubject() != null ? doc.getSubject().getName() : null,
                    doc.getLevel(),
                    doc.getField() != null ? doc.getField().getFieldId(): null,


                    doc.getField() != null ? doc.getField().getName(): null,
                    doc.getDownloads(),
                    doc.getRating(),
                    doc.getDescription(),
                    mapToUserDTO(doc.getUser())

            );

            dtos.add(dto);




        }


        return ResponseEntity.ok(dtos);






    }

    @GetMapping
    public ResponseEntity<?> getDocumentById(@RequestParam("id") String id) {
        try{
            Document doc = documentService.getDocument(id);
            byte[] fileContent = doc.getDocument();
            String fileName = "fake_doc_name.pdf";

            ByteArrayResource resource = new ByteArrayResource(fileContent);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType("application/pdf")) // e.g., "application/pdf"
                    .body(resource);



        }catch ( Exception e ){
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }


    @GetMapping("/u")
    public Optional<User> getUser(@RequestParam String user_id) {
        return userClient.isUserExist(user_id);

    }


    @GetMapping("/retrieve-docs")
    public ResponseEntity<?> retrieveKDocument(@RequestParam String user_id) {


        try{
            Iterable<Document> docs = documentService.retrieveKDocuments(user_id);
            List<DocumentMetadataDTO> metadataList = new ArrayList<>();


            for (Document doc : docs) {
                UserDTO userDTO = mapToUserDTO(doc.getUser());
                metadataList.add(new DocumentMetadataDTO(
                        doc.getId(),
                        doc.getDocType(),
                        doc.getSubject() != null ? doc.getSubject().getName() : null,
                        doc.getLevel(),

                        doc.getField() != null ? doc.getField().getName(): null,
                        doc.getDownloads(),
                        doc.getRating(),


                        doc.getDescription(),
                        userDTO
                ));



            }

            return ResponseEntity.ok(metadataList);

        }catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving documents");
        }
    }


    @GetMapping("/preview")
    public ResponseEntity<?> previewDocument(@RequestParam("id") String id) {
        try {

            Map<String, String> map = new HashMap<>();
            map.put("docId", id);
            map.put("userId", "242619");

            userClient.trackDocClick(map);
            Document doc = documentService.getDocument(id);


            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getTitle() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new ByteArrayResource(doc.getDocument()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


    @GetMapping("/get-subjects")
    public ResponseEntity<?> getSubjects() {


        try {
            List<SubjectDTO> subjects_list = documentService.getSubjects();


            if(subjects_list != null) {
                return ResponseEntity.ok(subjects_list);
            }

            return ResponseEntity.status(200).body(null);


        }catch (Exception e) {
            return ResponseEntity.status(500).body(null);

        }

    }



    @GetMapping("/get-all-fields")
    public ResponseEntity<List<FieldDTO>> getAllFields() {
        try {
            List<FieldDTO> fields = documentService.getAllFields();
            return ResponseEntity.ok(fields);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }




    @GetMapping("/download")
    public ResponseEntity<Resource> downloadDocument(@RequestParam("id") String id) {
        try {
            Document doc = documentService.downloadDocument(id);




            if(doc != null) {


                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getTitle() + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(new ByteArrayResource(doc.getDocument()));

            }

            return ResponseEntity.status(500).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }








}




