package com.microservices.common_models_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
public class CommonModelsServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommonModelsServiceApplication.class, args);
	}

}
