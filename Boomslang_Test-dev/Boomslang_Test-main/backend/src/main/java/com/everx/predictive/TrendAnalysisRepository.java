package com.everx.predictive.repository;

import com.everx.predictive.entity.TrendAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrendAnalysisRepository extends JpaRepository<TrendAnalysis, UUID> {

    List<TrendAnalysis> findByTenantId(UUID tenantId);

    List<TrendAnalysis> findByTenantIdAndStatus(UUID tenantId, TrendAnalysis.Status status);

    List<TrendAnalysis> findByTenantIdAndDataType(UUID tenantId, TrendAnalysis.DataType dataType);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.status = :status ORDER BY t.createdAt DESC")
    List<TrendAnalysis> findByTenantIdAndStatusOrderByCreatedAtDesc(@Param("tenantId") UUID tenantId, 
                                                                     @Param("status") TrendAnalysis.Status status);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") TrendAnalysis.Status status);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.hasAnomalies = true")
    List<TrendAnalysis> findAnalysesWithAnomalies(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.seasonalityDetected = true")
    List<TrendAnalysis> findAnalysesWithSeasonality(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.confidenceLevel >= :minConfidence")
    List<TrendAnalysis> findByTenantIdAndConfidenceLevelGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minConfidence") Double minConfidence);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.statisticalSignificance >= :minSignificance")
    List<TrendAnalysis> findByTenantIdAndStatisticalSignificanceGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minSignificance") Double minSignificance);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.createdBy = :createdBy")
    List<TrendAnalysis> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<TrendAnalysis> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                          @Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.completedAt BETWEEN :startDate AND :endDate")
    List<TrendAnalysis> findByTenantIdAndCompletedAtBetween(@Param("tenantId") UUID tenantId, 
                                                            @Param("startDate") LocalDateTime startDate, 
                                                            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.dataSource = :dataSource")
    List<TrendAnalysis> findByTenantIdAndDataSource(@Param("tenantId") UUID tenantId, @Param("dataSource") String dataSource);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.granularity = :granularity")
    List<TrendAnalysis> findByTenantIdAndGranularity(@Param("tenantId") UUID tenantId, @Param("granularity") String granularity);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.name LIKE %:name%")
    List<TrendAnalysis> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.hasForecast = true")
    List<TrendAnalysis> findAnalysesWithForecast(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.forecastHorizon >= :minHorizon")
    List<TrendAnalysis> findByTenantIdAndForecastHorizonGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minHorizon") Integer minHorizon);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.dataType = :dataType AND t.status = :status")
    long countByTenantIdAndDataTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                            @Param("dataType") TrendAnalysis.DataType dataType, 
                                            @Param("status") TrendAnalysis.Status status);

    @Query("SELECT t.dataType, COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId GROUP BY t.dataType")
    List<Object[]> getDataTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT t.status, COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId GROUP BY t.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(t.confidenceLevel) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.status = :status")
    Double getAverageConfidenceLevelByTenantId(@Param("tenantId") UUID tenantId, @Param("status") TrendAnalysis.Status status);

    @Query("SELECT AVG(t.statisticalSignificance) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.status = :status")
    Double getAverageStatisticalSignificanceByTenantId(@Param("tenantId") UUID tenantId, @Param("status") TrendAnalysis.Status status);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.hasAnomalies = true")
    long countAnalysesWithAnomalies(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.seasonalityDetected = true")
    long countAnalysesWithSeasonality(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(t) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.hasForecast = true")
    long countAnalysesWithForecast(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.timeRange = :timeRange")
    List<TrendAnalysis> findByTenantIdAndTimeRange(@Param("tenantId") UUID tenantId, @Param("timeRange") String timeRange);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.anomalyCount > :maxAnomalies")
    List<TrendAnalysis> findByTenantIdAndAnomalyCountGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxAnomalies") Integer maxAnomalies);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.correlationAnalysis IS NOT NULL")
    List<TrendAnalysis> findAnalysesWithCorrelation(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.batchId = :batchId")
    List<TrendAnalysis> findByTenantIdAndBatchId(@Param("tenantId") UUID tenantId, @Param("batchId") String batchId);

    @Query("SELECT t FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.correlationId = :correlationId")
    List<TrendAnalysis> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT SUM(t.anomalyCount) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.status = :status")
    Long getTotalAnomalyCount(@Param("tenantId") UUID tenantId, @Param("status") TrendAnalysis.Status status);

    @Query("SELECT AVG(t.forecastHorizon) FROM TrendAnalysis t WHERE t.tenantId = :tenantId AND t.hasForecast = true")
    Double getAverageForecastHorizon(@Param("tenantId") UUID tenantId);
}
