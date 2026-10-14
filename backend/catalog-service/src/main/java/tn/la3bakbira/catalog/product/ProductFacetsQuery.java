package tn.la3bakbira.catalog.product;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import tn.la3bakbira.catalog.brand.Brand;
import tn.la3bakbira.catalog.product.ProductDtos.BrandFacet;
import tn.la3bakbira.catalog.product.ProductDtos.ProductFacets;

import java.math.BigDecimal;
import java.util.List;

/** Aggregations over the products matching a filter (two small GROUP BY / MIN-MAX queries). */
@Component
class ProductFacetsQuery {

    private final EntityManager em;

    ProductFacetsQuery(EntityManager em) {
        this.em = em;
    }

    ProductFacets compute(Specification<Product> spec) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        CriteriaQuery<Tuple> byBrand = cb.createTupleQuery();
        Root<Product> root = byBrand.from(Product.class);
        Join<Product, Brand> brand = root.join("brand");
        byBrand.multiselect(brand.get("id"), brand.get("name"), brand.get("slug"), cb.count(root))
                .where(predicate(spec, root, byBrand, cb))
                .groupBy(brand.get("id"), brand.get("name"), brand.get("slug"))
                .orderBy(cb.asc(brand.get("name")));
        List<BrandFacet> brands = em.createQuery(byBrand).getResultList().stream()
                .map(t -> new BrandFacet(t.get(0, Long.class), t.get(1, String.class), t.get(2, String.class),
                        t.get(3, Long.class)))
                .toList();

        CriteriaQuery<Tuple> range = cb.createTupleQuery();
        Root<Product> r = range.from(Product.class);
        Expression<BigDecimal> price = ProductFilters.effectivePrice(r, cb);
        range.multiselect(cb.min(price), cb.max(price), cb.count(r)).where(predicate(spec, r, range, cb));
        Tuple stats = em.createQuery(range).getSingleResult();

        return new ProductFacets(brands, stats.get(0, BigDecimal.class), stats.get(1, BigDecimal.class),
                stats.get(2, Long.class));
    }

    private static Predicate predicate(Specification<Product> spec, Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb) {
        Predicate predicate = spec.toPredicate(root, query, cb);
        return predicate != null ? predicate : cb.conjunction();
    }
}
