package com.microservices.user_service.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;


    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
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
