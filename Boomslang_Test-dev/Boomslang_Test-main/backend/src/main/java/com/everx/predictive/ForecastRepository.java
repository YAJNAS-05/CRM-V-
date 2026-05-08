package com.everx.predictive.repository;

import com.everx.predictive.entity.Forecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ForecastRepository extends JpaRepository<Forecast, UUID> {

    List<Forecast> findByTenantId(UUID tenantId);

    List<Forecast> findByTenantIdAndModelId(UUID tenantId, UUID modelId);

    List<Forecast> findByTenantIdAndStatus(UUID tenantId, Forecast.Status status);

    List<Forecast> findByTenantIdAndForecastType(UUID tenantId, Forecast.ForecastType forecastType);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.validUntil > :now")
    List<Forecast> findByTenantIdAndValidUntilAfter(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.validUntil < :now")
    List<Forecast> findByTenantIdAndValidUntilBefore(@Param("tenantId") UUID tenantId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId AND f.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") Forecast.Status status);

    @Query("SELECT COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.generatedAt BETWEEN :startDate AND :endDate")
    List<Forecast> findByTenantIdAndGeneratedAtBetween(@Param("tenantId") UUID tenantId, 
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.isPublished = true")
    List<Forecast> findPublishedForecasts(@Param("tenantId") UUID tenantId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.actualDataAvailable = true")
    List<Forecast> findForecastsWithActualData(@Param("tenantId") UUID tenantId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.forecastType = :forecastType AND f.status = :status")
    List<Forecast> findByTenantIdAndForecastTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                                          @Param("forecastType") Forecast.ForecastType forecastType, 
                                                          @Param("status") Forecast.Status status);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.generatedBy = :generatedBy")
    List<Forecast> findByTenantIdAndGeneratedBy(@Param("tenantId") UUID tenantId, @Param("generatedBy") String generatedBy);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.timeHorizon >= :minHorizon")
    List<Forecast> findByTenantIdAndTimeHorizonGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minHorizon") Integer minHorizon);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.confidenceLevel >= :minConfidence")
    List<Forecast> findByTenantIdAndConfidenceLevelGreaterThanEqual(@Param("tenantId") UUID tenantId, @Param("minConfidence") Double minConfidence);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.name LIKE %:name%")
    List<Forecast> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId AND f.forecastType = :forecastType AND f.validUntil > :now")
    long countActiveForecastsByType(@Param("tenantId") UUID tenantId, 
                                   @Param("forecastType") Forecast.ForecastType forecastType, 
                                   @Param("now") LocalDateTime now);

    @Query("SELECT f.forecastType, COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId GROUP BY f.forecastType")
    List<Object[]> getForecastTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT f.status, COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId GROUP BY f.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(f.accuracyScore) FROM Forecast f WHERE f.tenantId = :tenantId AND f.actualDataAvailable = true")
    Double getAverageAccuracyByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.batchId = :batchId")
    List<Forecast> findByTenantIdAndBatchId(@Param("tenantId") UUID tenantId, @Param("batchId") String batchId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.correlationId = :correlationId")
    List<Forecast> findByTenantIdAndCorrelationId(@Param("tenantId") UUID tenantId, @Param("correlationId") String correlationId);

    @Query("SELECT COUNT(f) FROM Forecast f WHERE f.tenantId = :tenantId AND f.isPublished = true")
    long countPublishedForecasts(@Param("tenantId") UUID tenantId);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.publishedAt BETWEEN :startDate AND :endDate")
    List<Forecast> findByTenantIdAndPublishedAtBetween(@Param("tenantId") UUID tenantId, 
                                                        @Param("startDate") LocalDateTime startDate, 
                                                        @Param("endDate") LocalDateTime endDate);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.accuracyScore < :minAccuracy")
    List<Forecast> findByTenantIdAndAccuracyScoreLessThan(@Param("tenantId") UUID tenantId, @Param("minAccuracy") Double minAccuracy);

    @Query("SELECT SUM(f.timeHorizon) FROM Forecast f WHERE f.tenantId = :tenantId AND f.status = :status")
    Long getTotalForecastHorizon(@Param("tenantId") UUID tenantId, @Param("status") Forecast.Status status);

    @Query("SELECT f FROM Forecast f WHERE f.tenantId = :tenantId AND f.dataSource = :dataSource")
    List<Forecast> findByTenantIdAndDataSource(@Param("tenantId") UUID tenantId, @Param("dataSource") String dataSource);
}
