package tn.la3bakbira.catalog.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ProductDtos {

    private ProductDtos() {
    }

    /** A blank slug means "generate from name" (create) or "keep current" (update). */
    public record ProductRequest(
            @NotBlank @Size(max = 200) String name,
            @Size(max = 220) String slug,
            @NotBlank @Size(max = 64) String sku,
            @Size(max = 500) String shortDescription,
            String description,
            @NotNull @DecimalMin("0.000") @Digits(integer = 9, fraction = 3) BigDecimal price,
            @DecimalMin("0.000") @Digits(integer = 9, fraction = 3) BigDecimal discountPrice,
            @NotNull @PositiveOrZero Integer stockQuantity,
            @NotNull Long categoryId,
            Long brandId,
            Boolean active,
            Boolean featured,
            @Size(max = 20) List<@Valid ImageDto> images,
            @Size(max = 100) List<@Valid SpecDto> specs) {
    }

    public record ImageDto(@NotBlank @Size(max = 500) String url, @Size(max = 200) String altText) {
    }

    public record SpecDto(@NotBlank @Size(max = 100) String name, @NotBlank @Size(max = 500) String value) {
    }

    /** Query parameters of GET /api/catalog/products; all optional. */
    public record ProductFilter(
            String q,
            Long categoryId,
            Long brandId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            Boolean featured,
            Boolean active) {
    }

    public record Ref(Long id, String name, String slug) {
    }

    /** Full product, for the product page and the admin edit form. */
    public record ProductResponse(
            Long id,
            String name,
            String slug,
            String sku,
            String shortDescription,
            String description,
            BigDecimal price,
            BigDecimal discountPrice,
            BigDecimal effectivePrice,
            int stockQuantity,
            boolean inStock,
            boolean active,
            boolean featured,
            Ref category,
            Ref brand,
            List<ImageDto> images,
            List<SpecDto> specs,
            Instant createdAt,
            Instant updatedAt) {

        static ProductResponse from(Product p) {
            return new ProductResponse(p.getId(), p.getName(), p.getSlug(), p.getSku(), p.getShortDescription(),
                    p.getDescription(), p.getPrice(), p.getDiscountPrice(), p.effectivePrice(),
                    p.getStockQuantity(), p.getStockQuantity() > 0, p.isActive(), p.isFeatured(),
                    new Ref(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getSlug()),
                    p.getBrand() == null ? null
                            : new Ref(p.getBrand().getId(), p.getBrand().getName(), p.getBrand().getSlug()),
                    p.getImages().stream().map(i -> new ImageDto(i.getUrl(), i.getAltText())).toList(),
                    p.getSpecs().stream().map(s -> new SpecDto(s.getName(), s.getValue())).toList(),
                    p.getCreatedAt(), p.getUpdatedAt());
        }
    }

    /** Lightweight product, for listing pages and product cards. */
    public record ProductSummary(
            Long id,
            String name,
            String slug,
            String sku,
            String shortDescription,
            BigDecimal price,
            BigDecimal discountPrice,
            BigDecimal effectivePrice,
            int stockQuantity,
            boolean inStock,
            boolean active,
            boolean featured,
            String mainImageUrl,
            Ref category,
            Ref brand) {

        static ProductSummary from(Product p) {
            return new ProductSummary(p.getId(), p.getName(), p.getSlug(), p.getSku(), p.getShortDescription(),
                    p.getPrice(), p.getDiscountPrice(), p.effectivePrice(), p.getStockQuantity(),
                    p.getStockQuantity() > 0, p.isActive(), p.isFeatured(),
                    p.getImages().isEmpty() ? null : p.getImages().getFirst().getUrl(),
                    new Ref(p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getSlug()),
                    p.getBrand() == null ? null
                            : new Ref(p.getBrand().getId(), p.getBrand().getName(), p.getBrand().getSlug()));
        }
    }
}
