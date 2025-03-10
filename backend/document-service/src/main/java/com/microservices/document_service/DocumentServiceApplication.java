package com.microservices.document_service;

import com.microservices.api_gateway.config.JwtTokenProviderConfig;
import com.microservices.api_gateway.config.KeyCloakConfig;
import com.microservices.api_gateway.config.SecurityConfig;
import com.microservices.api_gateway.config.SecurityProperties;
import com.microservices.common_models_service.config.JpaConfig;
import com.microservices.common_models_service.dto.ModelMapperConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@SpringBootApplication
@EntityScan(basePackages = "com.microservices.common_models_service.model")

@EnableFeignClients
//@Import({SecurityConfig.class, JwtTokenProviderConfig.class, JpaConfig.class})
@Import({ModelMapperConfig.class, SecurityProperties.class, SecurityConfig.class, JwtTokenProviderConfig.class, JpaConfig.class, KeyCloakConfig.class})
public class DocumentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocumentServiceApplication.class, args);
	}

}
