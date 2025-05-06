package com.microservices.printrequest_service.controller;


import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.dto.PrintRequestDTO;
import com.microservices.common_models_service.dto.PrintRequestDTO1;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.printrequest_service.client.UserClient;
import com.microservices.printrequest_service.service.PrintRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/p-request")
public class PrintRequestController {


    private final PrintRequestService printRequestService;

    private final UserClient userClient;


    @Autowired
    public PrintRequestController(PrintRequestService printRequestService, UserClient userClient) {
        this.printRequestService = printRequestService;
        this.userClient = userClient;
    }




    @GetMapping("/all")
    public ResponseEntity<List<PrintRequestDTO1>> getAllPrintRequest() {
        System.out.println("getAllPrintRequest");
        try{
            List<PrintRequest> printRequests = printRequestService.getAllPrintRequests();

            if(!printRequests.isEmpty()){

                List<PrintRequestDTO1> dtos = printRequests.stream()
                        .map(PrintRequestDTO1::fromEntity)
                        .collect(Collectors.toList());

                return ResponseEntity.ok(dtos);




                //return ResponseEntity.ok(l);
            }

            return ResponseEntity.badRequest().build();
        }catch(Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }



    @PostMapping("/send-print-request")
    public ResponseEntity<?> printRequest(@RequestBody PrintRequest print_request) {


        try {



            PrintRequest printRequest = printRequestService.savePrintRequest(print_request);

            // Notify the API Gateway via HTTP request
            String apiGatewayUrl = "http://localhost:9001/broadcast/print-request";
            RestTemplate restTemplate = new RestTemplate();

            /*PrintRequestDTO pr_dto = new PrintRequestDTO(
                   printRequest.getRequestId(),
                   printRequest.getDocument().getDocType(),
                   printRequest.getDocument().getSubject(),
                   printRequest.getDocument().getDescription(),
                   printRequest.getDocument().getDownloads(),
                    printRequest.getDocument().getRating(),
                            printRequest.getDocument().getLevel(),
                            printRequest.getDocument().getField(),
                            printRequest.getCreatedAt(),
                    printRequest.getUser().getUser_id()


            );*/


            PrintRequestDTO1 dto = PrintRequestDTO1.fromEntity(printRequest);

            

            Map<String, String> request = new HashMap<>();

            request.put("userId", printRequest.getUser().getUser_id());

            request.put("docId", printRequest.getDocument().getId());

            request.put("topic", "inputtopic");

            System.out.println(request);



            request.put("eventType", "print");



            //userClient.sendKafkaEvent(request);

            restTemplate.postForObject(apiGatewayUrl, dto, Void.class);

            return ResponseEntity.ok("Print Request Sent");



        }catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }



    @PutMapping("/update-print-request")
    public ResponseEntity<?> updatePrintRequest(@RequestBody PrintRequestDTO1 printRequest) {
        try {
            PrintRequest updatedRequest = printRequestService.updatePrintRequest(printRequest);
            System.out.println("updatePrintRequest" + updatedRequest.getRequestId() );
            return ResponseEntity.ok(PrintRequestDTO1.fromEntity(updatedRequest));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            System.out.println(e.getMessage());
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }


    @DeleteMapping("/delete-print-request/{requestId}")
    public ResponseEntity<?> deletePrintRequest(@PathVariable String requestId) {
        try {
            printRequestService.deletePrintRequest(requestId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Print request deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete print request: " + e.getMessage()));
        }
    }

    @PutMapping("/approve-reject")
    public ResponseEntity<?> approvePrintRequest(@RequestBody Map<String, String> request) {
        try{


            Map<String, String> response = printRequestService.approveRejectPrintRequest(request);


            System.out.println(response);
            return ResponseEntity.status(Integer.parseInt(response.get("code"))).body(response.get("message"));


        }catch (Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }


    }




    @PostMapping("/approve-reject-requests")
    public ResponseEntity<?> approveMultipleRequests(@RequestBody Map<String, Object> request) {
        try {
            // Extract requestIds and status from the request map
            List<String> printRequestIds = (List<String>) request.get("requestIds");
            String status = (String) request.get("status");

            // Ensure values are properly retrieved
            if (printRequestIds == null || status == null) {
                return ResponseEntity.badRequest().body("Missing required fields: requestIds or status");
            }

            // Convert Boolean status to String


            Map<String, String> response = printRequestService.approveMultiplePrintRequests(printRequestIds, status);
            return ResponseEntity.status(Integer.parseInt(response.get("code"))).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }




    @GetMapping("/get-prioritized-requests")
    public ResponseEntity<?> getQueue() {

        try{

            List<PrintRequest> orderedPrintRequests = printRequestService.getPrioritizedRequests();


            List<PrintRequestDTO1> dtos = orderedPrintRequests.stream()
                    .map(PrintRequestDTO1::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    dtos
            );

        }catch (Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {

        try{

            return ResponseEntity.ok(printRequestService.getMetrics()   );
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/get-top-documents")
    public ResponseEntity<?> getTopDocuments() {
        try{
            return ResponseEntity.ok(printRequestService.getTopDocuments());
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/volume")
    public ResponseEntity<?> getVolume() {
        try{

            return ResponseEntity.ok(
                    printRequestService.getVolumeOverTime()
            );

        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }







}


