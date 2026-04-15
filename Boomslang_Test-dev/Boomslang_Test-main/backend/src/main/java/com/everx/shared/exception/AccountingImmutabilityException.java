package com.everx.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting to modify an accounting document that is immutable
 * (e.g., a posted invoice).
 * 
 * Accounting documents must be immutable once posted to maintain audit trail integrity
 * and financial compliance.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class AccountingImmutabilityException extends RuntimeException {
    
    public AccountingImmutabilityException(String message) {
        super(message);
    }

    public AccountingImmutabilityException(String message, Throwable cause) {
        super(message, cause);
    }
}
