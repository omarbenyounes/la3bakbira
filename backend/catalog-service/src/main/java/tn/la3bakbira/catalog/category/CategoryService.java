package tn.la3bakbira.catalog.category;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryRequest;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryResponse;
import tn.la3bakbira.catalog.category.CategoryDtos.CategoryTreeNode;
import tn.la3bakbira.catalog.common.BadRequestException;
import tn.la3bakbira.catalog.common.ConflictException;
import tn.la3bakbira.catalog.common.NotFoundException;
import tn.la3bakbira.catalog.common.Slugs;
import tn.la3bakbira.catalog.product.ProductRepository;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private static final Sort DISPLAY_SORT = Sort.by("displayOrder", "name");

    private final CategoryRepository categories;
    private final ProductRepository products;

    public CategoryService(CategoryRepository categories, ProductRepository products) {
        this.categories = categories;
        this.products = products;
    }

    public List<CategoryResponse> findAll() {
        return categories.findAll(DISPLAY_SORT).stream().map(CategoryResponse::from).toList();
    }

    public CategoryResponse get(Long id) {
        return CategoryResponse.from(load(id));
    }

    public CategoryResponse getBySlug(String slug) {
        return categories.findBySlug(slug).map(CategoryResponse::from)
                .orElseThrow(() -> new NotFoundException("Category", slug));
    }

    /** Whole tree built in memory from a single query (category count stays small). */
    public List<CategoryTreeNode> tree(boolean activeOnly) {
        Map<Long, List<Category>> byParent = new LinkedHashMap<>();
        for (Category c : categories.findAll(DISPLAY_SORT)) {
            if (activeOnly && !c.isActive()) {
                continue;
            }
            Long parentId = c.getParent() == null ? null : c.getParent().getId();
            byParent.computeIfAbsent(parentId, k -> new ArrayList<>()).add(c);
        }
        return buildNodes(null, byParent);
    }

    private List<CategoryTreeNode> buildNodes(Long parentId, Map<Long, List<Category>> byParent) {
        return byParent.getOrDefault(parentId, List.of()).stream()
                .map(c -> new CategoryTreeNode(c.getId(), c.getName(), c.getSlug(), c.getImageUrl(),
                        c.getDisplayOrder(), c.isActive(), buildNodes(c.getId(), byParent)))
                .toList();
    }

    /** The category itself plus all of its descendants (used to list products of a whole branch). */
    public Set<Long> idWithDescendants(Long id) {
        load(id);
        Map<Long, List<Long>> childrenByParent = new LinkedHashMap<>();
        for (Category c : categories.findAll()) {
            if (c.getParent() != null) {
                childrenByParent.computeIfAbsent(c.getParent().getId(), k -> new ArrayList<>()).add(c.getId());
            }
        }
        Set<Long> result = new HashSet<>();
        Deque<Long> toVisit = new ArrayDeque<>(List.of(id));
        while (!toVisit.isEmpty()) {
            Long current = toVisit.pop();
            if (result.add(current)) {
                toVisit.addAll(childrenByParent.getOrDefault(current, List.of()));
            }
        }
        return result;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setSlug(Slugs.resolve(request.slug(), request.name(), categories::existsBySlug));
        apply(category, request);
        return CategoryResponse.from(categories.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = load(id);
        if (request.slug() != null && !request.slug().isBlank()
                && !Slugs.slugify(request.slug()).equals(category.getSlug())) {
            category.setSlug(Slugs.resolve(request.slug(), request.name(), categories::existsBySlug));
        }
        apply(category, request);
        return CategoryResponse.from(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = load(id);
        if (categories.existsByParentId(id)) {
            throw new ConflictException("Category has sub-categories; move or delete them first");
        }
        if (products.existsByCategoryId(id)) {
            throw new ConflictException("Category still contains products; move or delete them first");
        }
        categories.delete(category);
    }

    public Category load(Long id) {
        return categories.findById(id).orElseThrow(() -> new NotFoundException("Category", id));
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setDisplayOrder(Objects.requireNonNullElse(request.displayOrder(), 0));
        category.setActive(Objects.requireNonNullElse(request.active(), true));
        category.setParent(resolveParent(category, request.parentId()));
    }

    private Category resolveParent(Category category, Long parentId) {
        if (parentId == null) {
            return null;
        }
        Category parent = categories.findById(parentId)
                .orElseThrow(() -> new BadRequestException("Parent category does not exist: " + parentId));
        // Walk up from the new parent: reaching the category itself would create a cycle
        for (Category p = parent; p != null; p = p.getParent()) {
            if (category.getId() != null && category.getId().equals(p.getId())) {
                throw new BadRequestException("A category cannot be placed under itself or its own sub-category");
            }
        }
        return parent;
    }
}
