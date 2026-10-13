package tn.la3bakbira.catalog.brand;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.la3bakbira.catalog.brand.BrandDtos.BrandRequest;
import tn.la3bakbira.catalog.brand.BrandDtos.BrandResponse;

import java.net.URI;
import java.util.List;

@Tag(name = "Brands", description = "Brand management")
@RestController
@RequestMapping("/api/catalog/brands")
public class BrandController {

    private final BrandService service;

    public BrandController(BrandService service) {
        this.service = service;
    }

    @Operation(summary = "List all brands")
    @GetMapping
    public List<BrandResponse> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Get a brand by id")
    @GetMapping("/{id}")
    public BrandResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Create a brand")
    @PostMapping
    public ResponseEntity<BrandResponse> create(@Valid @RequestBody BrandRequest request) {
        BrandResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/catalog/brands/" + created.id())).body(created);
    }

    @Operation(summary = "Update a brand")
    @PutMapping("/{id}")
    public BrandResponse update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a brand", description = "Refused (409) while products use it")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
