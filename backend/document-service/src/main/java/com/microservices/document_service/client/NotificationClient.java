package com.microservices.document_service.client;

import com.microservices.common_models_service.model.User;
import feign.Headers;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

@FeignClient(value="notification", url="http://127.0.0.1:8085/notification")
@Headers("Content-Type: application/json")

public interface NotificationClient {

    @RequestMapping(method = RequestMethod.POST, value = "/send-group-notification")
    void sendGroupNotification(@RequestBody Map<String, Object> payload);
}