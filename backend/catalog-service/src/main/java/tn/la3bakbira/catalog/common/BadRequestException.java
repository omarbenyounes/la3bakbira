package tn.la3bakbira.catalog.common;

/** Business-rule violation in the request itself (e.g. a category made its own parent). */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
