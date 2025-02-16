package com.microservices.user_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.microservices.user_service.utils.VerificationData;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, VerificationData> redisTemplate(
            RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper) {

        RedisTemplate<String, VerificationData> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Key serializer
        template.setKeySerializer(new StringRedisSerializer());

        // Value serializer (JSON)
        Jackson2JsonRedisSerializer<VerificationData> serializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, VerificationData.class);
        template.setValueSerializer(serializer);

        return template;
    }
}