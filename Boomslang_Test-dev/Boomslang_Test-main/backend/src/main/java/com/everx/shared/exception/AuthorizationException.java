package com.everx.shared.exception;

/**
 * Thrown when authorization fails
 */
public class AuthorizationException extends EverXException {
    
    public AuthorizationException(String resource, String action) {
        super("AUTHORIZATION_FAILED",
              String.format("Not authorized to %s %s", action, resource),
              "You do not have permission to perform this action.");
    }
    
    public AuthorizationException(String message) {
        super("AUTHORIZATION_FAILED", message, "You do not have permission to access this resource.");
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super("AUTHORIZATION_FAILED", message, "You do not have permission to access this resource.", cause);
    }
}
