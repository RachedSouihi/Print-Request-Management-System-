package com.microservices.user_service;

import com.microservices.api_gateway.config.*;
import com.microservices.api_gateway.filter.JwtAuthenticationFilter;
import com.microservices.api_gateway.filter.JwtTokenProvider;
import com.microservices.common_models_service.config.JpaConfig;
import com.microservices.common_models_service.dto.ModelMapperConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
@EnableJpaRepositories(basePackages = "com.microservices.common_models_service.repository")
@SpringBootApplication
@EntityScan(basePackages = "com.microservices.common_models_service.model")
@Import({ModelMapperConfig.class, SecurityProperties.class, SecurityConfig.class, JwtTokenProviderConfig.class, JwtDecoderConfig.class, JpaConfig.class, KeyCloakConfig.class})


public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

}