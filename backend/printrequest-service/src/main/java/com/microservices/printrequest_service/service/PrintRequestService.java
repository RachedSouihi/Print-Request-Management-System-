package com.microservices.printrequest_service.service;

import com.microservices.common_models_service.model.PrintRequest;
import com.microservices.common_models_service.repository.PrintRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrintRequestService {

    private final PrintRequestRepository printRequestRepository;

    public PrintRequestService(PrintRequestRepository printRequestRepository) {
        this.printRequestRepository = printRequestRepository;
    }

    public List<PrintRequest> getAllPrintRequests() {
        return printRequestRepository.findAll();
    }
}