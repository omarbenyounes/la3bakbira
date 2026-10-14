package tn.la3bakbira.catalog.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Who is calling: public endpoints are also called with a token by logged-in users. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
