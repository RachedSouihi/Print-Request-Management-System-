package com.microservices.printrequest_service;

import com.microservices.api_gateway.config.JwtTokenProviderConfig;
import com.microservices.api_gateway.config.SecurityConfig;
import com.microservices.api_gateway.config.WebConfig;
import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.config.JpaConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@EntityScan(basePackages = "com.microservices.common_models_service.model")

@Import({SecurityConfig.class, JwtTokenProviderConfig.class, JpaConfig.class})
public class PrintrequestServiceApplication {


	public static void main(String[] args) {
		SpringApplication.run(PrintrequestServiceApplication.class, args);
	}

}
