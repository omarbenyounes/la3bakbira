package tn.la3bakbira.catalog.product;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** One line of a product's technical sheet. */
@Embeddable
public class ProductSpec {

    @Column(name = "spec_name", nullable = false, length = 100)
    private String name;

    @Column(name = "spec_value", nullable = false, length = 500)
    private String value;

    protected ProductSpec() {
    }

    public ProductSpec(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public String getValue() {
        return value;
    }
}
