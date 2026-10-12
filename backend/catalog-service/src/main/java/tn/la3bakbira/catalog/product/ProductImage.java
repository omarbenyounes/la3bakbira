package tn.la3bakbira.catalog.product;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProductImage {

    @Column(nullable = false, length = 500)
    private String url;

    @Column(length = 200)
    private String altText;

    protected ProductImage() {
    }

    public ProductImage(String url, String altText) {
        this.url = url;
        this.altText = altText;
    }

    public String getUrl() {
        return url;
    }

    public String getAltText() {
        return altText;
    }
}
