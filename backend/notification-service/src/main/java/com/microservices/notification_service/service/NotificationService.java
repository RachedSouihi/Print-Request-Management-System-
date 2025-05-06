package com.microservices.notification_service.service;


import com.microservices.common_models_service.dto.NotificationDTO;
import com.microservices.common_models_service.enums.NotificationTypes;
import com.microservices.common_models_service.model.Notification;
import com.microservices.common_models_service.model.User;
import com.microservices.common_models_service.repository.NotificationRepository;
import com.microservices.common_models_service.repository.UserRepository;
import com.microservices.notification_service.config.RestTemplateConfig;
import com.microservices.notification_service.exception.NotificationNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {


    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    private RestTemplate restTemplate; // Replace manual instantiation with autowired



    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }





    public NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getNotifId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getTimestamp(),
                notification.isRead()
        );
    }


    public List<NotificationDTO> convertToDTOList(List<Notification> notifications) {
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }



    public List<NotificationDTO> getNotificationsForUser(String userId) {
        // Fetch notifications for the given userId from the data source
        List<Notification> notifications = notificationRepository.findByUserId(userId);

        notifications = notifications.stream()
                .sorted(Comparator.comparing(Notification::getTimestamp).reversed()) // Assuming 'timestamp' is the field
                .toList();


        // Convert the list of Notification entities to NotificationDTO objects
        return convertToDTOList(notifications);

    }



    public void markNotificationAsRead(Long id) {
        Optional<Notification> notificationOptional = notificationRepository.findById(id);
        if (notificationOptional.isEmpty()) {
            throw new NotificationNotFoundException("Notification not found with id: " + id);
        }
        Notification notification = notificationOptional.get();
        notification.setRead(true); // Assuming you have a setRead(true) method in your Notification entity.
        notificationRepository.save(notification);
    }

    public void markAllNotificationsAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        for (Notification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }


    public void createUserNotification(String userId, String title, String message) {
        try {
            User targetUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));


            User u = new User();

            u.setUser_id(userId);

            u.setEmail(u.getEmail());

            //u.setProfile(u.getProfile());
            Notification notification = new Notification();
            notification.setUser(u);
            notification.setType(NotificationTypes.PRINT_REQUEST_STATUS);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);

            Notification savedNotification = notificationRepository.save(notification);

            // Forward to API Gateway
            String apiGatewayUrl = String.format("http://localhost:9001/broadcast/notify-user?userId=%s", userId);
            restTemplate.postForObject(apiGatewayUrl, savedNotification, Void.class);
        } catch (Exception e) {
            System.err.println("Error creating user notification: " + e.getMessage());
        }
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


            String apiGatewayUrl = String.format("http://localhost:9001/broadcast/send-test-notification?userId=%s", userId);
            //RestTemplate restTemplate = new restTemplate();




            Notification savedNotification =  notificationRepository.save(notification);
            restTemplate.postForObject(apiGatewayUrl, savedNotification, Void.class);



            return savedNotification;




        }catch (Exception e){

            return null;
        }

    }



    public void sendGroupNotification(String level ,int field_id, String group, String title ,String message){

        try{

            Notification notification = new Notification();

            List<User> l = userRepository.findStudentsByFieldAndGroup(level, field_id, group);


            notification.setTitle(title);
            notification.setMessage(message);

            notification.setTimestamp(LocalDateTime.now());
            notification.setRead(false);

            notification.setType(NotificationTypes.COURSE_ANNOUNCEMENT);



            String apiGatewayUrl = String.format("http://localhost:9001/broadcast/send-group-notification?level=%s&field=%s&group=%s", level, field_id, group);
            RestTemplate restTemplate = new RestTemplate();



            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Notification> entity = new HttpEntity<>(notification, headers);

            restTemplate.postForObject(apiGatewayUrl, entity, Void.class);



            for(User u : l){

                notification.setUser(u);

                notificationRepository.save(notification);
            }








        }catch(Exception e){

        }



    }
}
