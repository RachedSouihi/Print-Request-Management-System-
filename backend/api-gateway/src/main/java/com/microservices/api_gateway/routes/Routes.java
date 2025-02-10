package com.microservices.api_gateway.routes;

import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

public class Routes {

    @Bean
    public RouterFunction<ServerResponse> studentServiceRouter() {
        return GatewayRouterFunctions.route("user_servide")
                .route(RequestPredicates.path("/user"), HandlerFunctions.http("http://127.0.0.1:8081"))
                .build();
    }
}
