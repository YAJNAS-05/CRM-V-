package com.everx.shared.exception;

/**
 * Thrown when authentication fails or token is invalid
 */
public class AuthenticationException extends EverXException {
    
    public AuthenticationException(String message) {
        super("AUTHENTICATION_FAILED", message, "Authentication failed. Please login again.");
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super("AUTHENTICATION_FAILED", message, "Authentication failed. Please login again.", cause);
    }
    
    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException("Invalid username or password");
    }
    
    public static AuthenticationException tokenExpired() {
        return new AuthenticationException("Session expired. Please login again");
    }
    
    public static AuthenticationException accountLocked() {
        return new AuthenticationException("Account is locked due to multiple failed login attempts");
    }
    
    public static AuthenticationException mfaRequired() {
        return new AuthenticationException("Multi-factor authentication is required");
    }
}
