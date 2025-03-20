package com.microservices.document_service.service;

import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
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

            return document.getId();



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









}
