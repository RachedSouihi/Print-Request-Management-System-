package com.microservices.document_service.client;
import com.microservices.common_models_service.model.User;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.Optional;


@FeignClient(value="user", url="http://127.0.0.1:8082")
public interface UserClient {

    @RequestMapping(method= RequestMethod.GET, value="/user")
    Optional<User> isUserExist(@RequestParam String user_id);



    @RequestMapping(method = RequestMethod.POST, value = "/user/track-doc-click")
    void trackDocClick(@RequestBody Map<String, String> request);




}
