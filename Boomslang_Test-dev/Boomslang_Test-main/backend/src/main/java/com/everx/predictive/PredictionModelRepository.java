package com.everx.predictive.repository;

import com.everx.predictive.entity.PredictionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PredictionModelRepository extends JpaRepository<PredictionModel, UUID> {

    List<PredictionModel> findByTenantId(UUID tenantId);

    List<PredictionModel> findByTenantIdAndStatus(UUID tenantId, PredictionModel.Status status);

    List<PredictionModel> findByTenantIdAndModelType(UUID tenantId, PredictionModel.ModelType modelType);

    List<PredictionModel> findByTenantIdAndAlgorithm(UUID tenantId, PredictionModel.Algorithm algorithm);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.status = :status ORDER BY m.createdAt DESC")
    List<PredictionModel> findByTenantIdAndStatusOrderByCreatedAtDesc(@Param("tenantId") UUID tenantId, 
                                                                       @Param("status") PredictionModel.Status status);

    @Query("SELECT COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") UUID tenantId, @Param("status") PredictionModel.Status status);

    @Query("SELECT COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.accuracy >= :minAccuracy")
    List<PredictionModel> findByTenantIdAndAccuracyGreaterThanEqual(@Param("tenantId") UUID tenantId, 
                                                                    @Param("minAccuracy") Double minAccuracy);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.lastPredictionAt < :cutoffDate")
    List<PredictionModel> findUnusedModels(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.autoRetrainEnabled = true AND m.errorRate > m.retrainThreshold")
    List<PredictionModel> findModelsNeedingRetraining(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.modelType = :modelType AND m.status = :status")
    List<PredictionModel> findByTenantIdAndModelTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                                              @Param("modelType") PredictionModel.ModelType modelType, 
                                                              @Param("status") PredictionModel.Status status);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.targetVariable = :targetVariable")
    List<PredictionModel> findByTenantIdAndTargetVariable(@Param("tenantId") UUID tenantId, @Param("targetVariable") String targetVariable);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.createdBy = :createdBy")
    List<PredictionModel> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.trainedAt BETWEEN :startDate AND :endDate")
    List<PredictionModel> findByTenantIdAndTrainedAtBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.lastRetrainedAt < :cutoffDate")
    List<PredictionModel> findModelsNeedingScheduledRetraining(@Param("tenantId") UUID tenantId, @Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.predictionCount > :minPredictions ORDER BY m.predictionCount DESC")
    List<PredictionModel> findMostUsedModels(@Param("tenantId") UUID tenantId, @Param("minPredictions") Long minPredictions);

    @Query("SELECT COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.modelType = :modelType AND m.status = :status")
    long countByTenantIdAndModelTypeAndStatus(@Param("tenantId") UUID tenantId, 
                                              @Param("modelType") PredictionModel.ModelType modelType, 
                                              @Param("status") PredictionModel.Status status);

    @Query("SELECT AVG(m.accuracy) FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.status = :status")
    Double getAverageAccuracyByTenantId(@Param("tenantId") UUID tenantId, @Param("status") PredictionModel.Status status);

    @Query("SELECT m.modelType, COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId GROUP BY m.modelType")
    List<Object[]> getModelTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.algorithm, COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId GROUP BY m.algorithm")
    List<Object[]> getAlgorithmStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m.status, COUNT(m) FROM PredictionModel m WHERE m.tenantId = :tenantId GROUP BY m.status")
    List<Object[]> getStatusStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.name LIKE %:name%")
    List<PredictionModel> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.isActive = true AND m.status = :status")
    List<PredictionModel> findActiveModels(@Param("tenantId") UUID tenantId, @Param("status") PredictionModel.Status status);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.features LIKE %:feature%")
    List<PredictionModel> findByTenantIdAndFeaturesContaining(@Param("tenantId") UUID tenantId, @Param("feature") String feature);

    @Query("SELECT MAX(m.modelVersion) FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.name = :name")
    Integer findMaxVersionByName(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT SUM(m.predictionCount) FROM PredictionModel m WHERE m.tenantId = :tenantId")
    Long getTotalPredictionCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT m FROM PredictionModel m WHERE m.tenantId = :tenantId AND m.errorRate > :maxErrorRate")
    List<PredictionModel> findByTenantIdAndErrorRateGreaterThan(@Param("tenantId") UUID tenantId, @Param("maxErrorRate") Double maxErrorRate);
}
