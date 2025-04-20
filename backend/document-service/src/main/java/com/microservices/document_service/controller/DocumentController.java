package com.microservices.document_service.controller;
import com.microservices.common_models_service.dto.ProfileDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.document_service.dto.DocumentMetadataDTO;
import com.microservices.document_service.service.DocumentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.microservices.document_service.client.UserClient;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
        //user.getUser_id(), user.getProfile().getFirstname(), user.getProfile().getLastname(), user.getEmail()
        // u.setUserId(user.getUser_id());
        //u.setEmail(user.getEmail());

        ProfileDTO p = new ProfileDTO(user.getProfile().getFirstname(), user.getProfile().getLastname());
        return new UserDTO(user.getUserId(), p, user.getEmail());






    }





    public DocumentController(DocumentService documentService, UserRepository UserRepository, UserRepository userRepository, UserClient userClient) {
        this.documentService = documentService;
        this.userRepository = UserRepository;
        this.userClient = userClient;
    }

    @GetMapping("/spec-doc")
    @PreAuthorize("hasRole('ROLE_admin')")
    public ResponseEntity<String> specDoc() {

        return ResponseEntity.ok("okay");
    }




    @PostMapping
    public ResponseEntity<String> createDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("doc_type") String docType,
            @RequestParam("subject") String subject,
            @RequestParam("user_id") String userId,
            @RequestParam("doc_id") String docId




    ) throws IOException {
        Document doc = new Document();

        doc.setId(docId);
        String name = file.getOriginalFilename();

        doc.setDocument(file.getBytes());
        doc.setDocType(docType);

        doc.setSubject(subject);
        doc.setTitle(name);
        doc.setDescription("");

        Optional<User> user = userRepository.findById(userId);

        user.ifPresent(doc::setUser);


        documentService.createDocument(doc);


        return ResponseEntity.ok("Document created");







    }


    @PostMapping(value = "/add-doc", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @RequestParam("id") String id,
            @RequestParam("file") List<MultipartFile> files,
            @RequestParam("user_id") String userId,
            @RequestParam("doc_type") String docType,
            @RequestParam("subject") String subject,
            @RequestParam("description") String description) throws IOException {
        try {
            int x = 119;


            for (MultipartFile file : files) {
                Document doc = new Document();


                doc.setDocument(file.getBytes());
                doc.setDocType(docType);

                String name = file.getOriginalFilename();
                doc.setSubject(subject);
                doc.setDescription(name);

                //doc.setDescription(description);
                doc.setId(String.valueOf(x));
                x += 1;

                Optional<User> user = userRepository.findById(userId);

        /*if (user.isPresent()) {
            doc.setUser(
                    user.get()

            );*/


                doc.setUser(user.get());



                documentService.createDocument(doc);
            }

            return ResponseEntity.ok("Docs added successfully");


            //return ResponseEntity.notFound().build();



        }catch(Exception e)

        {
            return ResponseEntity.status(500).body(e.getMessage());


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
                    doc.getSubject(),
                    doc.getLevel(),

                    doc.getField(),
                    doc.getDownloads(),
                    doc.getRating(),


                    doc.getDescription(),
                    userDTO
            ));
        }
        return ResponseEntity.ok(metadataList);
    }






    @GetMapping("/all")
    public ResponseEntity<?> getAllDocuments() {

        Iterable<Document> docs = documentService.getAllDocs();
        Document doc1 = docs.iterator().next();

        byte[] fileContent = doc1.getDocument();
        String fileName = "document.pdf"; // e.g., "document.pdf"

        ByteArrayResource resource = new ByteArrayResource(fileContent);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/pdf")) // e.g., "application/pdf"
                .body(resource);



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



}
