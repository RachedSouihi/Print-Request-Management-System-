package com.microservices.printrequest_service.service;


import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.PaperType;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.PaperTypeRepository;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import com.microservices.common_models_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PrintRequestService {

    private final PrintRequestRepository printRequestRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PaperTypeRepository paperTypeRepository;


    @Autowired
    public PrintRequestService(PrintRequestRepository printRequestRepository, UserRepository userRepository, DocumentRepository documentRepository, PaperTypeRepository paperTypeRepository) {

        super();
        this.printRequestRepository = printRequestRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.paperTypeRepository = paperTypeRepository;
    }

    public List<PrintRequest> getAllPrintRequests() {


        List<PrintRequest> l=  printRequestRepository.findAll();

        if (l.isEmpty()){
            System.out.println("No PrintRequests found");
            return null;
        }
System.out.println("PrintRequests found");

        return l;
    }




    public PrintRequest savePrintRequest(PrintRequest printRequest) {
        String request_id = UUID.randomUUID().toString();



        User user = userRepository.findById(printRequest.getUser().getUser_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure the Document exists
        Document document = documentRepository.findById(printRequest.getDocument().getId())
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Ensure the PaperType exists
        PaperType paperType = paperTypeRepository.findById(printRequest.getPaperType().getPaperType())
                .orElseThrow(() -> new RuntimeException("PaperType not found"));

        // Assign existing entities

        printRequest.setRequestId(request_id);
        printRequest.setUser(user);
        printRequest.setDocument(document);
        printRequest.setPaperType(paperType);

        return printRequestRepository.save(printRequest);



    }



}
