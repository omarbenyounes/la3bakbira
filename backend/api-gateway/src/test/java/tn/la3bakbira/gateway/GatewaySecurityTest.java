package tn.la3bakbira.gateway;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockJwt;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.springSecurity;

/** Access rules enforced by the gateway itself (no downstream service needed). */
@SpringBootTest(properties = "eureka.client.enabled=false")
class GatewaySecurityTest {

    @Autowired
    ApplicationContext context;

    WebTestClient client;

    @BeforeEach
    void setUp() {
        client = WebTestClient.bindToApplicationContext(context).apply(springSecurity()).configureClient().build();
    }

    @Test
    void catalogChangesRequireAuthentication() {
        client.post().uri("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).bodyValue("{}")
                .exchange().expectStatus().isUnauthorized();
    }

    @Test
    void catalogChangesRequireAdminRole() {
        client.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER")))
                .delete().uri("/api/catalog/products/1")
                .exchange().expectStatus().isForbidden();
    }

    @Test
    void documentationAndHealthArePublic() {
        client.get().uri("/swagger-ui.html").exchange().expectStatus().is3xxRedirection();
        client.get().uri("/actuator/health").exchange().expectStatus().isOk();
    }

    @Test
    void gatewayManagementEndpointRequiresAdmin() {
        client.get().uri("/actuator/gateway/routes").exchange().expectStatus().isUnauthorized();
        client.mutateWith(mockJwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .get().uri("/actuator/gateway/routes").exchange().expectStatus().isOk();
    }
}
