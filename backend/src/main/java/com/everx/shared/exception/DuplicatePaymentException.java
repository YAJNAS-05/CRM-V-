package com.everx.shared.exception;

/**
 * Thrown when a payment request is detected as a duplicate via the idempotency
 * key guard in {@link com.everx.finance.payment.PaymentDeduplicationService}.
 *
 * <p>Maps to HTTP 409 Conflict via the global exception handler.
 */
public class DuplicatePaymentException extends RuntimeException {

    public DuplicatePaymentException(String message) {
        super(message);
    }

    public DuplicatePaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}
