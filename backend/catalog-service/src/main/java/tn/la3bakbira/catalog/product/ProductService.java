package tn.la3bakbira.catalog.product;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.la3bakbira.catalog.brand.BrandService;
import tn.la3bakbira.catalog.category.CategoryService;
import tn.la3bakbira.catalog.common.BadRequestException;
import tn.la3bakbira.catalog.common.ConflictException;
import tn.la3bakbira.catalog.common.NotFoundException;
import tn.la3bakbira.catalog.common.PageResponse;
import tn.la3bakbira.catalog.common.Slugs;
import tn.la3bakbira.catalog.product.ProductDtos.ProductFacets;
import tn.la3bakbira.catalog.product.ProductDtos.ProductFilter;
import tn.la3bakbira.catalog.product.ProductDtos.ProductRequest;
import tn.la3bakbira.catalog.product.ProductDtos.ProductResponse;
import tn.la3bakbira.catalog.product.ProductDtos.ProductSummary;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;

@Service
@Transactional(readOnly = true)
public class ProductService {

    static final String EFFECTIVE_PRICE = "effectivePrice";

    private final ProductRepository products;
    private final ProductFacetsQuery facetsQuery;
    private final CategoryService categoryService;
    private final BrandService brandService;

    public ProductService(ProductRepository products, ProductFacetsQuery facetsQuery, CategoryService categoryService,
            BrandService brandService) {
        this.products = products;
        this.facetsQuery = facetsQuery;
        this.categoryService = categoryService;
        this.brandService = brandService;
    }

    /**
     * Filtering by a category includes all of its sub-categories. Non-admins only get active products.
     * Sort property "effectivePrice" orders by the price actually paid (discount price if any).
     */
    public PageResponse<ProductSummary> search(ProductFilter filter, Pageable pageable, boolean admin) {
        Specification<Product> spec = specFor(filter.visibleTo(admin));
        Sort.Order byEffectivePrice = pageable.getSort().getOrderFor(EFFECTIVE_PRICE);
        if (byEffectivePrice != null) {
            Sort otherOrders = Sort.by(pageable.getSort().stream()
                    .filter(order -> !EFFECTIVE_PRICE.equals(order.getProperty())).toList());
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), otherOrders);
            spec = spec.and(ProductFilters.orderByEffectivePrice(byEffectivePrice.getDirection()));
        }
        return PageResponse.of(products.findAll(spec, pageable).map(ProductSummary::from));
    }

    /** Brands (with counts) and price range of the products matching the filter, ignoring brand/price filters. */
    public ProductFacets facets(ProductFilter filter, boolean admin) {
        return facetsQuery.compute(specFor(filter.visibleTo(admin).withoutBrandAndPrice()));
    }

    /** Inactive products are reported as not found to non-admins. */
    public ProductResponse get(Long id, boolean admin) {
        return ProductResponse.from(visible(load(id), admin, id));
    }

    public ProductResponse getBySlug(String slug, boolean admin) {
        Product product = products.findBySlug(slug).orElseThrow(() -> new NotFoundException("Product", slug));
        return ProductResponse.from(visible(product, admin, slug));
    }

    private Specification<Product> specFor(ProductFilter filter) {
        Set<Long> categoryIds = filter.categoryId() == null ? null
                : categoryService.idWithDescendants(filter.categoryId());
        return ProductFilters.of(filter, categoryIds);
    }

    private static Product visible(Product product, boolean admin, Object key) {
        if (!admin && !product.isActive()) {
            throw new NotFoundException("Product", key);
        }
        return product;
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        String sku = request.sku().trim();
        if (products.existsBySku(sku)) {
            throw new ConflictException("SKU already in use: " + sku);
        }
        Product product = new Product();
        product.setSlug(Slugs.resolve(request.slug(), request.name(), products::existsBySlug));
        apply(product, request, sku);
        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = load(id);
        String sku = request.sku().trim();
        if (products.existsBySkuAndIdNot(sku, id)) {
            throw new ConflictException("SKU already in use: " + sku);
        }
        if (request.slug() != null && !request.slug().isBlank()
                && !Slugs.slugify(request.slug()).equals(product.getSlug())) {
            product.setSlug(Slugs.resolve(request.slug(), request.name(), products::existsBySlug));
        }
        apply(product, request, sku);
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(Long id) {
        products.delete(load(id));
    }

    private Product load(Long id) {
        return products.findById(id).orElseThrow(() -> new NotFoundException("Product", id));
    }

    private void apply(Product product, ProductRequest request, String sku) {
        if (request.discountPrice() != null && request.discountPrice().compareTo(request.price()) >= 0) {
            throw new BadRequestException("Discount price must be lower than the price");
        }
        product.setName(request.name().trim());
        product.setSku(sku);
        product.setShortDescription(request.shortDescription());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setDiscountPrice(request.discountPrice());
        product.setStockQuantity(request.stockQuantity());
        product.setActive(Objects.requireNonNullElse(request.active(), true));
        product.setFeatured(Objects.requireNonNullElse(request.featured(), false));
        product.setCategory(loadReference(categoryService::load, "Category", request.categoryId()));
        product.setBrand(request.brandId() == null ? null
                : loadReference(brandService::load, "Brand", request.brandId()));

        product.getImages().clear();
        Objects.requireNonNullElse(request.images(), List.<ProductDtos.ImageDto>of())
                .forEach(i -> product.getImages().add(new ProductImage(i.url(), i.altText())));
        product.getSpecs().clear();
        Objects.requireNonNullElse(request.specs(), List.<ProductDtos.SpecDto>of())
                .forEach(s -> product.getSpecs().add(new ProductSpec(s.name().trim(), s.value().trim())));
    }

    /** A missing category/brand referenced by the payload is a client error (400), not a 404 of the URL. */
    private static <T> T loadReference(Function<Long, T> loader, String what, Long id) {
        try {
            return loader.apply(id);
        } catch (NotFoundException ex) {
            throw new BadRequestException(what + " does not exist: " + id);
        }
    }
}
