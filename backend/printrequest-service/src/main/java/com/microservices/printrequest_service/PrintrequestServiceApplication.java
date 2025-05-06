package com.microservices.printrequest_service;

import com.microservices.api_gateway.config.*;
import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.config.JpaConfig;
import com.microservices.common_models_service.dto.ModelMapperConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@EntityScan(basePackages = "com.microservices.common_models_service.model")

//@Import({SecurityConfig.class, JwtTokenProviderConfig.class, JpaConfig.class, SecurityProperties.class})
@Import({ModelMapperConfig.class, SecurityProperties.class, SecurityConfig.class, JwtTokenProviderConfig.class, JpaConfig.class, KeyCloakConfig.class})
@EnableFeignClients
public class PrintrequestServiceApplication {


	public static void main(String[] args) {
		SpringApplication.run(PrintrequestServiceApplication.class, args);
	}

}
