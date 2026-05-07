package com.everx.backend.auth.controller;

import com.everx.backend.shared.dto.ErrorResponse;
import com.everx.shared.exception.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enterprise global exception handler for all REST controllers
 */
@Slf4j
@RestControllerAdvice
public class EnterpriseGlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication failed: {}", ex.getUserMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .userMessage(ex.getUserMessage())
                .status(HttpStatus.UNAUTHORIZED.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationException(
            AuthorizationException ex, HttpServletRequest request) {
        log.warn("Authorization denied: {}", ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .userMessage(ex.getUserMessage())
                .status(HttpStatus.FORBIDDEN.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.info("Resource not found: {}", ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .userMessage(ex.getUserMessage())
                .status(HttpStatus.NOT_FOUND.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex, HttpServletRequest request) {
        log.warn("Validation error: {}", ex.getMessage());
        
        // Convert Map<String, String> to Map<String, List<String>>
        Map<String, List<String>> fieldErrors = new HashMap<>();
        for (Map.Entry<String, String> entry : ex.getErrors().entrySet()) {
            fieldErrors.put(entry.getKey(), List.of(entry.getValue()));
        }
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode("VALIDATION_ERROR")
                .message(ex.getMessage())
                .userMessage("Validation failed")
                .status(HttpStatus.BAD_REQUEST.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .fieldErrors(fieldErrors)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<ErrorResponse> handleRateLimitException(
            RateLimitException ex, HttpServletRequest request) {
        log.warn("Rate limit exceeded");
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .userMessage(ex.getUserMessage())
                .status(429)
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity
                .status(429)
                .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
                .body(response);
    }
    
    @ExceptionHandler(EverXException.class)
    public ResponseEntity<ErrorResponse> handleEverXException(
            EverXException ex, HttpServletRequest request) {
        log.error("EverX exception: {}", ex.getErrorCode(), ex);
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .userMessage(ex.getUserMessage())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode("ACCESS_DENIED")
                .message("Access denied")
                .userMessage("You do not have permission to access this resource")
                .status(HttpStatus.FORBIDDEN.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        HttpServletRequest servletRequest = request instanceof ServletWebRequest servletWebRequest
                ? servletWebRequest.getRequest()
                : null;
        String path = servletRequest != null ? servletRequest.getRequestURI() : null;
        String method = servletRequest != null ? servletRequest.getMethod() : null;
        log.warn("Validation error on request: {}", path != null ? path : "unknown");
        
        Map<String, List<String>> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : "global";
            String errorMessage = Objects.toString(error.getDefaultMessage(), "Invalid value");
            fieldErrors.computeIfAbsent(fieldName, k -> new ArrayList<>()).add(errorMessage);
        });
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode("VALIDATION_ERROR")
                .message("Validation failed")
                .userMessage("Invalid request parameters")
                .status(HttpStatus.BAD_REQUEST.value())
                .path(path)
                .method(method)
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(servletRequest))
                .fieldErrors(fieldErrors)
                .build();
        
        return handleExceptionInternal(ex, response, headers, HttpStatus.BAD_REQUEST, request);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error occurred", ex);
        
        ErrorResponse response = ErrorResponse.builder()
                .success(false)
                .errorCode("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred")
                .userMessage("We encountered an unexpected error. Please try again later.")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .path(request.getRequestURI())
                .method(request.getMethod())
                .timestamp(LocalDateTime.now())
                .requestId(getRequestId(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    private String getRequestId(HttpServletRequest request) {
        String requestId = request != null ? request.getHeader("X-Request-ID") : null;
        if (requestId == null || requestId.isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }
        return requestId;
    }
}
