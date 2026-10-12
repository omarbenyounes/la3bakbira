package tn.la3bakbira.catalog.product;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

/** Builds the JPA query for the product search from the optional filters. */
final class ProductFilters {

    private ProductFilters() {
    }

    static Specification<Product> of(ProductDtos.ProductFilter filter, Collection<Long> categoryIds) {
        List<Specification<Product>> specs = new ArrayList<>();

        if (filter.q() != null && !filter.q().isBlank()) {
            String pattern = "%" + filter.q().trim().toLowerCase(Locale.ROOT) + "%";
            specs.add((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern)));
        }
        if (categoryIds != null) {
            specs.add((root, query, cb) -> root.get("category").get("id").in(categoryIds));
        }
        if (filter.brandId() != null) {
            specs.add((root, query, cb) -> cb.equal(root.get("brand").get("id"), filter.brandId()));
        }
        if (filter.minPrice() != null) {
            specs.add((root, query, cb) -> cb.greaterThanOrEqualTo(effectivePrice(root, cb), filter.minPrice()));
        }
        if (filter.maxPrice() != null) {
            specs.add((root, query, cb) -> cb.lessThanOrEqualTo(effectivePrice(root, cb), filter.maxPrice()));
        }
        if (Boolean.TRUE.equals(filter.inStock())) {
            specs.add((root, query, cb) -> cb.greaterThan(root.get("stockQuantity"), 0));
        }
        if (filter.featured() != null) {
            specs.add((root, query, cb) -> cb.equal(root.get("featured"), filter.featured()));
        }
        if (filter.active() != null) {
            specs.add((root, query, cb) -> cb.equal(root.get("active"), filter.active()));
        }
        return Specification.allOf(specs);
    }

    private static Expression<BigDecimal> effectivePrice(Root<Product> root, CriteriaBuilder cb) {
        return cb.coalesce(root.<BigDecimal>get("discountPrice"), root.<BigDecimal>get("price"));
    }
}
