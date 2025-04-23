package com.microservices.printrequest_service.service;

import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.PaperType;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.PaperTypeRepository;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.printrequest_service.dto.MetricsDTO;
import com.microservices.printrequest_service.dto.TopDocumentDTO;
import com.microservices.printrequest_service.dto.UserBreakdown;
import com.microservices.printrequest_service.dto.VolumeEntry;
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

    //hi
    // Ajouté à la fin de PrintRequestService.java

    public MetricsDTO getMetrics() {
        List<PrintRequest> allRequests = printRequestRepository.findAll();

        int totalPages = allRequests.stream().mapToInt(PrintRequest::getCopies).sum();
        int totalRequests = allRequests.size();

        List<User> allUsers = userRepository.findAll();
        int professors = (int) allUsers.stream().filter(u -> u.getProfile().getRole().equalsIgnoreCase("PROFESSOR")).count();
        int students = (int) allUsers.stream().filter(u -> u.getProfile().getRole().equalsIgnoreCase("STUDENT")).count();

        UserBreakdown breakdown = new UserBreakdown();
        breakdown.total = professors + students;
        breakdown.professors = professors;
        breakdown.students = students;

        MetricsDTO metricsDTO = new MetricsDTO();
        metricsDTO.pagesPrinted = totalPages;
        metricsDTO.printRequests = totalRequests;
        metricsDTO.activeUsers = breakdown;

        return metricsDTO;
    }

    public List<VolumeEntry> getVolumeOverTime() {
        List<PrintRequest> allRequests = printRequestRepository.findAll();
        Map<String, VolumeEntry> volumeMap = new TreeMap<>();

        for (PrintRequest request : allRequests) {
            String date = request.getCreatedAt().toLocalDate().toString();
            String role = request.getUser().getProfile().getRole();

            VolumeEntry entry = volumeMap.getOrDefault(date, new VolumeEntry());
            entry.date = date;

            if ("PROFESSOR".equalsIgnoreCase(role)) {
                entry.professors += request.getCopies();
            } else if ("STUDENT".equalsIgnoreCase(role)) {
                entry.students += request.getCopies();
            }

            volumeMap.put(date, entry);
        }

        return new ArrayList<>(volumeMap.values());
    }

    public List<TopDocumentDTO> getTopDocuments() {
        List<PrintRequest> allRequests = printRequestRepository.findAll();
        Map<String, Integer> docCountMap = new HashMap<>();

        for (PrintRequest request : allRequests) {
            String docId = request.getDocument().getId();
            docCountMap.put(docId, docCountMap.getOrDefault(docId, 0) + request.getCopies());
        }

        List<Map.Entry<String, Integer>> sortedDocs = new ArrayList<>(docCountMap.entrySet());
        sortedDocs.sort((a, b) -> b.getValue() - a.getValue());

        List<TopDocumentDTO> topDocs = new ArrayList<>();
        for (int i = 0; i < Math.min(5, sortedDocs.size()); i++) {
            String docId = sortedDocs.get(i).getKey();
            Document doc = documentRepository.findById(docId).orElse(null);
            if (doc != null) {
                TopDocumentDTO dto = new TopDocumentDTO();
                dto.subject = doc.getSubject();
                dto.level = doc.getLevel();
                dto.owner = doc.getUser().getUserId();
                dto.prints = sortedDocs.get(i).getValue();
                topDocs.add(dto);
            }
        }

        return topDocs;
    }




}
