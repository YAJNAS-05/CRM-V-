package com.everx.predictive.repository;

import com.everx.predictive.entity.PredictionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionResultRepository extends JpaRepository<PredictionResult, UUID> {

    List<PredictionResult> findByTenantId(UUID tenantId);

    List<PredictionResult> findByTenantIdAndModelId(UUID tenantId, UUID modelId);

    List<PredictionResult> findByTenantIdAndStatus(UUID tenantId, PredictionResult.Status status);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.executedAt BETWEEN :startDate AND :endDate")
    List<PredictionResult> findByTenantIdAndExecutedAtBetween(@Param("tenantId") UUID tenantId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") PredictionResult.Status status);

    @Query("SELECT COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.actualResult IS NOT NULL")
    List<PredictionResult> findResultsWithActualData(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.executedBy = :executedBy")
    List<PredictionResult> findByTenantIdAndExecutedBy(@Param("tenantId") UUID tenantId, @Param("executedBy") String executedBy);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.confidence >= :minConfidence")
    List<PredictionResult> findByTenantIdAndConfidenceGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minConfidence") Double minConfidence);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.confidence < :maxConfidence")
    List<PredictionResult> findByTenantIdAndConfidenceLessThan(@Param("tenantId") UUID tenantId, @Param("maxConfidence") Double maxConfidence);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.riskScore > :threshold")
    List<PredictionResult> findByTenantIdAndRiskScoreGreaterThan(@Param("tenantId") UUID tenantId, @Param("threshold") Double threshold);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.isAnomaly = true")
    List<PredictionResult> findAnomalousResults(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.batchId = :batchId")
    List<PredictionResult> findByTenantIdAndBatchId(@Param("tenantId") UUID tenantId, @Param("batchId") String batchId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.correlationId = :correlationId")
    List<PredictionResult> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT AVG(p.confidence) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.status = :status")
    Double getAverageConfidenceByTenantId(@Param("tenantId") UUID tenantId, @Param("status") PredictionResult.Status status);

    @Query("SELECT AVG(p.predictionAccuracy) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.actualResult IS NOT NULL")
    Double getAverageAccuracyByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.status, COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId GROUP BY p.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p.predictionType, COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.predictionType IS NOT NULL GROUP BY p.predictionType")
    List<Object[]> getPredictionTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.processingTimeMs > :maxTime")
    List<PredictionResult> findByTenantIdAndProcessingTimeMsGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxTime") Long maxTime);

    @Query("SELECT COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.status = :status AND p.executedAt > :since")
    long countRecentPredictions(@Param("tenantId") UUID tenantId, 
                               @Param("status") PredictionResult.Status status, 
                               @Param("since") LocalDateTime since);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.modelId = :modelId AND p.executedAt BETWEEN :startDate AND :endDate")
    List<PredictionResult> findByTenantIdAndModelIdAndExecutedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                         @Param("modelId") UUID modelId, 
                                                                         @Param("startDate") LocalDateTime startDate, 
                                                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.actualConfirmedAt BETWEEN :startDate AND :endDate")
    List<PredictionResult> findByTenantIdAndActualConfirmedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                     @Param("startDate") LocalDateTime startDate, 
                                                                     @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(p) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.actualResult IS NOT NULL")
    long countResultsWithActualData(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(p.processingTimeMs) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.status = :status")
    Double getAverageProcessingTimeByTenantId(@Param("tenantId") UUID tenantId, @Param("status") PredictionResult.Status status);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.predictionAccuracy < :minAccuracy")
    List<PredictionResult> findByTenantIdAndPredictionAccuracyLessThan(@Param("tenantId") UUID tenantId, @Param("minAccuracy") Double minAccuracy);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.errorMessage IS NOT NULL")
    List<PredictionResult> findFailedPredictions(@Param("tenantId") UUID tenantId);

    @Query("SELECT p FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.features LIKE %:feature%")
    List<PredictionResult> findByTenantIdAndFeaturesContaining(@Param("tenantId") UUID tenantId, @Param("feature") String feature);

    @Query("SELECT SUM(p.processingTimeMs) FROM PredictionResult p WHERE p.tenantId = :tenantId AND p.status = :status")
    Long getTotalProcessingTimeByTenantId(@Param("tenantId") UUID tenantId, @Param("status") PredictionResult.Status status);
}
