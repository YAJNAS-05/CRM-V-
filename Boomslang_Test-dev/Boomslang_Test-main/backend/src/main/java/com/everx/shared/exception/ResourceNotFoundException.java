package com.everx.shared.exception;

/**
 * Thrown when a requested resource is not found
 */
public class ResourceNotFoundException extends EverXException {
    
    public ResourceNotFoundException(String resourceType, String identifier) {
        super("RESOURCE_NOT_FOUND", 
              String.format("%s with identifier %s not found", resourceType, identifier),
              String.format("The requested %s could not be found", resourceType.toLowerCase()));
    }
    
    public ResourceNotFoundException(String resourceType, String identifier, Throwable cause) {
        super("RESOURCE_NOT_FOUND",
              String.format("%s with identifier %s not found", resourceType, identifier),
              String.format("The requested %s could not be found", resourceType.toLowerCase()),
              cause);
    }
}
