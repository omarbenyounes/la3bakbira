package tn.la3bakbira.catalog.brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class BrandDtos {

    private BrandDtos() {
    }

    /** A blank slug means "generate from name" (create) or "keep current" (update). */
    public record BrandRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 140) String slug,
            @Size(max = 500) String logoUrl,
            Boolean active) {
    }

    public record BrandResponse(
            Long id,
            String name,
            String slug,
            String logoUrl,
            boolean active,
            Instant createdAt,
            Instant updatedAt) {

        static BrandResponse from(Brand b) {
            return new BrandResponse(b.getId(), b.getName(), b.getSlug(), b.getLogoUrl(), b.isActive(),
                    b.getCreatedAt(), b.getUpdatedAt());
        }
    }
}
