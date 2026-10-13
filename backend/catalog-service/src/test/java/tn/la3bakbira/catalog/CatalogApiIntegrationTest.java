package tn.la3bakbira.catalog;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** End-to-end tests of the REST API against a real PostgreSQL. Each test uses its own names/SKUs. */
@SpringBootTest(properties = "eureka.client.enabled=false")
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class CatalogApiIntegrationTest {

    @Autowired
    MockMvc mvc;

    @Test
    void createsCatalogAndFiltersProductsByCategoryBranch() throws Exception {
        long informatique = createCategory("{\"name\":\"Informatique\"}");
        long laptops = createCategory("{\"name\":\"PC Portables\",\"parentId\":" + informatique + "}");
        long brand = idOf(mvc.perform(post("/api/catalog/brands").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Lenovo\"}")).andExpect(status().isCreated()).andReturn().getResponse()
                .getContentAsString());

        String product = """
                {"name":"PC Portable Lenovo IdeaPad 3","sku":"LEN-IP3-01","price":1899.000,"discountPrice":1699.000,
                 "stockQuantity":5,"categoryId":%d,"brandId":%d,"featured":true,
                 "images":[{"url":"https://img.example/ip3-front.jpg"},{"url":"https://img.example/ip3-side.jpg"}],
                 "specs":[{"name":"Processeur","value":"Intel Core i5"},{"name":"RAM","value":"16 Go"}]}
                """.formatted(laptops, brand);
        String created = mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).content(product))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.slug").value("pc-portable-lenovo-ideapad-3"))
                .andExpect(jsonPath("$.effectivePrice").value(1699.0))
                .andExpect(jsonPath("$.category.name").value("PC Portables"))
                .andExpect(jsonPath("$.brand.name").value("Lenovo"))
                .andExpect(jsonPath("$.specs", hasSize(2)))
                .andReturn().getResponse().getContentAsString();
        long productId = idOf(created);

        // Read back by id and by slug
        mvc.perform(get("/api/catalog/products/" + productId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.images[0].url").value("https://img.example/ip3-front.jpg"));
        mvc.perform(get("/api/catalog/products/slug/pc-portable-lenovo-ideapad-3")).andExpect(status().isOk());

        // Filtering on the parent category includes products of its sub-categories
        mvc.perform(get("/api/catalog/products").param("categoryId", String.valueOf(informatique)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].mainImageUrl").value("https://img.example/ip3-front.jpg"));

        // Price filters apply to the discounted price
        expectCount("maxPrice", "1700", informatique, 1);
        expectCount("minPrice", "1800", informatique, 0);
        mvc.perform(get("/api/catalog/products").param("q", "ideapad")).andExpect(jsonPath("$.totalElements").value(1));

        // Tree endpoint nests the sub-category
        mvc.perform(get("/api/catalog/categories/tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + informatique + ")].children[0].name").value("PC Portables"));
    }

    @Test
    void rejectsInvalidPayloadsWithFieldErrors() throws Exception {
        mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"price\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.sku").exists())
                .andExpect(jsonPath("$.errors.price").exists())
                .andExpect(jsonPath("$.errors.categoryId").exists());
    }

    @Test
    void enforcesBusinessRules() throws Exception {
        long category = createCategory("{\"name\":\"Smartphones\"}");
        String phone = """
                {"name":"Galaxy A55","sku":"SAM-A55","price":1299,"stockQuantity":0,"categoryId":%d}
                """.formatted(category);
        mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).content(phone))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.inStock").value(false));

        // Duplicate SKU
        mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).content(phone))
                .andExpect(status().isConflict());
        // Discount must be lower than price
        mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"X","sku":"SAM-X","price":100,"discountPrice":150,"stockQuantity":1,"categoryId":%d}
                        """.formatted(category)))
                .andExpect(status().isBadRequest());
        // Unknown category referenced in the payload
        mvc.perform(post("/api/catalog/products").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Y","sku":"SAM-Y","price":100,"stockQuantity":1,"categoryId":999999}
                        """))
                .andExpect(status().isBadRequest());
        // A category that still has products cannot be deleted
        mvc.perform(delete("/api/catalog/categories/" + category)).andExpect(status().isConflict());
        // A category cannot become its own descendant
        long child = createCategory("{\"name\":\"Android\",\"parentId\":" + category + "}");
        mvc.perform(put("/api/catalog/categories/" + category).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Smartphones\",\"parentId\":" + child + "}"))
                .andExpect(status().isBadRequest());
        // Unknown ids and sort fields
        mvc.perform(get("/api/catalog/products/999999")).andExpect(status().isNotFound());
        mvc.perform(get("/api/catalog/products").param("sort", "nope")).andExpect(status().isBadRequest());
    }

    @Test
    void publishesOpenApiDescription() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Catalog API"))
                .andExpect(jsonPath("$.servers[0].url").value("/"))
                .andExpect(jsonPath("$.paths['/api/catalog/products'].get").exists())
                .andExpect(jsonPath("$.paths['/api/catalog/categories/tree'].get").exists())
                // Filter record and Pageable are expanded into individual query parameters
                .andExpect(jsonPath("$.paths['/api/catalog/products'].get.parameters[?(@.name == 'categoryId')]").exists())
                .andExpect(jsonPath("$.paths['/api/catalog/products'].get.parameters[?(@.name == 'sort')]").exists());
    }

    private long createCategory(String json) throws Exception {
        return idOf(mvc.perform(post("/api/catalog/categories").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }

    private void expectCount(String param, String value, long categoryId, int expected) throws Exception {
        ResultMatcher count = jsonPath("$.totalElements").value(expected);
        mvc.perform(get("/api/catalog/products").param(param, value).param("categoryId", String.valueOf(categoryId)))
                .andExpect(count);
    }

    private static long idOf(String json) {
        return ((Number) JsonPath.read(json, "$.id")).longValue();
    }
}
