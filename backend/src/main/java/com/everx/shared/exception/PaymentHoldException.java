package com.everx.shared.exception;

/**
 * Thrown when a payment is blocked by a three-way match variance that exceeds tolerance.
 * Maps to HTTP 422 Unprocessable Entity via the global exception handler.
 */
public class PaymentHoldException extends RuntimeException {

    public PaymentHoldException(String message) {
        super(message);
    }

    public PaymentHoldException(String message, Throwable cause) {
        super(message, cause);
    }
}
