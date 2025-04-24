package com.microservices.notification_service.service;


import com.microservices.common_models_service.enums.NotificationTypes;
import com.microservices.common_models_service.model.Notification;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
public class NotificationService {


    private final NotificationRepository notificationRepository;


    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }


    public Notification sendNotification(User targetUser, String title,String message){


        try{
            Notification notification = new Notification();

            notification.setUser(targetUser);
            notification.setType(NotificationTypes.ASSIGNMENT_DEADLINE); // Set the enum type


            notification.setMessage(message);

            notification.setTimestamp(LocalDateTime.now()); // Set the current time
            notification.setRead(false);

            String userId = targetUser.getUser_id();


            String apiGatewayUrl = String.format("http://localhost:9001/broadcast/send-test-notification?userId=%s", userId);            RestTemplate restTemplate = new RestTemplate();




            Notification savedNotification =  notificationRepository.save(notification);
            restTemplate.postForObject(apiGatewayUrl, savedNotification, Void.class);



            return savedNotification;




        }catch (Exception e){

            return null;
        }

    }



    public void sendGroupNotification(String level ,String field, String group, String title ,String message){

        try{

            Notification notification = new Notification();


            notification.setTitle(title);
            notification.setMessage(message);

            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);

            notification.setType(NotificationTypes.COURSE_ANNOUNCEMENT);



            System.out.println("field:" + field);
            System.out.println("level:" + level);

            System.out.println("group:" + group);

            String apiGatewayUrl = String.format("http://localhost:9001/broadcast/send-group-notification?level=%s&field=%s&group=%s", level, field, group);
            RestTemplate restTemplate = new RestTemplate();


            restTemplate.postForObject(apiGatewayUrl, notification, Void.class);








        }catch(Exception e){

        }



    }
}
