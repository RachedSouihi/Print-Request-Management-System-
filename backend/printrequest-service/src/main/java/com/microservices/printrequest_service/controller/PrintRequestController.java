package com.microservices.printrequest_service.controller;

import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import com.microservices.printrequest_service.service.PrintRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PrintRequestController {

    private final PrintRequestService printRequestService;
    @Autowired
    public PrintRequestController(PrintRequestService printRequestService) {
        this.printRequestService = printRequestService;
    }

    @GetMapping("/print-requests")
    public List<PrintRequest> getAllPrintRequests() {
        return printRequestService.getAllPrintRequests();
    }
}