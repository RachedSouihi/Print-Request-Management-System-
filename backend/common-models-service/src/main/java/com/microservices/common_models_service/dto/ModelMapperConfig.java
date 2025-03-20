package com.microservices.common_models_service.dto;

import com.microservices.common_models_service.dto.DocumentDTO;
import com.microservices.common_models_service.dto.UserDTO;
import com.microservices.common_models_service.model.Document;
import com.microservices.common_models_service.model.User;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class ModelMapperConfig {

    @Bean("publicMapper")
    public ModelMapper publicModelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Configure Document -> DocumentDTO (only id and subject)
        modelMapper.createTypeMap(Document.class, DocumentDTO.class)
                .setConverter(context -> new DocumentDTO(
                        context.getSource().getId(),
                        context.getSource().getSubject()
                ));

        // Configure User -> UserDTO (ignore savedDocuments recursion)
        modelMapper.createTypeMap(User.class, UserDTO.class)
                .addMappings(mapper -> {
                    mapper.map(User::getUser_id, UserDTO::setUserId);
                    mapper.map(User::getEmail, UserDTO::setEmail);
                    mapper.map(User::getProfile, UserDTO::setProfile);
                    mapper.using(ctx -> mapDocumentsWithoutUser((List<Document>) ctx.getSource()))
                            .map(User::getSavedDocuments, UserDTO::setSavedDocuments);
                });

        return modelMapper;
    }

    // Helper method to map Documents without recursion
    private List<DocumentDTO> mapDocumentsWithoutUser(List<Document> documents) {
        return documents.stream()
                .map(doc -> new DocumentDTO(doc.getId(), doc.getSubject())) // Use 2-arg constructor
                .collect(Collectors.toList());
    }

    @Bean("adminMapper")
    public ModelMapper adminModelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        // Admin mappings (full details)
        modelMapper.createTypeMap(Document.class, DocumentDTO.class)
                .setConverter(context -> new DocumentDTO(
                        context.getSource().getId(),
                        context.getSource().getDocType(),
                        context.getSource().getSubject(),
                        context.getSource().getLevel(),
                        context.getSource().getField(),
                        context.getSource().getDownloads(),
                        context.getSource().getRating(),
                        context.getSource().getDescription(),
                        context.getSource().getUser()
                ));



        return modelMapper;
    }
}