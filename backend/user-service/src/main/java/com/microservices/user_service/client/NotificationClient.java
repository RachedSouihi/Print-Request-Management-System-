package com.microservices.printrequest_service.client;

import feign.Headers;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(value = "notification", url = "http://127.0.0.1:8085/notification")
@Headers("Content-Type: application/json")
public interface NotificationClient {


    @PostMapping("/notify-user")
    void notifyUser(@RequestBody Map<String, Object> payload);
}