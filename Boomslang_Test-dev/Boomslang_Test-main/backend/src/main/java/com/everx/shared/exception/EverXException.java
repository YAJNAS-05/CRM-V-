package com.everx.shared.exception;

/**
 * Base exception for all EverX business exceptions
 */
public abstract class EverXException extends RuntimeException {
    
    private final String errorCode;
    private final String userMessage;
    private final Object[] messageParams;
    
    public EverXException(String errorCode, String message) {
        this(errorCode, message, message);
    }
    
    public EverXException(String errorCode, String message, String userMessage) {
        super(message);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
        this.messageParams = new Object[0];
    }
    
    public EverXException(String errorCode, String message, String userMessage, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
        this.messageParams = new Object[0];
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public String getUserMessage() {
        return userMessage;
    }
    
    public Object[] getMessageParams() {
        return messageParams;
    }
}
