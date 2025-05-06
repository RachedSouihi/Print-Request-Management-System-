package com.microservices.user_service.service;


import com.microservices.common_models_service.dto.DocumentDTO;
import com.microservices.common_models_service.dto.ProfileDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.*;
//import com.microservices.common_models_service.repository.ProfileRepository;
//import com.microservices.common_models_service.repository.UserRepository;

import com.microservices.common_models_service.repository.*;
import com.microservices.user_service.exception.UserNotFoundException;
import com.microservices.user_service.utils.VerificationData;
import org.keycloak.representations.idm.UserRepresentation;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional // Important! Ensure transactional context
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    //private final PasswordEncoder passwordEncoder;

    private final KeyCloakService keyCloakService;


    //private final ModelMapper modelMapper;
    @Qualifier("adminMapper") // Inject the publicMapper bean
    private final ModelMapper adminMapper;// Inject the configured ModelMapper bean


    @Qualifier("publicMapper")

    private final ModelMapper publicMapper;



    @Autowired
    private static final Duration EXPIRATION = Duration.ofMinutes(10);
    private final DocumentRepository documentRepository;


    @Autowired
    private SubjectRepository subjectRepository;




    @Autowired
    public UserService(UserRepository userRepository, ProfileRepository profileRepository, SubjectRepository subjectRepository, KeyCloakService keyCloakService, DocumentRepository documentRepository, ModelMapper adminMapper, ModelMapper publicMapper) {
        super();
        this.userRepository = userRepository;
        this.keyCloakService = keyCloakService;
        this.profileRepository = profileRepository;

        this.subjectRepository = subjectRepository;

        //this.passwordEncoder = passwordEncoder;
        this.documentRepository = documentRepository;
        this.adminMapper = adminMapper;
        this.publicMapper = publicMapper;
    }



    private UserDTO mapToUserDTO(User user) {
        if (user == null) {
            return null;
        }

        ProfileDTO p = new ProfileDTO(user.getProfile().getFirstname(), user.getProfile().getLastname());
        return new UserDTO(user.getUser_id(), p, user.getEmail());


    }


    public User addUser(User user) {
        try {
            String user_id = UUID.randomUUID().toString();
            user.setUser_id(user_id);

            Profile profile = user.getProfile();
            profile.setUser(user);

            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to add user: " + e.getMessage(), e);
        }
    }
    public List<UserDTO> getAllUsers() {

        try{
            List<User> allUsers =  userRepository.findAll();

            List<UserDTO> dtos = new ArrayList<>();

            for(User user : allUsers) {
                dtos.add(
                        new UserDTO(
                                user.getUser_id(),
                                user.isActive(),
                                user.getProfile() != null ? user.getProfile().getIdCard() : null,
                                user.getEmail(),
                                user.getProfile().getFirstname(),
                                user.getProfile().getLastname(),
                                user.getProfile().getRole(),
                                user.getProfile().getPhone(),
                                user.getProfile().getEducationLevel(),
                                user.getProfile().getField(),

                                user.getProfile().getSubject()
                        )
                );
            }


            return dtos;


        }catch (Exception e){
            System.out.println(e.getMessage());

            return null;

        }
    }



    public Optional<User> findById(String id) {

        return userRepository.findById(id);
    }



    public void deleteUser(String id){
    }



    public Map<String, Object> updateProfile(Map<String, String> request) {

        String firstName = request.get("firstname");
        String lastName = request.get("lastname");
        String email =  request.get("email");
        String phone =  request.get("phone");


        Map<String, Object> resp = keyCloakService.updateProfile(request);
        Optional<User> user = userRepository.findByEmail(email);



        if(user.isPresent() && (int) resp.get("code") == 200) {



            Profile p = user.get().getProfile();
            p.setFirstname(firstName);
            p.setLastname(lastName);
            p.setPhone(phone);
            user.get().setProfile(p);

            User u = userRepository.save(user.get());

            u.setPassword("");

            UserDTO dto =  new UserDTO(
                    u.getUser_id(),
                    u.isActive(),
                    u.getEmail(),
                    u.getProfile().getFirstname(),
                    u.getProfile().getLastname(),
                    u.getProfile().getRole(),
                    u.getProfile().getPhone(),
                    u.getProfile().getEducationLevel(),
                    u.getProfile().getField().getName()
            );

            resp.put("user", dto);



        }


        return resp;




    }

    public Map<String, Object> updatePassword(String email, String oldPassword, String newPassword,
                                              BCryptPasswordEncoder passwordEncoder) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            response.put("code", "404");
            response.put("message", "User not found");
            return response;
        }

        User user = optionalUser.get();

        // Use passwordEncoder.matches to verify the old password correctly.


        System.out.println("new password: " + newPassword);
       /*if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            response.put("code", "400");
            response.put("message", "Wrong password");
            return response;
        }*/

        // Update password in the external service (e.g., Keycloak)
        if (keyCloakService.updatePassword(email, newPassword) == null) {
            response.put("code", "500");
            response.put("message", "Password update failed in external service");
            return response;
        }

        // Update the password in the local database
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        response.put("code", "200");
        response.put("message", "Password updated successfully");
        return response;
    }



    public Map<String, Object> getToken(String username, String password) throws Exception {
        return keyCloakService.getToken(username, password);
    }




    public Map<String, Object> signUp(User user, BCryptPasswordEncoder passwordEncoder) throws Exception {
        try{
            String password = user.getPassword();
            System.out.println("Dectypted password: " + password);

            keyCloakService.createUserKeyCloak(user.getEmail(), user.getPassword());



            user.setPassword(passwordEncoder.encode(user.getPassword()));

            Profile profile = user.getProfile();


            String user_id = UUID.randomUUID().toString();
            user.setUser_id(user_id);

            profile.setUser(user);

            User saved_user = userRepository.save(user);
            //profileRepository.save(profile);



            Map<String, Object> tokens =  keyCloakService.getToken(user.getEmail(), password);

            Map<String, Object> response = new HashMap<>();
            tokens.put("user_id", user_id);
            response.put("tokens", tokens);
            response.put("code", "200");
            response.put("user", saved_user);

            return response;





        }catch (Exception e){
            System.out.println(e.getMessage());
            return null;
        }


    }

    public Map<String, Object> login(String email, String password) throws Exception {

        try {
            System.out.println("email: " + email);
            System.out.println("password: " + password);

            Map<String, Object> tokens = keyCloakService.getToken(email, password);
            Map<String, Object> response = new HashMap<>();

            System.out.println("tokens: " + tokens);


            Optional<User> opt_user = userRepository.findByEmail(email);
            if (opt_user.isPresent()) {

                User user = opt_user.get();
                UserDTO userDTO = new UserDTO(
                        user.getUser_id(),
                        new ProfileDTO(
                                user.getProfile().getFirstname(),
                                user.getProfile().getLastname(),
                                user.getProfile().getRole(),
                                user.getProfile().getPhone(),
                                user.getProfile().getEducationLevel(),
                                user.getProfile().getField() != null ? user.getProfile().getField().getName() : null
                        ),
                        user.getEmail()


                );

                response.put("data", userDTO);
                response.put("code", "200");
                response.put("tokens", tokens);


            } else {
                response.put("code", "404");
                response.put("message", "User not found");

            }

            System.out.println(response);

            return response;


        } catch (Exception e) {

            System.out.println(e.getMessage());
            return null;
        }


    }



    public String toggleSaveDocument(String userId, String documentId) {

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            System.out.println(user.getSavedDocuments());


            String action;
            if (user.hasSavedDocument(document)) {  // The `hasSavedDocument` checks if the document is already saved
                user.unsaveDocument(document);  // The `unsaveDocument` removes the document from saved ones

                action = "document unsaved";
            } else {
                user.saveDocument(document); // Save the document
                action = "document saved";
            }

            userRepository.save(user);

            return action;




        }catch (Exception e){

            System.out.println(e.getMessage());

            return null;

        }
    }


    public List<DocumentDTO> getSavedDocuments(String userId) {

        try{

            Optional<User> userOptional = userRepository.findUserWithDocuments(userId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                List<DocumentDTO> savedDocs = new ArrayList<>();
                for(Document doc: user.getSavedDocuments()){

                    DocumentDTO dto = new DocumentDTO(
                            doc.getId(),
                            doc.getDocType() ,
                            doc.getSubject().getSubjectId(),
                            doc.getSubject() != null ? doc.getSubject().getName() : null,
                            doc.getLevel(),
                            doc.getField() != null ? doc.getField().getFieldId(): null,


                            doc.getField() != null ? doc.getField().getName(): null,
                            doc.getDownloads(),
                            doc.getRating(),
                            doc.getDescription(),
                            mapToUserDTO(doc.getUser())

                    );


                    savedDocs.add(dto);



                }

                return savedDocs;
            }
            return null;


        } catch (Exception e) {

            return null;
        }
    }

    public UserDTO getUserWithSavedDocuments(String userId) {
        Optional<User> userOptional = userRepository.findUserWithDocuments(userId);

        if(userOptional.isPresent()){
            System.out.println(userOptional.get().getUser_id());
            System.out.println(userOptional.get().getProfile().getFirstname());
        }
        return userOptional.map(user -> adminMapper.map(user, UserDTO.class))
                .orElse(null);
    }

    public UserDTO getUserInformations(String userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            return userOptional.map(UserDTO::fromUser)
                    .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        } catch (UserNotFoundException e) {
            System.out.println(e.getMessage());
            throw e;
        } catch (Exception e) {
            System.out.println("Error retrieving user information: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve user information", e);
        }
    }



    /*public Set<Document> getSavedDocuments(String userId) {

        Optional<User> user = userRepository.findById(userId);

        if(user.isPresent()) {

            return user.get().getSavedDocuments();
        }else{

            return null;
        }




    }*/

}
