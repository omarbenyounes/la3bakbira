package tn.la3bakbira.catalog.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    private static final String KEYCLOAK = "keycloak";

    @Bean
    OpenAPI catalogOpenApi(@Value("${app.openapi.oauth2-realm-url}") String realmUrl) {
        SecurityScheme keycloak = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .description("Log in with Keycloak. Reading the catalog is public; changes require the ADMIN role.")
                .flows(new OAuthFlows().authorizationCode(new OAuthFlow()
                        .authorizationUrl(realmUrl + "/protocol/openid-connect/auth")
                        .tokenUrl(realmUrl + "/protocol/openid-connect/token")
                        .scopes(new Scopes().addString("openid", "OpenID Connect"))));

        return new OpenAPI()
                .info(new Info()
                        .title("Catalog API")
                        .version("v1")
                        .description("Categories, brands and products of the la3bakbira marketplace. "
                                + "Prices are in TND with 3 decimals."))
                // Relative URL: "Try it out" calls go to whatever host serves Swagger UI, i.e. the gateway
                .servers(List.of(new Server().url("/").description("API gateway")))
                .components(new Components().addSecuritySchemes(KEYCLOAK, keycloak))
                .addSecurityItem(new SecurityRequirement().addList(KEYCLOAK));
    }
}
