package com.microservices.common_models_service.dto;

import org.modelmapper.ModelMapper; // Import the correct ModelMapper class
import org.modelmapper.config.Configuration.AccessLevel;
import org.modelmapper.convention.NameTokenizers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration // Add @Configuration annotation to make it a Spring configuration class
public class ModelMapperConfig { // Renamed class to ModelMapperConfig

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper(); // Now using org.modelmapper.ModelMapper
        modelMapper.getConfiguration() // Now you can access getConfiguration()
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(AccessLevel.PRIVATE) // Use AccessLevel enum directly
                .setSourceNameTokenizer(NameTokenizers.UNDERSCORE);
               // .setDestinationNameFormatter(NameFormatters.CAMEL_CASE);
        return modelMapper;
    }
}