package com.microservices.printrequest_service.controller;


import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.printrequest_service.service.PrintRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/p-request")
public class PrintRequestController {
    private final PrintRequestService printRequestService;

    @Autowired
    public PrintRequestController(PrintRequestService printRequestService) {
        this.printRequestService = printRequestService;
    }



    @GetMapping("/test")
    public ResponseEntity<?> test() {

        try {

            return ResponseEntity.ok("Hello World");

        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.ok(e.getMessage());
        }
    }


    @GetMapping("/all")
    public ResponseEntity<List<PrintRequest>> getAllPrintRequest() {
            try{
                List<PrintRequest> l = printRequestService.getAllPrintRequests();

                for(PrintRequest printRequest : l){
                    System.out.println(printRequest.getRequestId());
                }

                if(l.size() > 0){
                    return ResponseEntity.ok(l);
                }

                return ResponseEntity.badRequest().build();
            }catch(Exception e){
                e.printStackTrace();
                return ResponseEntity.badRequest().build();
            }
        }



    @PostMapping
    public ResponseEntity<?> printRequest(@RequestBody PrintRequest printRequest) {

        try {
            return ResponseEntity.ok(printRequestService.savePrintRequest(printRequest));



        }catch(Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }




    }



}
