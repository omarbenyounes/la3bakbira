package tn.la3bakbira.catalog.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class KeycloakRolesConverterTest {

    private final KeycloakRolesConverter converter = new KeycloakRolesConverter();

    @Test
    void mapsRealmRolesToSpringRoles() {
        Jwt jwt = token(Map.of("realm_access", Map.of("roles", List.of("ADMIN", "CUSTOMER"))));
        assertThat(converter.convert(jwt)).extracting(GrantedAuthority::getAuthority)
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_CUSTOMER");
    }

    @Test
    void returnsNoAuthoritiesWhenClaimIsMissing() {
        assertThat(converter.convert(token(Map.of("scope", "openid")))).isEmpty();
    }

    private static Jwt token(Map<String, Object> claims) {
        Jwt.Builder builder = Jwt.withTokenValue("token").header("alg", "none").subject("user");
        claims.forEach(builder::claim);
        return builder.build();
    }
}
