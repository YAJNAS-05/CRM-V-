package com.everx.ai.controller;

import com.everx.ai.dto.InsightRequest;
import com.everx.ai.service.DataProcessingService;
import com.everx.ai.service.MLModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {

    private final DataProcessingService dataProcessingService;
    private final MLModelService mlModelService;

    @PostMapping("/insights/generate")
    public ResponseEntity<Map<String, Object>> generateInsights(@RequestBody InsightRequest request) {
        log.info("Generating AI insights for type: {}", request.getInsightType());
        
        Map<String, Object> insights = dataProcessingService.prepareDataForAnalysis(request.getTenantId(), request);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Insights generated successfully",
            "data", insights
        ));
    }

    @GetMapping("/models")
    public ResponseEntity<Map<String, Object>> getAvailableModels() {
        log.info("Fetching available AI models");
        
        Map<String, Object> models = mlModelService.getAvailableModels();
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Models retrieved successfully",
            "data", models
        ));
    }

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> makePrediction(@RequestBody Map<String, Object> request) {
        log.info("Making AI prediction");
        
        UUID tenantId = UUID.fromString(request.get("tenantId").toString());
        String modelType = request.get("modelType").toString();
        Map<String, Object> inputData = (Map<String, Object>) request.get("data");
        
        Map<String, Object> prediction = mlModelService.makePrediction(tenantId, modelType, inputData);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Prediction completed successfully",
            "data", prediction
        ));
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        log.info("Getting revenue analytics for tenant: {}", tenantId);
        
        Map<String, Object> analytics = dataProcessingService.getRevenueAnalytics(tenantId, startDate, endDate);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Revenue analytics retrieved successfully",
            "data", analytics
        ));
    }

    @GetMapping("/analytics/customers")
    public ResponseEntity<Map<String, Object>> getCustomerAnalytics(@RequestParam UUID tenantId) {
        log.info("Getting customer analytics for tenant: {}", tenantId);
        
        Map<String, Object> analytics = dataProcessingService.getCustomerAnalytics(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Customer analytics retrieved successfully",
            "data", analytics
        ));
    }

    @GetMapping("/analytics/operational")
    public ResponseEntity<Map<String, Object>> getOperationalAnalytics(@RequestParam UUID tenantId) {
        log.info("Getting operational analytics for tenant: {}", tenantId);
        
        Map<String, Object> analytics = dataProcessingService.getOperationalAnalytics(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Operational analytics retrieved successfully",
            "data", analytics
        ));
    }

    @GetMapping("/analytics/risk")
    public ResponseEntity<Map<String, Object>> getRiskAnalytics(@RequestParam UUID tenantId) {
        log.info("Getting risk analytics for tenant: {}", tenantId);
        
        Map<String, Object> analytics = dataProcessingService.getRiskAnalytics(tenantId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Risk analytics retrieved successfully",
            "data", analytics
        ));
    }
}
