package com.microservices.printrequest_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.Map;

@FeignClient(value="user", url="http://127.0.0.1:8082")

public interface UserClient {

    @RequestMapping(method= RequestMethod.POST, value="/user/send-kafka-event")
    boolean sendKafkaEvent(@RequestBody Map<String, String> request);
}
