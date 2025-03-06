package com.microservices.printrequest_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
//@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@ComponentScan(basePackages = "com.microservices")

public class PrintrequestServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrintrequestServiceApplication.class, args);
	}

}
