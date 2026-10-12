package tn.la3bakbira.catalog.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class CategoryDtos {

    private CategoryDtos() {
    }

    /** Create/update payload. A blank slug means "generate from name" (create) or "keep current" (update). */
    public record CategoryRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 140) String slug,
            @Size(max = 1000) String description,
            @Size(max = 500) String imageUrl,
            Long parentId,
            @PositiveOrZero Integer displayOrder,
            Boolean active) {
    }

    public record CategoryResponse(
            Long id,
            String name,
            String slug,
            String description,
            String imageUrl,
            Long parentId,
            int displayOrder,
            boolean active,
            Instant createdAt,
            Instant updatedAt) {

        static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getDescription(), c.getImageUrl(),
                    c.getParent() == null ? null : c.getParent().getId(), c.getDisplayOrder(), c.isActive(),
                    c.getCreatedAt(), c.getUpdatedAt());
        }
    }

    /** Used for navigation menus. */
    public record CategoryTreeNode(
            Long id,
            String name,
            String slug,
            String imageUrl,
            int displayOrder,
            boolean active,
            List<CategoryTreeNode> children) {
    }
}
