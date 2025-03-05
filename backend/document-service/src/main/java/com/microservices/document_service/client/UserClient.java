package com.microservices.document_service.client;
import com.microservices.common_models_service.model.User;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;


@FeignClient(value="user", url="http://127.0.0.1:8081")
public interface UserClient {

    @RequestMapping(method= RequestMethod.GET, value="/user")
    Optional<User> isUserExist(@RequestParam String user_id);

}
