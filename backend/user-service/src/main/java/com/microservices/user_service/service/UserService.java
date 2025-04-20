package com.microservices.user_service.service;
import com.microservices.common_models_service.dto.ProfileDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.*;
//import com.microservices.common_models_service.repository.ProfileRepository;
//import com.microservices.common_models_service.repository.UserRepository;

import com.microservices.common_models_service.repository.*;
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



    @Autowired
    private static final Duration EXPIRATION = Duration.ofMinutes(10);
    private final DocumentRepository documentRepository;


    @Autowired
    private SubjectRepository subjectRepository;




    @Autowired
    public UserService(UserRepository userRepository, ProfileRepository profileRepository, SubjectRepository subjectRepository, KeyCloakService keyCloakService, DocumentRepository documentRepository, ModelMapper adminMapper) {
        super();
        this.userRepository = userRepository;
        this.keyCloakService = keyCloakService;
        this.profileRepository = profileRepository;

        this.subjectRepository = subjectRepository;

        //this.passwordEncoder = passwordEncoder;
        this.documentRepository = documentRepository;
        this.adminMapper = adminMapper;
    }


    public List<UserDTO> getAllUsers() {

        try{
            List<User> allUsers =  userRepository.findAll();

            List<UserDTO> dtos = new ArrayList<>();

            for(User user : allUsers) {
                dtos.add(
                        new UserDTO(
                                user.getUserId(),
                                user.isActive(),
                                user.getEmail(),
                                user.getProfile().getFirstname(),
                                user.getProfile().getLastname(),
                                user.getProfile().getRole(),
                                user.getProfile().getPhone(),
                                user.getProfile().getEducationLevel(),
                                user.getProfile().getField()
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


        System.out.println(resp);

        if(user.isPresent() && (int) resp.get("code") == 200) {



            Profile p = user.get().getProfile();
            p.setFirstname(firstName);
            p.setLastname(lastName);
            p.setPhone(phone);
            user.get().setProfile(p);

            User u = userRepository.save(user.get());

            resp.put("user", u);



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
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            response.put("code", "400");
            response.put("message", "Wrong password");
            return response;
        }

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

        try{
            System.out.println("email: " + email);
            System.out.println("password: " + password);

            Map<String, Object> tokens =  keyCloakService.getToken(email, password);
            Map<String, Object> response = new HashMap<>();

            System.out.println("tokens: " + tokens);


            Optional<User> opt_user = userRepository.findByEmail(email);
            if(opt_user.isPresent()) {

                User user = opt_user.get();
                UserDTO userDTO = new UserDTO(
                        user.getUserId(),
                        new ProfileDTO(
                                user.getProfile().getFirstname(),
                                user.getProfile().getLastname(),
                                user.getProfile().getRole(),
                                user.getProfile().getPhone(),
                                user.getProfile().getEducationLevel(),
                                user.getProfile().getField()
                        ),
                        user.getEmail()


                );

                response.put("data", userDTO);
                response.put("code", "200");
                response.put("tokens", tokens);






            }else{
                response.put("code", "404");
                response.put("message", "User not found");

            }

            System.out.println(response);

            return response;



        }catch(Exception e){

            System.out.println(e.getMessage());
            return null;
        }


    }


    @Transactional
    public String saveChosenSubjects(String userId, List<String> subjectNames) {
        try {
            // Check if the user exists
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));

            // Find subjects by name
            List<Subject> subjects = subjectRepository.findByNameIn(subjectNames);
            if (subjects.size() != subjectNames.size()) {
                Set<String> availableSubjects = subjectRepository.findAll().stream()
                        .map(Subject::getName)
                        .collect(Collectors.toSet());
                String missingSubjects = subjectNames.stream()
                        .filter(name -> !availableSubjects.contains(name))
                        .collect(Collectors.joining(", "));
                return "Error: The following subjects are not available: " + missingSubjects;
            }

            // Set the subjects for the user
            user.setSubjects(new HashSet<>(subjects));

            return "Subjects saved successfully";
        } catch (NoSuchElementException e) {
            return e.getMessage();
        } catch (Exception e) {
            return "Error: Failed to save subjects. " + e.getMessage();
        }
    }

    public void saveDocument(String userId, String documentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        user.saveDocument(document);
        userRepository.save(user);
    }

    public UserDTO getUserWithSavedDocuments(String userId) {
        Optional<User> userOptional = userRepository.findUserWithDocuments(userId);

        if(userOptional.isPresent()){
            System.out.println(userOptional.get().getUserId());
            System.out.println(userOptional.get().getProfile().getFirstname());
        }
        return userOptional.map(user -> adminMapper.map(user, UserDTO.class))
                .orElse(null);
    }

    public UserDTO getUserInformations(String userId) {

        try{

            Optional<User> userOptional = userRepository.findById(userId);

            if(userOptional.isPresent()) {
                User user = userOptional.get();
                return new UserDTO(
                        user.getUserId(),
                        user.isActive(),
                        user.getEmail(),
                        user.getProfile().getFirstname(),
                        user.getProfile().getLastname(),
                        user.getProfile().getRole(),
                        user.getProfile().getPhone(),
                        user.getProfile().getEducationLevel(),
                        user.getProfile().getField()
                );






            }else{
                return null;
            }

        }catch (Exception e){
            System.out.println(e.getMessage());
            return null;
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
