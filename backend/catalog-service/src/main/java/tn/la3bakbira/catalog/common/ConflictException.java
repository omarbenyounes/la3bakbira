package tn.la3bakbira.catalog.common;

/** The request is valid but clashes with the current state (duplicate slug, entity still in use...). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
