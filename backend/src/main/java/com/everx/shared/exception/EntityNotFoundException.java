package com.everx.shared.exception;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public static EntityNotFoundException ofEntity(Class<?> entity, Object id) {
        return new EntityNotFoundException(entity.getSimpleName() + " not found with id: " + id);
    }

    public static EntityNotFoundException ofEntity(Class<?> entity, String field, Object value) {
        return new EntityNotFoundException(entity.getSimpleName() + " not found with " + field + ": " + value);
    }
}
