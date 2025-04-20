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

import java.time.LocalDateTime;
import java.util.*;

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


    public Map<String, String> approvePrintRequest(Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        try {
            PrintRequest printRequest = printRequestRepository.findById(request.get("requestId")).orElse(null);
            if (printRequest == null) {
                System.out.println("PrintRequest not found");
                response.put("code", String.valueOf(404));
                response.put("message", "Print request not found");
            } else {
                printRequest.setStatus("APPROVED");

                // Create a new status history entry
                PrintRequest.StatusHistoryEntry entry = new PrintRequest.StatusHistoryEntry();
                entry.setStatus("APPROVED");
                entry.setTimestamp(LocalDateTime.now());

                // Initialize the list if null
                if (printRequest.getStatusHistory() == null) {
                    printRequest.setStatusHistory(new ArrayList<>());
                }

                // Add the entry to the history
                printRequest.getStatusHistory().add(entry);

                printRequestRepository.save(printRequest);
                response.put("code", String.valueOf(200));
                response.put("message", "Approved");
            }
            return response;
        } catch (Exception e) {
            return null;
        }
    }



    public PrintRequest savePrintRequest(PrintRequest printRequest) {
        String request_id = UUID.randomUUID().toString();


        String id= printRequest.getDocument().getId();

        User user = userRepository.findById(printRequest.getUser().getUserId())
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

        return  printRequestRepository.save(printRequest);








    }



}
