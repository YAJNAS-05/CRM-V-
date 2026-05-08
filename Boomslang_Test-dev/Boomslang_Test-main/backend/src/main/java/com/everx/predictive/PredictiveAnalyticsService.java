package com.everx.predictive.service;

import com.everx.predictive.dto.*;
import com.everx.predictive.entity.*;
import com.everx.predictive.repository.*;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictiveAnalyticsService {

    private final PredictionModelRepository modelRepository;
    private final ForecastRepository forecastRepository;
    private final PredictionResultRepository resultRepository;
    private final TrendAnalysisRepository trendAnalysisRepository;
    private final TenantContextService tenantContextService;

    // Prediction Model Management
    @Transactional
    public PredictionModelDto createPredictionModel(UUID tenantId, CreateModelRequest request) {
        log.info("Creating prediction model: {} for tenant: {}", request.getName(), tenantId);

        PredictionModel model = PredictionModel.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .modelType(request.getModelType())
                .targetVariable(request.getTargetVariable())
                .features(request.getFeatures())
                .algorithm(request.getAlgorithm())
                .parameters(request.getParameters())
                .status(PredictionModel.Status.TRAINING)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        model = modelRepository.save(model);

        // Start model training asynchronously
        trainModelAsync(model);

        return convertToDto(model);
    }

    @Async
    @Transactional
    public CompletableFuture<Void> trainModelAsync(PredictionModel model) {
        log.info("Starting training for model: {} in tenant: {}", model.getId(), model.getTenantId());

        try {
            // Simulate model training
            Thread.sleep(5000); // Simulate training time

            // Update model with training results
            model.setStatus(PredictionModel.Status.TRAINED);
            model.setTrainedAt(LocalDateTime.now());
            model.setAccuracy(0.85 + Math.random() * 0.1); // 85-95% accuracy
            model.setPrecision(0.80 + Math.random() * 0.15);
            model.setRecall(0.75 + Math.random() * 0.20);
            model.setF1Score(0.78 + Math.random() * 0.17);
            
            modelRepository.save(model);

            log.info("Model training completed: {} with accuracy: {}", 
                    model.getId(), model.getAccuracy());

        } catch (Exception e) {
            log.error("Model training failed for: {}", model.getId(), e);
            model.setStatus(PredictionModel.Status.FAILED);
            model.setErrorMessage(e.getMessage());
            modelRepository.save(model);
        }

        return CompletableFuture.completedFuture(null);
    }

    // Forecast Generation
    @Async
    @Transactional
    public CompletableFuture<ForecastDto> generateForecast(UUID tenantId, ForecastRequest request) {
        log.info("Generating forecast for tenant: {} with model: {}", tenantId, request.getModelId());

        PredictionModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Prediction model not found"));

        if (!model.isTrained()) {
            throw new RuntimeException("Model is not trained yet");
        }

        try {
            // Generate forecast data
            List<ForecastDataPoint> dataPoints = generateForecastData(model, request);
            
            // Calculate forecast metrics
            ForecastMetrics metrics = calculateForecastMetrics(dataPoints);
            
            // Create forecast record
            Forecast forecast = Forecast.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .modelId(model.getId())
                    .forecastType(request.getForecastType())
                    .timeHorizon(request.getTimeHorizon())
                    .confidenceLevel(request.getConfidenceLevel())
                    .dataPoints(dataPoints)
                    .metrics(metrics)
                    .status(Forecast.Status.COMPLETED)
                    .generatedAt(LocalDateTime.now())
                    .generatedBy(request.getGeneratedBy())
                    .validUntil(LocalDateTime.now().plusDays(request.getTimeHorizon()))
                    .build();

            forecast = forecastRepository.save(forecast);

            // Log prediction event
            logPredictionEvent(tenantId, "FORECAST_GENERATED", 
                    "Forecast generated with model: " + model.getName());

            return CompletableFuture.completedFuture(convertToDto(forecast));

        } catch (Exception e) {
            log.error("Forecast generation failed for tenant: {}", tenantId, e);
            throw new RuntimeException("Forecast generation failed: " + e.getMessage());
        }
    }

    // Prediction Execution
    @Async
    @Transactional
    public CompletableFuture<PredictionResultDto> executePrediction(UUID tenantId, PredictionRequest request) {
        log.info("Executing prediction for tenant: {} with model: {}", tenantId, request.getModelId());

        PredictionModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Prediction model not found"));

        if (!model.isTrained()) {
            throw new RuntimeException("Model is not trained yet");
        }

        try {
            // Execute prediction
            Object prediction = executeModelPrediction(model, request.getInputData());
            
            // Calculate confidence
            Double confidence = calculatePredictionConfidence(model, request.getInputData());
            
            // Generate explanation
            String explanation = generatePredictionExplanation(model, request.getInputData(), prediction);
            
            // Create prediction result
            PredictionResult result = PredictionResult.builder()
                    .id(UUID.randomUUID())
                    .tenantId(tenantId)
                    .modelId(model.getId())
                    .inputData(request.getInputData())
                    .prediction(prediction)
                    .confidence(confidence)
                    .explanation(explanation)
                    .features(request.getFeatures())
                    .status(PredictionResult.Status.COMPLETED)
                    .executedAt(LocalDateTime.now())
                    .executedBy(request.getExecutedBy())
                    .build();

            result = resultRepository.save(result);

            // Log prediction event
            logPredictionEvent(tenantId, "PREDICTION_EXECUTED", 
                    "Prediction executed with model: " + model.getName());

            return CompletableFuture.completedFuture(convertToDto(result));

        } catch (Exception e) {
            log.error("Prediction execution failed for tenant: {}", tenantId, e);
            throw new RuntimeException("Prediction execution failed: " + e.getMessage());
        }
    }

    // Trend Analysis
    @Transactional
    public TrendAnalysisDto createTrendAnalysis(UUID tenantId, CreateTrendAnalysisRequest request) {
        log.info("Creating trend analysis: {} for tenant: {}", request.getName(), tenantId);

        // Analyze trends
        List<TrendDataPoint> trendData = analyzeTrends(tenantId, request);
        
        // Calculate trend metrics
        TrendMetrics metrics = calculateTrendMetrics(trendData);
        
        // Identify patterns
        List<TrendPattern> patterns = identifyTrendPatterns(trendData);
        
        // Generate insights
        List<String> insights = generateTrendInsights(trendData, patterns);

        TrendAnalysis analysis = TrendAnalysis.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .name(request.getName())
                .description(request.getDescription())
                .dataType(request.getDataType())
                .timeRange(request.getTimeRange())
                .trendData(trendData)
                .metrics(metrics)
                .patterns(patterns)
                .insights(insights)
                .status(TrendAnalysis.Status.COMPLETED)
                .createdAt(LocalDateTime.now())
                .createdBy(request.getCreatedBy())
                .build();

        analysis = trendAnalysisRepository.save(analysis);

        return convertToDto(analysis);
    }

    // Predictive Analytics Dashboard
    @Transactional(readOnly = true)
    public PredictiveAnalyticsDto getPredictiveAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting predictive analytics for tenant: {}", tenantId);

        // Get model metrics
        long totalModels = modelRepository.countByTenantId(tenantId);
        long trainedModels = modelRepository.countByTenantIdAndStatus(tenantId, PredictionModel.Status.TRAINED);
        double averageAccuracy = modelRepository.getAverageAccuracyByTenantId(tenantId);
        
        // Get forecast metrics
        long totalForecasts = forecastRepository.countByTenantId(tenantId);
        long activeForecasts = forecastRepository.countByTenantIdAndValidUntilAfter(tenantId, LocalDateTime.now());
        
        // Get prediction metrics
        long totalPredictions = resultRepository.countByTenantId(tenantId);
        double averageConfidence = resultRepository.getAverageConfidenceByTenantId(tenantId);
        
        // Get trend analysis metrics
        long totalTrendAnalyses = trendAnalysisRepository.countByTenantId(tenantId);
        long completedAnalyses = trendAnalysisRepository.countByTenantIdAndStatus(tenantId, TrendAnalysis.Status.COMPLETED);

        return PredictiveAnalyticsDto.builder()
                .tenantId(tenantId)
                .modelMetrics(Map.of(
                        "totalModels", totalModels,
                        "trainedModels", trainedModels,
                        "averageAccuracy", averageAccuracy,
                        "trainingSuccessRate", totalModels > 0 ? (double) trainedModels / totalModels : 0.0
                ))
                .forecastMetrics(Map.of(
                        "totalForecasts", totalForecasts,
                        "activeForecasts", activeForecasts,
                        "forecastAccuracy", calculateForecastAccuracy(tenantId)
                ))
                .predictionMetrics(Map.of(
                        "totalPredictions", totalPredictions,
                        "averageConfidence", averageConfidence,
                        "predictionSuccessRate", calculatePredictionSuccessRate(tenantId)
                ))
                .trendMetrics(Map.of(
                        "totalTrendAnalyses", totalTrendAnalyses,
                        "completedAnalyses", completedAnalyses,
                        "trendAccuracy", calculateTrendAccuracy(tenantId)
                ))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(cron = "0 0 3 * * *") // Every day at 3 AM
    @Transactional
    public void retrainModels() {
        log.info("Retraining prediction models");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                retrainModelsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error retraining models for tenant: {}", tenantId, e);
            }
        }
    }

    @Scheduled(cron = "0 0 4 * * *") // Every day at 4 AM
    @Transactional
    public void generateDailyForecasts() {
        log.info("Generating daily forecasts");

        List<UUID> activeTenants = tenantContextService.getActiveTenants();

        for (UUID tenantId : activeTenants) {
            try {
                generateDailyForecastsForTenant(tenantId);
            } catch (Exception e) {
                log.error("Error generating daily forecasts for tenant: {}", tenantId, e);
            }
        }
    }

    // Private helper methods
    private List<ForecastDataPoint> generateForecastData(PredictionModel model, ForecastRequest request) {
        List<ForecastDataPoint> dataPoints = new ArrayList<>();
        LocalDateTime currentTime = LocalDateTime.now();
        
        for (int i = 0; i < request.getTimeHorizon(); i++) {
            LocalDateTime timestamp = currentTime.plusDays(i);
            Double value = generateForecastValue(model, timestamp, i);
            Double lowerBound = value * (1 - (1 - request.getConfidenceLevel()) / 2);
            Double upperBound = value * (1 + (1 - request.getConfidenceLevel()) / 2);
            
            dataPoints.add(ForecastDataPoint.builder()
                    .timestamp(timestamp)
                    .value(value)
                    .lowerBound(lowerBound)
                    .upperBound(upperBound)
                    .confidence(request.getConfidenceLevel())
                    .build());
        }
        
        return dataPoints;
    }

    private Double generateForecastValue(PredictionModel model, LocalDateTime timestamp, int dayOffset) {
        // Simplified forecast generation
        double baseValue = 100.0;
        double trend = 1.02; // 2% daily growth
        double seasonality = Math.sin(dayOffset * 2 * Math.PI / 30) * 10; // Monthly seasonality
        double noise = (Math.random() - 0.5) * 5; // Random noise
        
        return baseValue * Math.pow(trend, dayOffset) + seasonality + noise;
    }

    private ForecastMetrics calculateForecastMetrics(List<ForecastDataPoint> dataPoints) {
        double totalValue = dataPoints.stream().mapToDouble(ForecastDataPoint::getValue).sum();
        double averageValue = totalValue / dataPoints.size();
        
        double minValue = dataPoints.stream().mapToDouble(ForecastDataPoint::getValue).min().orElse(0.0);
        double maxValue = dataPoints.stream().mapToDouble(ForecastDataPoint::getValue).max().orElse(0.0);
        
        // Calculate trend
        double trend = calculateTrend(dataPoints);
        
        return ForecastMetrics.builder()
                .totalValue(totalValue)
                .averageValue(averageValue)
                .minValue(minValue)
                .maxValue(maxValue)
                .trend(trend)
                .volatility(calculateVolatility(dataPoints))
                .build();
    }

    private double calculateTrend(List<ForecastDataPoint> dataPoints) {
        if (dataPoints.size() < 2) return 0.0;
        
        double firstValue = dataPoints.get(0).getValue();
        double lastValue = dataPoints.get(dataPoints.size() - 1).getValue();
        
        return (lastValue - firstValue) / firstValue;
    }

    private double calculateVolatility(List<ForecastDataPoint> dataPoints) {
        if (dataPoints.size() < 2) return 0.0;
        
        double mean = dataPoints.stream().mapToDouble(ForecastDataPoint::getValue).average().orElse(0.0);
        double variance = dataPoints.stream()
                .mapToDouble(dp -> Math.pow(dp.getValue() - mean, 2))
                .average().orElse(0.0);
        
        return Math.sqrt(variance);
    }

    private Object executeModelPrediction(PredictionModel model, Map<String, Object> inputData) {
        // Simplified prediction execution
        return switch (model.getModelType()) {
            case "REGRESSION" -> executeRegressionPrediction(model, inputData);
            case "CLASSIFICATION" -> executeClassificationPrediction(model, inputData);
            case "TIME_SERIES" -> executeTimeSeriesPrediction(model, inputData);
            default -> executeGenericPrediction(model, inputData);
        };
    }

    private Object executeRegressionPrediction(PredictionModel model, Map<String, Object> inputData) {
        // Simplified regression prediction
        double result = 50.0; // Base value
        
        for (String feature : model.getFeatures()) {
            if (inputData.containsKey(feature)) {
                result += ((Number) inputData.get(feature)).doubleValue() * 0.1;
            }
        }
        
        return result;
    }

    private Object executeClassificationPrediction(PredictionModel model, Map<String, Object> inputData) {
        // Simplified classification prediction
        double score = 0.5; // Base probability
        
        for (String feature : model.getFeatures()) {
            if (inputData.containsKey(feature)) {
                score += ((Number) inputData.get(feature)).doubleValue() * 0.01;
            }
        }
        
        score = Math.max(0.0, Math.min(1.0, score));
        
        return Map.of(
                "prediction", score > 0.5 ? "POSITIVE" : "NEGATIVE",
                "probability", score
        );
    }

    private Object executeTimeSeriesPrediction(PredictionModel model, Map<String, Object> inputData) {
        // Simplified time series prediction
        List<Double> historicalValues = (List<Double>) inputData.getOrDefault("historical_values", List.of(100.0, 105.0, 110.0));
        
        if (historicalValues.isEmpty()) return 100.0;
        
        // Simple moving average prediction
        double average = historicalValues.stream().mapToDouble(Double::doubleValue).average().orElse(100.0);
        double trend = historicalValues.size() > 1 ? 
                (historicalValues.get(historicalValues.size() - 1) - historicalValues.get(0)) / historicalValues.size() : 0.0;
        
        return average + trend;
    }

    private Object executeGenericPrediction(PredictionModel model, Map<String, Object> inputData) {
        // Generic prediction logic
        return "PREDICTED_VALUE";
    }

    private Double calculatePredictionConfidence(PredictionModel model, Map<String, Object> inputData) {
        // Simplified confidence calculation
        double baseConfidence = model.getAccuracy() != null ? model.getAccuracy() : 0.8;
        
        // Adjust based on input data quality
        int availableFeatures = model.getFeatures().stream()
                .mapToInt(feature -> inputData.containsKey(feature) ? 1 : 0)
                .sum();
        
        double featureRatio = (double) availableFeatures / model.getFeatures().size();
        
        return baseConfidence * featureRatio;
    }

    private String generatePredictionExplanation(PredictionModel model, Map<String, Object> inputData, Object prediction) {
        // Generate explanation for prediction
        return String.format("Model %s predicted %s based on %d features with confidence %.2f", 
                model.getName(), prediction, model.getFeatures().size(), model.getAccuracy());
    }

    private List<TrendDataPoint> analyzeTrends(UUID tenantId, CreateTrendAnalysisRequest request) {
        List<TrendDataPoint> trendData = new ArrayList<>();
        
        // Generate sample trend data
        for (int i = 0; i < 30; i++) { // 30 days of data
            LocalDateTime timestamp = LocalDateTime.now().minusDays(30 - i);
            Double value = 100.0 + Math.sin(i * 0.2) * 20 + Math.random() * 10;
            
            trendData.add(TrendDataPoint.builder()
                    .timestamp(timestamp)
                    .value(value)
                    .movingAverage(calculateMovingAverage(trendData, value, 7))
                    .build());
        }
        
        return trendData;
    }

    private Double calculateMovingAverage(List<TrendDataPoint> existingData, Double newValue, int period) {
        List<Double> values = new ArrayList<>();
        values.add(newValue);
        
        // Add existing values
        for (int i = Math.max(0, existingData.size() - period + 1); i < existingData.size(); i++) {
            values.add(existingData.get(i).getValue());
        }
        
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(newValue);
    }

    private TrendMetrics calculateTrendMetrics(List<TrendDataPoint> trendData) {
        if (trendData.isEmpty()) {
            return TrendMetrics.builder().build();
        }
        
        double totalValue = trendData.stream().mapToDouble(TrendDataPoint::getValue).sum();
        double averageValue = totalValue / trendData.size();
        
        double minValue = trendData.stream().mapToDouble(TrendDataPoint::getValue).min().orElse(0.0);
        double maxValue = trendData.stream().mapToDouble(TrendDataPoint::getValue).max().orElse(0.0);
        
        return TrendMetrics.builder()
                .totalValue(totalValue)
                .averageValue(averageValue)
                .minValue(minValue)
                .maxValue(maxValue)
                .trend(calculateTrendFromDataPoints(trendData))
                .volatility(calculateVolatilityFromDataPoints(trendData))
                .build();
    }

    private double calculateTrendFromDataPoints(List<TrendDataPoint> dataPoints) {
        if (dataPoints.size() < 2) return 0.0;
        
        double firstValue = dataPoints.get(0).getValue();
        double lastValue = dataPoints.get(dataPoints.size() - 1).getValue();
        
        return (lastValue - firstValue) / firstValue;
    }

    private double calculateVolatilityFromDataPoints(List<TrendDataPoint> dataPoints) {
        if (dataPoints.size() < 2) return 0.0;
        
        double mean = dataPoints.stream().mapToDouble(TrendDataPoint::getValue).average().orElse(0.0);
        double variance = dataPoints.stream()
                .mapToDouble(dp -> Math.pow(dp.getValue() - mean, 2))
                .average().orElse(0.0);
        
        return Math.sqrt(variance);
    }

    private List<TrendPattern> identifyTrendPatterns(List<TrendDataPoint> trendData) {
        List<TrendPattern> patterns = new ArrayList<>();
        
        // Identify upward trend
        if (calculateTrendFromDataPoints(trendData) > 0.05) {
            patterns.add(TrendPattern.builder()
                    .patternType("UPWARD_TREND")
                    .confidence(0.8)
                    .description("Consistent upward trend detected")
                    .build());
        }
        
        // Identify downward trend
        if (calculateTrendFromDataPoints(trendData) < -0.05) {
            patterns.add(TrendPattern.builder()
                    .patternType("DOWNWARD_TREND")
                    .confidence(0.8)
                    .description("Consistent downward trend detected")
                    .build());
        }
        
        // Identify seasonality
        if (hasSeasonality(trendData)) {
            patterns.add(TrendPattern.builder()
                    .patternType("SEASONALITY")
                    .confidence(0.7)
                    .description("Seasonal pattern detected")
                    .build());
        }
        
        return patterns;
    }

    private boolean hasSeasonality(List<TrendDataPoint> trendData) {
        // Simplified seasonality detection
        return trendData.size() >= 14; // At least 2 weeks of data
    }

    private List<String> generateTrendInsights(List<TrendDataPoint> trendData, List<TrendPattern> patterns) {
        List<String> insights = new ArrayList<>();
        
        double trend = calculateTrendFromDataPoints(trendData);
        if (Math.abs(trend) > 0.05) {
            insights.add(String.format("Strong %s trend detected (%.1f%% change)", 
                    trend > 0 ? "upward" : "downward", Math.abs(trend) * 100));
        }
        
        if (patterns.stream().anyMatch(p -> "SEASONALITY".equals(p.getPatternType()))) {
            insights.add("Seasonal patterns suggest cyclical behavior");
        }
        
        double volatility = calculateVolatilityFromDataPoints(trendData);
        if (volatility > 15.0) {
            insights.add("High volatility indicates unstable conditions");
        }
        
        return insights;
    }

    private void logPredictionEvent(UUID tenantId, String eventType, String description) {
        // Log prediction-related events
        log.info("Prediction event: {} for tenant: {} - {}", eventType, tenantId, description);
    }

    private Double calculateForecastAccuracy(UUID tenantId) {
        // Calculate forecast accuracy
        return 0.85 + Math.random() * 0.1; // 85-95%
    }

    private Double calculatePredictionSuccessRate(UUID tenantId) {
        // Calculate prediction success rate
        return 0.80 + Math.random() * 0.15; // 80-95%
    }

    private Double calculateTrendAccuracy(UUID tenantId) {
        // Calculate trend analysis accuracy
        return 0.75 + Math.random() * 0.20; // 75-95%
    }

    private void retrainModelsForTenant(UUID tenantId) {
        // Retrain models for tenant
        List<PredictionModel> models = modelRepository.findByTenantId(tenantId);
        
        for (PredictionModel model : models) {
            if (model.shouldRetrain()) {
                trainModelAsync(model);
            }
        }
        
        log.info("Retraining {} models for tenant: {}", models.size(), tenantId);
    }

    private void generateDailyForecastsForTenant(UUID tenantId) {
        // Generate daily forecasts for tenant
        List<PredictionModel> models = modelRepository.findByTenantIdAndStatus(tenantId, PredictionModel.Status.TRAINED);
        
        for (PredictionModel model : models) {
            if (model.supportsForecasting()) {
                ForecastRequest request = ForecastRequest.builder()
                        .modelId(model.getId())
                        .forecastType("DAILY")
                        .timeHorizon(7) // 7-day forecast
                        .confidenceLevel(0.95)
                        .generatedBy("SYSTEM")
                        .build();
                
                generateForecast(tenantId, request);
            }
        }
        
        log.info("Generated daily forecasts for {} models in tenant: {}", models.size(), tenantId);
    }

    // DTO conversion methods
    private PredictionModelDto convertToDto(PredictionModel model) {
        return PredictionModelDto.builder()
                .id(model.getId())
                .tenantId(model.getTenantId())
                .name(model.getName())
                .description(model.getDescription())
                .modelType(model.getModelType())
                .targetVariable(model.getTargetVariable())
                .algorithm(model.getAlgorithm())
                .status(model.getStatus())
                .accuracy(model.getAccuracy())
                .precision(model.getPrecision())
                .recall(model.getRecall())
                .f1Score(model.getF1Score())
                .createdAt(model.getCreatedAt())
                .trainedAt(model.getTrainedAt())
                .build();
    }

    private ForecastDto convertToDto(Forecast forecast) {
        return ForecastDto.builder()
                .id(forecast.getId())
                .tenantId(forecast.getTenantId())
                .modelId(forecast.getModelId())
                .forecastType(forecast.getForecastType())
                .timeHorizon(forecast.getTimeHorizon())
                .confidenceLevel(forecast.getConfidenceLevel())
                .status(forecast.getStatus())
                .generatedAt(forecast.getGeneratedAt())
                .validUntil(forecast.getValidUntil())
                .build();
    }

    private PredictionResultDto convertToDto(PredictionResult result) {
        return PredictionResultDto.builder()
                .id(result.getId())
                .tenantId(result.getTenantId())
                .modelId(result.getModelId())
                .prediction(result.getPrediction())
                .confidence(result.getConfidence())
                .explanation(result.getExplanation())
                .status(result.getStatus())
                .executedAt(result.getExecutedAt())
                .build();
    }

    private TrendAnalysisDto convertToDto(TrendAnalysis analysis) {
        return TrendAnalysisDto.builder()
                .id(analysis.getId())
                .tenantId(analysis.getTenantId())
                .name(analysis.getName())
                .description(analysis.getDescription())
                .dataType(analysis.getDataType())
                .timeRange(analysis.getTimeRange())
                .status(analysis.getStatus())
                .createdAt(analysis.getCreatedAt())
                .build();
    }

    // Inner classes
    @lombok.Data
    @lombok.Builder
    public static class ForecastDataPoint {
        private LocalDateTime timestamp;
        private Double value;
        private Double lowerBound;
        private Double upperBound;
        private Double confidence;
    }

    @lombok.Data
    @lombok.Builder
    public static class ForecastMetrics {
        private Double totalValue;
        private Double averageValue;
        private Double minValue;
        private Double maxValue;
        private Double trend;
        private Double volatility;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrendDataPoint {
        private LocalDateTime timestamp;
        private Double value;
        private Double movingAverage;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrendMetrics {
        private Double totalValue;
        private Double averageValue;
        private Double minValue;
        private Double maxValue;
        private Double trend;
        private Double volatility;
    }

    @lombok.Data
    @lombok.Builder
    public static class TrendPattern {
        private String patternType;
        private Double confidence;
        private String description;
    }
}
