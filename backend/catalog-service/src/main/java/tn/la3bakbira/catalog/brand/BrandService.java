package tn.la3bakbira.catalog.brand;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.la3bakbira.catalog.brand.BrandDtos.BrandRequest;
import tn.la3bakbira.catalog.brand.BrandDtos.BrandResponse;
import tn.la3bakbira.catalog.common.ConflictException;
import tn.la3bakbira.catalog.common.NotFoundException;
import tn.la3bakbira.catalog.common.Slugs;
import tn.la3bakbira.catalog.product.ProductRepository;

import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class BrandService {

    private final BrandRepository brands;
    private final ProductRepository products;

    public BrandService(BrandRepository brands, ProductRepository products) {
        this.brands = brands;
        this.products = products;
    }

    public List<BrandResponse> findAll() {
        return brands.findAll(Sort.by("name")).stream().map(BrandResponse::from).toList();
    }

    public BrandResponse get(Long id) {
        return BrandResponse.from(load(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        Brand brand = new Brand();
        brand.setSlug(Slugs.resolve(request.slug(), request.name(), brands::existsBySlug));
        apply(brand, request);
        return BrandResponse.from(brands.save(brand));
    }

    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = load(id);
        if (request.slug() != null && !request.slug().isBlank()
                && !Slugs.slugify(request.slug()).equals(brand.getSlug())) {
            brand.setSlug(Slugs.resolve(request.slug(), request.name(), brands::existsBySlug));
        }
        apply(brand, request);
        return BrandResponse.from(brand);
    }

    @Transactional
    public void delete(Long id) {
        Brand brand = load(id);
        if (products.existsByBrandId(id)) {
            throw new ConflictException("Brand is used by products; reassign or delete them first");
        }
        brands.delete(brand);
    }

    public Brand load(Long id) {
        return brands.findById(id).orElseThrow(() -> new NotFoundException("Brand", id));
    }

    private void apply(Brand brand, BrandRequest request) {
        brand.setName(request.name().trim());
        brand.setLogoUrl(request.logoUrl());
        brand.setActive(Objects.requireNonNullElse(request.active(), true));
    }
}
