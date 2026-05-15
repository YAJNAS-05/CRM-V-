package com.everx.finance.period;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when attempting to post a transaction in a period that is not OPEN.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class PostingPeriodException extends RuntimeException {
    
    public PostingPeriodException(String message) {
        super(message);
    }

    public PostingPeriodException(String message, Throwable cause) {
        super(message, cause);
    }
}
