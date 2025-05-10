package com.microservices.document_service.service;

import com.microservices.common_models_service.dto.AdminDocDTO;
import com.microservices.common_models_service.dto.PrintRequestDTO1;
import com.microservices.common_models_service.dto.PrintRequestDTO2;
 // ❌ Mauvais
import com.microservices.common_models_service.dto.ProfDocDTO; // ✅ Correct

import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.PaperType;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.PaperTypeRepository;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import com.microservices.common_models_service.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {


    private final DocumentRepository documentRepository;
    private static final int PAGE_SIZE = 10;


    @Autowired
    public DocumentService(DocumentRepository documentRepository) {
        super();
        this.documentRepository = documentRepository;
    }
    @Autowired
    private PrintRequestRepository printRequestRepository;

    public String createDocument(Document document) {
        try {
            documentRepository.save(document);

            return document.getId().toString();



        }catch (Exception e){

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

    //hyhy

    // Version améliorée de update
    @Transactional
    public AdminDocDTO updatedocDocument(AdminDocDTO adminDocDTO) {
        Document existingDocument = documentRepository.findById(adminDocDTO.getId())
                .orElseThrow(() -> new NoSuchElementException("Document not found with id: " + adminDocDTO.getId()));

        // Mise à jour conditionnelle des champs
        if (adminDocDTO.getTitle() != null) {
            existingDocument.setTitle(adminDocDTO.getTitle());
        }
        if (adminDocDTO.getType() != null) {
            existingDocument.setType(adminDocDTO.getType());
        }
        if (adminDocDTO.getVisibility() != null) {
            existingDocument.setVisibility(adminDocDTO.getVisibility());
        }
        if (adminDocDTO.getMessage() != null) {
            existingDocument.setMessage(adminDocDTO.getMessage());
        }

        // Gestion du fichier
        if (adminDocDTO.getDocument() != null && adminDocDTO.getDocument().length > 0) {
            existingDocument.setDocument(adminDocDTO.getDocument());
            if (adminDocDTO.getFileType() != null) {
                existingDocument.setType(adminDocDTO.getFileType());
            }
        }

        // Mise à jour de la date
        existingDocument.setDate(LocalDate.now());

        // Pas besoin de save() explicitement avec @Transactional
        return convertToDTO(existingDocument);
    }

    private AdminDocDTO convertToDTO(Document document) {
        return new AdminDocDTO(
                document.getId(),
                document.getTitle(),
                document.getType(),
                document.getDate() != null ? document.getDate().toString() : null,
                document.getUser() != null && document.getUser().getProfile() != null
                        ? document.getUser().getProfile().getFirstname()
                        : null,
                document.getType(),
                document.getVisibility(),
                document.getMessage(),
                null // Ne pas renvoyer le contenu binaire dans le DTO
        );
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

    private DocumentPageResponse buildResponse(List<Document> documents) {
        UUID nextLastId = null;
        boolean hasMore = false;

        if (!documents.isEmpty()) {
            // On prend l'ID du dernier document comme curseur pour la prochaine requête
            nextLastId = UUID.fromString(documents.get(documents.size() - 1).getId());
            // Si on a récupéré exactement PAGE_SIZE documents, il y a probablement plus de données
            hasMore = documents.size() == PAGE_SIZE;
        }

        return new DocumentPageResponse(
                documents,
                nextLastId,
                hasMore
        );
    }


    @Autowired
    private PaperTypeRepository paperTypeRepository;

    private final String apiGatewayUrl = "http://localhost:9001/broadcast/print-request";

    public PrintRequest handlePrintRequest(PrintRequestDTO2 dto) throws IOException {

        String requestId = UUID.randomUUID().toString();

        // Créer le document à partir du fichier uploadé
        Document document = new Document();
        document.setSubject(dto.getSubject());
        document.setDescription(dto.getInstructions());
        document.setLevel(dto.getLevel());
        document.setField(dto.getSection());
        document.setDocType(dto.getPrintMode());
        document.setDocument(dto.getFile().getBytes());
        document.setTitle(dto.getFile().getOriginalFilename());
        document.setDownloads(0);
        document.setRating(0);

        document = documentRepository.save(document);

        // Récupérer l'utilisateur
        UserRepository userRepository = null;
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Récupérer le type de papier
        PaperType paperType = paperTypeRepository.findById(dto.getPaperType())
                .orElseThrow(() -> new RuntimeException("PaperType not found"));

        // Créer la requête d'impression
        PrintRequest request = new PrintRequest();
        request.setRequestId(requestId);
        request.setUser(user);
        request.setDocument(document);
        request.setCopies(dto.getCopies());
        request.setPaperType(paperType);

        PrintRequest savedRequest = printRequestRepository.save(request);

        // Notification API Gateway
        notifyApiGateway(savedRequest);

        return savedRequest;
    }

    private void notifyApiGateway(PrintRequest request) {
        PrintRequestDTO1 dtoToSend = PrintRequestDTO1.fromEntity(request);
        RestTemplate restTemplate = new RestTemplate();

        try {
            HttpEntity<PrintRequestDTO1> entity = new HttpEntity<>(dtoToSend);
            restTemplate.postForObject(apiGatewayUrl, entity, Void.class);
            System.out.println("✅ Notification envoyée à l'API Gateway");
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de l'envoi à l'API Gateway : " + e.getMessage());
        }
    }






}
