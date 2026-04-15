package com.everx.finance.account;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when GL account determination fails (no configured account for transaction).
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class AccountDeterminationException extends RuntimeException {
    
    public AccountDeterminationException(String message) {
        super(message);
    }

    public AccountDeterminationException(String message, Throwable cause) {
        super(message, cause);
    }
}
