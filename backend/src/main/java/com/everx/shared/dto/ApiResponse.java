package com.everx.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    @JsonProperty("success")
    private boolean success;

    @JsonProperty("message")
    private String message;

    @JsonProperty("data")
    private T data;

    @JsonProperty("errors")
    private Map<String, String> errors;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    /**
     * [Enterprise Standard] Success response with data and optional message.
     */
    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    /**
     * [Enterprise Standard] Data-only success response.
     */
    public static <T> ApiResponse<T> ok(T data) {
        return ok(data, null);
    }

    /**
     * [Enterprise Standard] Message-only success response.
     * Distinct name avoids ambiguity when data is a String.
     */
    public static <T> ApiResponse<T> okMessage(String message) {
        return ok(null, message);
    }

    /**
     * @deprecated Use {@link #ok(Object, String)} for standardized argument order.
     */
    @Deprecated
    public static <T> ApiResponse<T> success(T data, String message) {
        return ok(data, message);
    }

    /**
     * @deprecated Use {@link #ok(Object)}
     */
    @Deprecated
    public static <T> ApiResponse<T> success(T data) {
        return ok(data);
    }

    public static <T> ApiResponse<T> error(String message, Map<String, String> errors) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setErrors(errors);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
}
