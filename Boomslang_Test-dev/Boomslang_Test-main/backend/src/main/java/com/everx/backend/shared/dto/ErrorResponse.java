package com.everx.backend.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Standard error response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    private boolean success;
    private String errorCode;
    private String message;
    private String userMessage;
    private String path;
    private String method;
    private Integer status;
    private LocalDateTime timestamp;
    private String requestId;
    private String traceId;
    private Map<String, List<String>> fieldErrors;
    private List<String> validationErrors;
    private String detailedMessage;
    
    public static ErrorResponse of(String errorCode, String message, String userMessage) {
        return ErrorResponse.builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .userMessage(userMessage)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static ErrorResponse of(String errorCode, String message, String userMessage, int status) {
        return ErrorResponse.builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .userMessage(userMessage)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
