package com.microservices.document_service.controller;
import com.microservices.common_models_service.dto.AdminDocDTO;
import com.microservices.common_models_service.dto.ProfDocDTO;
import com.microservices.common_models_service.dto.ProfileDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.document_service.dto.DocumentMetadataDTO;
import com.microservices.document_service.service.DocumentService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.microservices.document_service.client.UserClient;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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

        doc.getSubject().setName(subject);
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
                doc.getSubject().setName(subject);
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
                    doc.getId().toString(),
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

    @PostMapping("admindoc/upload")
    public Document uploadDocument(
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("visibility") String visibility,
            @RequestParam("message") String message,  // Nouveau paramètre
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        // Simuler récupération de l'utilisateur connecté
        String connectedUserId = "9c912fa9-998f-4c02-a6aa-d9397fa21b89"; // Récupérer l'ID de l'utilisateur connecté, ici c'est un exemple
        User user = userRepository.findById(connectedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Récupérer les informations de l'utilisateur
        String firstname = user.getProfile().getFirstname();
        String lastname = user.getProfile().getLastname();

        // Log pour debug
        System.out.println("Nom: " + lastname);
        System.out.println("Prénom: " + firstname);

        // Appeler le service pour l'upload du document
        return documentService.uploadDocument(title, type, visibility, message, file, user);
    }



    @GetMapping("/by-type-with-file")
    public List<AdminDocDTO> getDocumentsByTypeWithFile() {
        List<Document> documents = documentService.getDocumentsByType();
        return documents.stream()
                .map(doc -> new AdminDocDTO(
                        doc.getId(),
                        doc.getTitle(),
                        doc.getType(),
                        (doc.getDate() != null) ? doc.getDate().toString() : null,
                        (doc.getUser() != null) ? doc.getUser().getProfile().getFirstname() : null,
                        doc.getDocType(),
                        doc.getVisibility(),
                        doc.getMessage(),
                        doc.getDocument() // ⚡ On ajoute le fichier
                ))
                .collect(Collectors.toList());
    }
    @GetMapping("/for-admins")
    public List<AdminDocDTO> getDocumentsForAdmins() {
        // Simuler récupération de l'utilisateur connecté
        String connectedUserId = "9c912fa9-998f-4c02-a6aa-d9397fa21b89"; // Tu mettras ici la vraie récupération de l'auth utilisateur
        User user = userRepository.findById(connectedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Document> documents = documentService.getDocumentsForAdminOnly(user);

        return documents.stream()
                .map(doc -> new AdminDocDTO(
                        doc.getId(),
                        doc.getTitle(),
                        doc.getType(),
                        (doc.getDate() != null) ? doc.getDate().toString() : null,
                        (doc.getUser() != null) ? doc.getUser().getProfile().getFirstname() : null,
                        doc.getDocType(),
                        doc.getVisibility(),
                        doc.getMessage(),
                        doc.getDocument()
                ))
                .collect(Collectors.toList());
    }
    @GetMapping("/profdoc/{userId}")
    public List<ProfDocDTO> getByUserId(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return documentService.getDocumentsByUserId(userId, page, size);
    }

    @PutMapping("/profdocupdate/{id}")
    public ProfDocDTO updateDoc(@PathVariable String id, @RequestBody ProfDocDTO dto) {
        return documentService.updateDocument(id, dto);
    }

    @DeleteMapping("/profdocdelete/{id}")
    public void deleteDoc(@PathVariable String id) {
        documentService.deleteDocument(id);
    }

    @PostMapping("/scan")
    public ResponseEntity<String> scanDocument() {
        // Vérification de la connexion du scanner avant de lancer la numérisation
        if (!isScannerConnected()) {
            return ResponseEntity.status(400).body("Aucun scanner détecté. Veuillez connecter un scanner.");
        }

        // Lancer le processus de numérisation si le scanner est détecté
        ProcessBuilder builder = new ProcessBuilder(
                "java", "-cp",
                "C:\\path\\to\\classes", // Assurez-vous que ce chemin est correct
                "com.microservices.document_service.scanner.MultiScanWithNAPS2",
                "2" // Nombre de documents à scanner, ici 2
        );

        try {
            Process process = builder.start();
            int exitCode = process.waitFor();

            // Vérification du code de sortie du processus de numérisation
            if (exitCode == 0) {
                return ResponseEntity.ok("Scan effectué avec succès.");
            } else {
                return ResponseEntity.status(500).body("Échec du scan. Code de sortie : " + exitCode);
            }
        } catch (Exception e) {
            // Capture de l'exception si un problème se produit
            return ResponseEntity.status(500).body("Erreur lors de la numérisation : " + e.getMessage());
        }
    }

    // Méthode pour vérifier si un scanner est connecté (exemple générique)
    private boolean isScannerConnected() {
        // Ici, vous pouvez implémenter une méthode plus précise pour vérifier la présence d'un scanner
        // Cela pourrait inclure la vérification de périphériques connectés ou d'une API de scanner spécifique
        // Par exemple, vous pouvez utiliser WMI (Windows Management Instrumentation) pour détecter des périphériques de numérisation
        return false; // Retourner `false` si aucun scanner n'est détecté
    }

    @GetMapping("/check-scanner")
    public ResponseEntity<String> checkScanner() {
        if (isScannerConnected()) {
            return ResponseEntity.ok("Scanner détecté.");
        } else {
            return ResponseEntity.status(400).body("Aucun scanner détecté.");
        }
    }



















}
