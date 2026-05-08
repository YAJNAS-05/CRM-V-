package com.everx.predictive.controller;

import com.everx.predictive.dto.*;
import com.everx.predictive.service.PredictiveAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/predictive")
@RequiredArgsConstructor
@Slf4j
public class PredictiveAnalyticsController {

    private final PredictiveAnalyticsService predictiveService;

    // Prediction Model endpoints
    @PostMapping("/models")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DATA_SCIENTIST')")
    public ResponseEntity<PredictionModelDto> createPredictionModel(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateModelRequest request) {
        log.info("Creating prediction model: {} for tenant: {}", request.getName(), tenantId);
        PredictionModelDto result = predictiveService.createPredictionModel(tenantId, request);
        return ResponseEntity.ok(result);
    }

    // Forecast endpoints
    @PostMapping("/forecasts")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public CompletableFuture<ForecastDto> generateForecast(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody ForecastRequest request) {
        log.info("Generating forecast for tenant: {} with model: {}", tenantId, request.getModelId());
        return predictiveService.generateForecast(tenantId, request);
    }

    // Prediction endpoints
    @PostMapping("/predictions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public CompletableFuture<PredictionDto> executePrediction(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody PredictionRequest request) {
        log.info("Executing prediction for tenant: {} with model: {}", tenantId, request.getModelId());
        return predictiveService.executePrediction(tenantId, request);
    }

    // Trend Analysis endpoints
    @PostMapping("/trends")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<TrendAnalysisDto> createTrendAnalysis(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestBody CreateTrendAnalysisRequest request) {
        log.info("Creating trend analysis: {} for tenant: {}", request.getName(), tenantId);
        TrendAnalysisDto result = predictiveService.createTrendAnalysis(tenantId, request);
        return ResponseEntity.ok(result);
    }

    // Analytics endpoints
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<PredictiveAnalyticsDto> getPredictiveAnalytics(
            @RequestHeader("X-Tenant-ID") UUID tenantId,
            @RequestParam(required = false) String timeRange) {
        log.info("Getting predictive analytics for tenant: {}", tenantId);
        AnalyticsRequest request = AnalyticsRequest.builder()
                .timeRange(timeRange != null ? timeRange : "7d")
                .build();
        PredictiveAnalyticsDto result = predictiveService.getPredictiveAnalytics(tenantId, request);
        return ResponseEntity.ok(result);
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "service", "predictive-analytics"
        ));
    }

    // Error handling
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleError(Exception e) {
        log.error("Predictive analytics controller error", e);
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Predictive analytics operation failed",
                "message", e.getMessage()
        ));
    }
}
