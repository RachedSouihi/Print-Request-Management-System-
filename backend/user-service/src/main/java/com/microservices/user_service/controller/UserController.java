package com.microservices.user_service.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import com.microservices.user_service.service.UserService;
import com.microservices.user_service.utils.AESUtil;
import jakarta.ws.rs.QueryParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    private final ObjectMapper objectMapper;
    @Value("${app.secret.key}")
    String SECRET_KEY;

    private final UserService userService;


    @Autowired
    public UserController(UserService userService, ObjectMapper objectMapper) {
        this.userService = userService;
        this.objectMapper = objectMapper;
    }



@PostMapping
public ResponseEntity<?> testPOST() {
        return ResponseEntity.ok("Test ok");




    }

    @GetMapping("/g")
    public ResponseEntity<?> generateSecretKey() throws Exception {

        return ResponseEntity.ok(AESUtil.generateSecretKeyBase64());
    }




@GetMapping("check-pwd")
public ResponseEntity<?> checkPwd(@QueryParam("pwd") String pwd) throws Exception {



    String decryptedPayload = AESUtil.decrypt(pwd, SECRET_KEY);
    Map<String, Object> payloadMap = objectMapper.readValue(decryptedPayload, HashMap.class);

    // Extract the password and timestamp
    String password = (String) payloadMap.get("password");
    long timestamp = (long) payloadMap.get("timestamp");

    // Validate the timestamp
    long currentTime = new Date().getTime();
    long timeDifference = currentTime - timestamp;
    long expirationMillis = 1 * 60 * 1000;

    if (timeDifference > expirationMillis) {
        return ResponseEntity.status(401).body("Payload expired");
    }else{
        return ResponseEntity.ok("Payload valid");
    }

}


    @GetMapping("/signup")
        public ResponseEntity<?> signup(@RequestBody User user) {
        try{
            return ResponseEntity.ok(userService.signUp(user));



        }catch(Exception e){

            return ResponseEntity.ok(e.getMessage());

        }

        }








}
