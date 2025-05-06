package com.microservices.api_gateway.routes;

import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration

public class Routes {
    @Bean
    public RouterFunction<ServerResponse> studentServiceRouter() {
        return GatewayRouterFunctions.route("user_service")
                .route(RequestPredicates.path("/user/**"),
                        HandlerFunctions.http("http://localhost:8082"))
                .filter((request, next) -> {
                    // Extract the Authorization header from the original request
                    String authHeader = request.headers().firstHeader("Authorization");

                    // Create a new ServerRequest with the modified headers
                    ServerRequest modifiedRequest = ServerRequest.from(request)
                            .headers(headers -> {
                                if (authHeader != null) {
                                    headers.set("Authorization", authHeader);
                                }
                            })
                            .build();

                    // Pass the modified request to the next handler
                    return next.handle(modifiedRequest);
                })
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> documentServiceRouter() {
        return GatewayRouterFunctions.route("document_service")
                .route(RequestPredicates.path("/doc/**"),
                        HandlerFunctions.http("http://localhost:8083"))
                .filter((request, next) -> {
                    // Extract the Authorization header from the original request
                    String authHeader = request.headers().firstHeader("Authorization");

                    // Create a new ServerRequest with the modified headers
                    ServerRequest modifiedRequest = ServerRequest.from(request)
                            .headers(headers -> {
                                if (authHeader != null) {
                                    headers.set("Authorization", authHeader);
                                }
                            })
                            .build();

                    // Pass the modified request to the next handler
                    return next.handle(modifiedRequest);
                })
                .build();
    }


    @Bean
    public RouterFunction<ServerResponse> printRequestServiceRouter() {
        return GatewayRouterFunctions.route("print_request_service")
                .route(RequestPredicates.path("/p-request/**"),
                        HandlerFunctions.http("http://localhost:8084"))
                .filter((request, next) -> {
                    // Extract the Authorization header from the original request
                    String authHeader = request.headers().firstHeader("Authorization");

                    // Create a new ServerRequest with the modified headers
                    ServerRequest modifiedRequest = ServerRequest.from(request)
                            .headers(headers -> {
                                if (authHeader != null) {
                                    headers.set("Authorization", authHeader);
                                }
                            })
                            .build();

                    // Pass the modified request to the next handler
                    return next.handle(modifiedRequest);
                })
                .build();
    }






    @Bean
    public RouterFunction<ServerResponse> notificationServiceRouter() {
        return GatewayRouterFunctions.route("notification_service")
                .route(RequestPredicates.path("/notification/**"),
                        HandlerFunctions.http("http://localhost:8085"))
                .filter((request, next) -> {
                    // Extract the Authorization header from the original request
                    String authHeader = request.headers().firstHeader("Authorization");

                    // Create a new ServerRequest with the modified headers
                    ServerRequest modifiedRequest = ServerRequest.from(request)
                            .headers(headers -> {
                                if (authHeader != null) {
                                    headers.set("Authorization", authHeader);
                                }
                            })
                            .build();

                    // Pass the modified request to the next handler
                    return next.handle(modifiedRequest);
                })
                .build();
    }





}