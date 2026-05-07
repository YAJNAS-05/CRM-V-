package com.everx.shared.exception;

/**
 * Thrown when rate limit is exceeded
 */
public class RateLimitException extends EverXException {
    
    private final long retryAfterSeconds;
    
    public RateLimitException(long retryAfterSeconds) {
        super("RATE_LIMIT_EXCEEDED",
              String.format("Rate limit exceeded. Retry after %d seconds", retryAfterSeconds),
              "Too many requests. Please try again later.");
        this.retryAfterSeconds = retryAfterSeconds;
    }
    
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
