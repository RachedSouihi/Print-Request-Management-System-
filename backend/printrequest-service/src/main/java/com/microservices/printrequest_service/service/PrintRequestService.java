package com.microservices.printrequest_service.service;

import com.microservices.common_models_service.dto.PrintRequestDTO1;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.PaperType;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.DocumentRepository;
import com.microservices.common_models_service.repository.PaperTypeRepository;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.printrequest_service.client.NotificationClient;
import com.microservices.printrequest_service.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class PrintRequestService {

    private final PrintRequestRepository printRequestRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PaperTypeRepository paperTypeRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String QUEUE_URL = "http://localhost:8000/get-queue";
    private final NotificationClient notificationClient;


    @Autowired
    public PrintRequestService(PrintRequestRepository printRequestRepository, UserRepository userRepository, DocumentRepository documentRepository, PaperTypeRepository paperTypeRepository, NotificationClient notificationClient) {

        super();
        this.printRequestRepository = printRequestRepository;
        this.userRepository = userRepository;
        this.documentRepository = documentRepository;
        this.paperTypeRepository = paperTypeRepository;
        this.notificationClient = notificationClient;
    }


    public PrintRequest updatePrintRequest(PrintRequestDTO1 printRequest) {

        try {
            // Check if request exists
            PrintRequest existingRequest = printRequestRepository.findById(printRequest.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Print request not found with id: " + printRequest.getRequestId()));

            // Update mutable fields
            existingRequest.setCopies(printRequest.getCopies());
            existingRequest.setColor(printRequest.isColor());
            existingRequest.setInstructions(printRequest.getInstructions());


            return printRequestRepository.save(existingRequest);

        }catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

    public void deletePrintRequest(String requestId) {
        // Find the request first for proper validation
        PrintRequest request = printRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Print request not found with id: " + requestId));

        // Perform actual deletion from database
        printRequestRepository.delete(request);

        // Optional: Add post-deletion cleanup logic if needed
    }

    public List<PrintRequest> getAllPrintRequests() {


        List<PrintRequest> l = printRequestRepository.findAll();

        if (l.isEmpty()) {
            System.out.println("No PrintRequests found");
            return null;
        }
        System.out.println("PrintRequests found");

        return l;
    }


    public Map<String, String> approveRejectPrintRequest(Map<String, String> request) {
        Map<String, String> response = new HashMap<>();
        try {
            PrintRequest printRequest = printRequestRepository.findById(request.get("requestId")).orElse(null);
            if (printRequest == null) {
                System.out.println("PrintRequest not found");
                response.put("code", String.valueOf(404));
                response.put("message", "Print request not found");
            } else {
                String status = request.get("status");
                printRequest.setStatus(status);

                // Create a new status history entry
                PrintRequest.StatusHistoryEntry entry = new PrintRequest.StatusHistoryEntry();
                entry.setStatus(status);
                entry.setTimestamp(LocalDateTime.now());

                // Initialize the list if null
                if (printRequest.getStatusHistory() == null) {
                    printRequest.setStatusHistory(new ArrayList<>());
                }

                // Add the entry to the history
                printRequest.getStatusHistory().add(entry);

                // Trigger notification based on status
                if (status.equals("REJECTED") || status.equals("APPROVED") || status.equals("COMPLETED")) {
                    Map<String, Object> notificationPayload = buildNotificationPayload(printRequest, status);
                    notificationClient.notifyUser(notificationPayload);
                }

                printRequestRepository.save(printRequest);
                response.put("code", String.valueOf(200));
                response.put("message", status);
            }
            return response;
        } catch (Exception e) {
            return null;
        }
    }






    public Map<String, String> approveMultiplePrintRequests(List<String> requestIds, String status) {
        Map<String, String> response = new HashMap<>();
        List<String> processedIds = new ArrayList<>();
        List<String> notFoundIds = new ArrayList<>();

        for (String requestId : requestIds) {
            PrintRequest printRequest = printRequestRepository.findById(requestId).orElse(null);
            if (printRequest != null) {
                // Update status and history
                printRequest.setStatus(status);
                PrintRequest.StatusHistoryEntry entry = new PrintRequest.StatusHistoryEntry();
                entry.setStatus(status);
                entry.setTimestamp(LocalDateTime.now());
                if (printRequest.getStatusHistory() == null) {
                    printRequest.setStatusHistory(new ArrayList<>());
                }
                printRequest.getStatusHistory().add(entry);
                printRequestRepository.save(printRequest);
                processedIds.add(requestId);

                // Trigger notification based on status
                if (status.equals("REJECTED") || status.equals("APPROVED") || status.equals("COMPLETED")) {
                    Map<String, Object> notificationPayload = buildNotificationPayload(printRequest, status);
                    notificationClient.notifyUser(notificationPayload);
                }
            } else {
                notFoundIds.add(requestId);
            }
        }

        if (notFoundIds.isEmpty()) {
            response.put("code", "200");
            response.put("message", "All requests processed successfully");
        } else {
            response.put("code", "207");
            response.put("message", "Partial processing completed");
            response.put("processed", String.join(", ", processedIds));
            response.put("notFound", String.join(", ", notFoundIds));
        }
        return response;
    }


    private Map<String, Object> buildNotificationPayload(PrintRequest printRequest, String status) {
        String title;
        String message;

        switch (status) {
            case "APPROVED":
                title = "Print Request Approved";
                message = "Your print request with ID " + printRequest.getRequestId() + " has been approved.";
                break;
            case "COMPLETED":
                title = "Print Request Completed";
                message = "Your print request with ID " + printRequest.getRequestId() + " has been completed.";
                break;
            case "REJECTED":
                title = "Print Request Rejected";
                message = "Your print request with ID " + printRequest.getRequestId() + " has been rejected.";
                break;
            default:
                title = "Print Request Status Updated";
                message = "The status of your print request with ID " + printRequest.getRequestId() + " has been updated.";
        }

        return Map.of(
                "user_id", printRequest.getUser().getUser_id(),
                "title", title,
                "message", message
        );
    }





    public PrintRequest savePrintRequest(PrintRequest printRequest) {
        String request_id = UUID.randomUUID().toString();


        String id = printRequest.getDocument().getId();

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


    public MetricsDTO getMetrics() {
        // Current time and date ranges
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime prevWeekStart = now.minusDays(14);

        System.out.println("prev week start: " + prevWeekStart);

        System.out.println("week start: " + weekStart);
        System.out.println("now: " + now);
        // Current week totals
        int currentPages = printRequestRepository.sumPagesByDateRange(weekStart, now) != null ?
                printRequestRepository.sumPagesByDateRange(weekStart, now) : 0;
        long currentRequests = printRequestRepository.countRequestsByDateRange(weekStart, now);
        int currentUsers = printRequestRepository.countActiveUsersByDateRange(weekStart, now);

        // Previous week totals
        int prevPages = printRequestRepository.sumPagesByDateRange(prevWeekStart, weekStart) != null ?
                printRequestRepository.sumPagesByDateRange(prevWeekStart, weekStart) : 0;
        long prevRequests = printRequestRepository.countRequestsByDateRange(prevWeekStart, weekStart);
        int prevUsers = printRequestRepository.countActiveUsersByDateRange(prevWeekStart, weekStart);


        System.out.println("currentPages: " + currentPages);
        System.out.println("prevPages: " + prevPages);



        System.out.println("currentRequests: " + currentRequests);
        //System.out.println("currentUsers: " + currentUsers);
        System.out.println("prevRequests: " + prevRequests);

        // Calculate percentage changes
        String pagesChange = calculateChange(currentPages, prevPages);
        String requestsChange = calculateChange(currentRequests, prevRequests);
        String usersChange = calculateChange(currentUsers, prevUsers);

        // Format numbers
        NumberFormat numberFormat = NumberFormat.getInstance();

        // Build MetricItems
        MetricItem pagesPrinted = new MetricItem();
        pagesPrinted.setValue(numberFormat.format(currentPages));
        pagesPrinted.setChange(pagesChange);
        pagesPrinted.setChangeType(getChangeType(currentPages, prevPages));

        MetricItem printRequests = new MetricItem();
        printRequests.setValue(numberFormat.format(currentRequests));
        printRequests.setChange(requestsChange);
        printRequests.setChangeType(getChangeType(currentRequests, prevRequests));

        // Active users breakdown (from existing code)
        List<User> allUsers = userRepository.findAll();
        int professors = (int) allUsers.stream().filter(u -> "PROFESSOR".equalsIgnoreCase(u.getProfile().getRole())).count();
        int students = (int) allUsers.stream().filter(u -> "STUDENT".equalsIgnoreCase(u.getProfile().getRole())).count();
        int totalUsers = professors + students;

        MetricItem activeUsers = new MetricItem();
        activeUsers.setValue(numberFormat.format(totalUsers));
        activeUsers.setChange(usersChange);
        activeUsers.setChangeType(getChangeType(currentUsers, prevUsers));

        // Add breakdown (same as before)
        if (totalUsers > 0) {
            activeUsers.setBreakdown(List.of(
                    new BreakdownItem("Professors", String.valueOf(professors),
                            String.format("%.0f%%", (professors * 100.0 / totalUsers))),
                    new BreakdownItem("Students", String.valueOf(students),
                            String.format("%.0f%%", (students * 100.0 / totalUsers)))
            ));
        }

        // Keep totalCost static currently
        MetricItem totalCostItem = new MetricItem();
        totalCostItem.setValue("$1,234");
        totalCostItem.setChange("-3%");
        totalCostItem.setChangeType("decrease");
        totalCostItem.setBreakdown(List.of(
                new BreakdownItem("Paper", "$925", "75%"),
                new BreakdownItem("Ink", "$309", "25%")
        ));

        MetricsDTO metricsDTO = new MetricsDTO();
        metricsDTO.setPagesPrinted(pagesPrinted);
        metricsDTO.setTotalCost(totalCostItem);
        metricsDTO.setPrintRequests(printRequests);
        metricsDTO.setActiveUsers(activeUsers);

        return metricsDTO;
    }

    // Helper method to calculate percentage change
    private String calculateChange(long current, long previous) {
        if (previous == 0) return "+0%"; // Handle division by zero
        double change = ((current - previous) * 100.0) / previous;
        return String.format("%+.0f%%", change);
    }

    // Helper method to determine change type
    private String getChangeType(long current, long previous) {
        return current >= previous ? "increase" : "decrease";
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
                dto.subject = doc.getSubject().getName();
                dto.level = doc.getLevel();
                dto.owner = doc.getUser().getProfile().getLastname()+ " " + doc.getUser().getProfile().getFirstname();
                dto.prints = sortedDocs.get(i).getValue();
                topDocs.add(dto);
            }
        }

        return topDocs;
    }







    public List<PrintRequest> getPrioritizedRequests() {
        try {
            // Fetch sorted queue from the endpoint
            List<List<Object>> sortedQueue = restTemplate.getForObject(QUEUE_URL, List.class);

            if (sortedQueue == null || sortedQueue.isEmpty()) {
                System.out.println("No queue data available.");
                return List.of();
            }

            // Extract ordered request IDs
            List<String> orderedIds = sortedQueue.stream()
                    .map(item -> (String) item.getFirst())
                    .toList();

            System.out.println(orderedIds);

            // Retrieve print requests based on ordered IDs
            List<PrintRequest> orderedRequests = sortedQueue.stream()
                    .map(item -> new Object[]{(String) item.get(0), (Double) item.get(1)}) // Extract ID & priority
                    .map(entry -> {
                        Optional<PrintRequest> optionalRequest = printRequestRepository.findById((String) entry[0]);
                        return optionalRequest.map(request -> {
                            request.setPriority((Double) entry[1]); // Update priority
                            return request;
                        });
                    })
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .collect(Collectors.toList());

            return orderedRequests;
        } catch (Exception e) {
            System.err.println("Error fetching queue: " + e.getMessage());
            return List.of();
        }
    }

}












