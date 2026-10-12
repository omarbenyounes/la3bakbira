package tn.la3bakbira.catalog.common;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SlugsTest {

    @Test
    void slugifyRemovesAccentsAndPunctuation() {
        assertEquals("pc-portable-ecran-15-6", Slugs.slugify("  PC Portable Écran 15,6\" "));
        assertEquals("tele-smart-tv", Slugs.slugify("Télé & Smart-TV"));
        assertEquals("item", Slugs.slugify("!!!"));
    }

    @Test
    void resolveAddsSuffixWhenGeneratedSlugIsTaken() {
        Set<String> taken = Set.of("smartphones", "smartphones-2");
        assertEquals("smartphones-3", Slugs.resolve(null, "Smartphones", taken::contains));
    }

    @Test
    void resolveRejectsExplicitSlugThatIsTaken() {
        assertThrows(ConflictException.class, () -> Slugs.resolve("smartphones", "Phones", Set.of("smartphones")::contains));
    }
}
