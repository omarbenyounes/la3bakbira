package tn.la3bakbira.catalog.common;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

/** Builds URL-friendly identifiers, e.g. "PC Portable Écran 15,6\"" -> "pc-portable-ecran-15-6". */
public final class Slugs {

    private Slugs() {
    }

    public static String slugify(String input) {
        String ascii = Normalizer.normalize(input, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isEmpty() ? "item" : slug;
    }

    /**
     * Returns the requested slug if given (it must then be free), otherwise a slug derived from
     * {@code name}, suffixed with -2, -3... until {@code taken} reports it as free.
     */
    public static String resolve(String requested, String name, Predicate<String> taken) {
        if (requested != null && !requested.isBlank()) {
            String slug = slugify(requested);
            if (taken.test(slug)) {
                throw new ConflictException("Slug already in use: " + slug);
            }
            return slug;
        }
        String base = slugify(name);
        String slug = base;
        for (int i = 2; taken.test(slug); i++) {
            slug = base + "-" + i;
        }
        return slug;
    }
}
