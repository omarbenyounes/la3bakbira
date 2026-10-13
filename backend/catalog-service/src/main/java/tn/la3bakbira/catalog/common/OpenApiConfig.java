package tn.la3bakbira.catalog.common;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI catalogOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Catalog API")
                        .version("v1")
                        .description("Categories, brands and products of the la3bakbira marketplace. "
                                + "Prices are in TND with 3 decimals."))
                // Relative URL: "Try it out" calls go to whatever host serves Swagger UI, i.e. the gateway
                .servers(List.of(new Server().url("/").description("API gateway")));
    }
}
