package com.microservices.document_service.service;

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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentService {


    private final DocumentRepository documentRepository;


    @Autowired
    public DocumentService(DocumentRepository documentRepository) {
        super();
        this.documentRepository = documentRepository;
    }

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
