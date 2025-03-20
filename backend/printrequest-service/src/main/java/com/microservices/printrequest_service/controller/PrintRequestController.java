package com.microservices.printrequest_service.controller;


import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.dto.PrintRequestDTO;
import com.microservices.common_models_service.dto.PrintRequestDTO1;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.printrequest_service.service.PrintRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/p-request")
public class PrintRequestController {


    private final PrintRequestService printRequestService;

    @Autowired
    public PrintRequestController(PrintRequestService printRequestService) {
        this.printRequestService = printRequestService;
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
            System.out.println(print_request.getUser().getUser_id());

            //return ResponseEntity.ok(printRequest);


            PrintRequest printRequest = printRequestService.savePrintRequest(print_request);

            // 2️⃣ Notify the API Gateway via HTTP request
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


            System.out.println("email: "+ dto.getUser().getEmail());
            System.out.println("firstname: "+ dto.getUser().getProfile().getFirstname());
            System.out.println("firstname: "+ dto.getUser().getProfile().getLastname());



            restTemplate.postForObject(apiGatewayUrl, dto, Void.class);

            return ResponseEntity.ok("Print Request Sent");



        }catch(Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }




    @PutMapping("/approve")
    public ResponseEntity<?> approvePrintRequest(@RequestBody Map<String, String> request) {
        try{


            Map<String, String> response = printRequestService.approvePrintRequest(request);

            return ResponseEntity.status(Integer.parseInt(response.get("code"))).body(response.get("message"));


        }catch (Exception e){
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }


    }

}
