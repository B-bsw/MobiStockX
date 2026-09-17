package com.example.mobistock.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI mobistockOpenAPI() {
        return new OpenAPI().info(
            new Info()
                .title("MobiStock API")
                .version("v1")
                .description(
                    "REST API for managing mobile-phone inventory, customers, and sales."
                )
                .license(new License().name("Private API"))
        );
    }
}
