package com.microservices.common_models_service.dto;

import com.microservices.common_models_service.dto.DocumentDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.Profile;
import com.microservices.common_models_service.model.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class ModelMapperConfig {

    @Bean("publicMapper")
    public ModelMapper publicModelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Document -> DocumentDTO (only id and subject)
        modelMapper.createTypeMap(Document.class, DocumentDTO.class)
                .setConverter(context -> new DocumentDTO(
                        context.getSource().getId(),
                        new SubjectDTO(
                                context.getSource().getSubject().getSubjectId(),

                                context.getSource().getSubject().getName()

                        )
                ));

        // User -> UserDTO mapping configuration
        modelMapper.createTypeMap(User.class, UserDTO.class)
                .addMappings(mapper -> {
                    mapper.map(User::getUser_id, UserDTO::setUserId);
                    mapper.map(User::getEmail, UserDTO::setEmail);
                    mapper.map(User::getProfile, UserDTO::setProfile);
                    mapper.using(ctx -> mapDocumentsWithoutUser((Set<Document>) ctx.getSource()))
                            .map(User::getSavedDocuments, UserDTO::setSavedDocuments);
                });

        return modelMapper;
    }

    // Helper method to convert Set<Document> to List<DocumentDTO>
    private List<DocumentDTO> mapDocumentsWithoutUser(Set<Document> documents) {
        return documents.stream()
                .map(doc -> new DocumentDTO(

                        doc.getId(),
                        new SubjectDTO(
                                doc.getSubject().getSubjectId(),

                                doc.getSubject().getName()

                        )
                        )
                )
                .collect(Collectors.toList());
    }

    @Bean("adminMapper")
    public ModelMapper adminModelMapper(@Qualifier("publicMapper") ModelMapper publicMapper) {
        ModelMapper modelMapper = new ModelMapper();

        // Document -> DocumentDTO (full details)
        modelMapper.createTypeMap(Document.class, DocumentDTO.class)
                .setConverter(context -> {
                    Document document = context.getSource();
                    User user = document.getUser();

                    // Customize the UserDTO mapping here
                    UserDTO userDto = new UserDTO(
                            user.getUser_id(),
                            new ProfileDTO(
                                    user.getProfile().getFirstname(),
                                    user.getProfile().getLastname()

                            ),
                            user.getEmail()
                    );

                    return new DocumentDTO(
                            document.getId(),
                            document.getDocType(),
                            document.getSubject().getSubjectId(),

                            document.getSubject().getName(),

                            document.getLevel(),
                            document.getField().getFieldId(),

                            document.getField().getName(),
                            document.getDownloads(),
                            document.getRating(),
                            document.getDescription(),
                            userDto // Include the customized UserDTO
                    );
                });

        // User -> UserDTO (full details)
        modelMapper.createTypeMap(User.class, UserDTO.class)
                .addMappings(mapper -> {
                    mapper.map(User::getUser_id, UserDTO::setUserId);
                    mapper.map(User::getEmail, UserDTO::setEmail);
                    mapper.map(User::getProfile, UserDTO::setProfile);
                    mapper.using(ctx -> {
                        Set<Document> documents = (Set<Document>) ctx.getSource();
                        return new ArrayList<>(documents).stream()
                                .map(doc -> modelMapper.map(doc, DocumentDTO.class))
                                .collect(Collectors.toList());
                    }).map(User::getSavedDocuments, UserDTO::setSavedDocuments);
                });

        return modelMapper;
    }
}



























