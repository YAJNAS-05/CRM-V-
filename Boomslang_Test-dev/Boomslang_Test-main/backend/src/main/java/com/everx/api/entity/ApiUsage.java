package com.everx.api.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "api_usage", schema = "everx_api")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class ApiUsage extends BaseEntity {

    @Column(name = "api_key_id", nullable = false)
    private UUID apiKeyId;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "endpoint", nullable = false, length = 500)
    private String endpoint;

    @Column(name = "method", nullable = false, length = 10)
    private String method;

    @Column(name = "status_code", nullable = false)
    private Integer statusCode;

    @Column(name = "response_time_ms", nullable = false)
    private Long responseTimeMs;

    @Column(name = "request_size_bytes")
    private Long requestSizeBytes;

    @Column(name = "response_size_bytes")
    private Long responseSizeBytes;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "api_version", length = 20)
    private String apiVersion;

    @Column(name = "is_success", nullable = false)
    @Builder.Default
    private Boolean isSuccess = true;

    // Helper methods
    public boolean isError() {
        return !isSuccess || (statusCode != null && statusCode >= 400);
    }

    public boolean isClientError() {
        return statusCode != null && statusCode >= 400 && statusCode < 500;
    }

    public boolean isServerError() {
        return statusCode != null && statusCode >= 500;
    }

    public String getStatusCodeCategory() {
        if (statusCode == null) return "UNKNOWN";
        if (statusCode >= 200 && statusCode < 300) return "SUCCESS";
        if (statusCode >= 300 && statusCode < 400) return "REDIRECT";
        if (statusCode >= 400 && statusCode < 500) return "CLIENT_ERROR";
        if (statusCode >= 500) return "SERVER_ERROR";
        return "UNKNOWN";
    }
}
