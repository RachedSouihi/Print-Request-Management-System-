package com.microservices.api_gateway.config;

import com.microservices.api_gateway.utils.CustomHandshakeHandler;
import com.microservices.api_gateway.utils.CustomHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enables a simple in-memory broker and configures the destination prefix for subscriptions.
        registry.enableSimpleBroker("/topic", "/queue");

        registry.setUserDestinationPrefix("/user");

        // Designates the prefix for messages bound for methods annotated with @MessageMapping
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint for SockJS connections. Adjust allowed origins as needed.
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5174")
                .addInterceptors(new CustomHandshakeInterceptor())
                .setHandshakeHandler(new CustomHandshakeHandler())
                .withSockJS();
    }
}
