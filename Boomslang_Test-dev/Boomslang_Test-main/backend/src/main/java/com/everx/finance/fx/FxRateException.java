package com.everx.finance.fx;

/**
 * Exception thrown when FX rate operations fail.
 */
public class FxRateException extends RuntimeException {
    public FxRateException(String message) {
        super(message);
    }

    public FxRateException(String message, Throwable cause) {
        super(message, cause);
    }
}
