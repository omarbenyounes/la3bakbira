package tn.la3bakbira.catalog.brand;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    boolean existsBySlug(String slug);
}
