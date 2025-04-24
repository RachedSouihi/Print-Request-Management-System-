package com.microservices.notification_service;

import com.microservices.api_gateway.config.*;
import com.microservices.common_models_service.config.JpaConfig;
import com.microservices.common_models_service.dto.ModelMapperConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@SpringBootApplication
@EntityScan(basePackages = "com.microservices.common_models_service.model")
@Import({SecurityProperties.class, SecurityConfig.class, JwtTokenProviderConfig.class, JwtDecoderConfig.class, JpaConfig.class})


public class NotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

}
