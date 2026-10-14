package tn.la3bakbira.catalog.product;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.la3bakbira.catalog.common.PageResponse;
import tn.la3bakbira.catalog.product.ProductDtos.ProductFacets;
import tn.la3bakbira.catalog.product.ProductDtos.ProductFilter;
import tn.la3bakbira.catalog.security.CurrentUser;
import tn.la3bakbira.catalog.product.ProductDtos.ProductRequest;
import tn.la3bakbira.catalog.product.ProductDtos.ProductResponse;
import tn.la3bakbira.catalog.product.ProductDtos.ProductSummary;

import java.net.URI;

@Tag(name = "Products", description = "Product search, details and management")
@RestController
@RequestMapping("/api/catalog/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @Operation(summary = "Search products",
            description = "All filters are optional and combined. Filtering by category includes its sub-categories; "
                    + "brandId may be repeated; price filters apply to the price actually paid. "
                    + "Sort examples: effectivePrice,asc · createdAt,desc · name,asc. "
                    + "Only ADMIN users see inactive products.")
    @GetMapping
    public PageResponse<ProductSummary> search(@ParameterObject ProductFilter filter,
            @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return service.search(filter, pageable, CurrentUser.isAdmin());
    }

    @Operation(summary = "Filter options for a listing",
            description = "Brands present among the matching products (with counts) and the price range. "
                    + "Brand and price filters are ignored so the other options stay visible.")
    @GetMapping("/facets")
    public ProductFacets facets(@ParameterObject ProductFilter filter) {
        return service.facets(filter, CurrentUser.isAdmin());
    }

    @Operation(summary = "Get a product by id", description = "Inactive products: 404 unless ADMIN")
    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return service.get(id, CurrentUser.isAdmin());
    }

    @Operation(summary = "Get a product by slug", description = "Used by the storefront product page URLs. "
            + "Inactive products: 404 unless ADMIN")
    @GetMapping("/slug/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug, CurrentUser.isAdmin());
    }

    @Operation(summary = "Create a product", description = "A blank slug is generated from the name")
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/catalog/products/" + created.id())).body(created);
    }

    @Operation(summary = "Update a product", description = "Replaces all fields, including images and specs")
    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a product")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
