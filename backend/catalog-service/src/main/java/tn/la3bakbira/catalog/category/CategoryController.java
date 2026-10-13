package tn.la3bakbira.catalog.category;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryRequest;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryResponse;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryTreeNode;

import java.net.URI;
import java.util.List;

@Tag(name = "Categories", description = "Category tree and management")
@RestController
@RequestMapping("/api/catalog/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @Operation(summary = "List all categories (flat)")
    @GetMapping
    public List<CategoryResponse> findAll() {
        return service.findAll();
    }

    @Operation(summary = "Category tree", description = "Nested categories for navigation menus")
    @GetMapping("/tree")
    public List<CategoryTreeNode> tree(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return service.tree(activeOnly);
    }

    @Operation(summary = "Get a category by id")
    @GetMapping("/{id}")
    public CategoryResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Get a category by slug")
    @GetMapping("/slug/{slug}")
    public CategoryResponse getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    @Operation(summary = "Create a category", description = "Omit parentId for a top-level category")
    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/catalog/categories/" + created.id())).body(created);
    }

    @Operation(summary = "Update a category")
    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a category", description = "Refused (409) while it has sub-categories or products")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
