package com.everx.fieldwork.repository;

import com.everx.fieldwork.entity.FieldWorkAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FieldWorkAssetRepository extends JpaRepository<FieldWorkAsset, UUID>, JpaSpecificationExecutor<FieldWorkAsset> {

    // Basic CRUD operations with custom queries
    List<FieldWorkAsset> findByFieldJobId(String fieldJobId);

    Optional<FieldWorkAsset> findByAssetTag(String assetTag);

    boolean existsByAssetTag(String assetTag);

    // Status and condition queries
    List<FieldWorkAsset> findByStatus(FieldWorkAsset.AssetStatus status);

    List<FieldWorkAsset> findByStatusIn(List<FieldWorkAsset.AssetStatus> statuses);

    List<FieldWorkAsset> findByCondition(FieldWorkAsset.AssetCondition condition);

    List<FieldWorkAsset> findByConditionIn(List<FieldWorkAsset.AssetCondition> conditions);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.status = 'AVAILABLE' AND a.condition IN ('EXCELLENT', 'GOOD')")
    List<FieldWorkAsset> findAvailableGoodCondition();

    // Category and type queries
    List<FieldWorkAsset> findByAssetCategory(String assetCategory);

    List<FieldWorkAsset> findByAssetType(String assetType);

    List<FieldWorkAsset> findByAssetCategoryAndAssetType(String category, String type);

    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "LOWER(a.assetName) LIKE %:searchTerm% OR " +
           "LOWER(a.assetDescription) LIKE %:searchTerm% OR " +
           "a.assetTag LIKE %:searchTerm% OR " +
           "LOWER(a.manufacturer) LIKE %:searchTerm% OR " +
           "LOWER(a.model) LIKE %:searchTerm%")
    List<FieldWorkAsset> findBySearchTerm(@Param("searchTerm") String searchTerm);

    // ERP integration queries
    Optional<FieldWorkAsset> findByErpItemId(String erpItemId);

    Optional<FieldWorkAsset> findByErpAssetId(String erpAssetId);

    List<FieldWorkAsset> findByErpLocationId(String erpLocationId);

    List<FieldWorkAsset> findByErpWarehouseId(String erpWarehouseId);

    // Location-based queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "a.currentLatitude BETWEEN :minLat AND :maxLat " +
           "AND a.currentLongitude BETWEEN :minLng AND :maxLng")
    List<FieldWorkAsset> findByLocationBounds(
            @Param("minLat") Double minLatitude,
            @Param("maxLat") Double maxLatitude,
            @Param("minLng") Double minLongitude,
            @Param("maxLng") Double maxLongitude
    );

    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "(:latitude IS NULL OR :longitude IS NULL OR " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(a.currentLatitude)) * " +
           "cos(radians(a.currentLongitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
           "sin(radians(a.currentLatitude)))) < :radius)")
    List<FieldWorkAsset> findByLocationWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radiusKm
    );

    // Usage and availability queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.status = 'IN_USE' " +
           "AND a.fieldJobId = :fieldJobId")
    List<FieldWorkAsset> findInUseByJob(@Param("fieldJobId") String fieldJobId);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.isReturnable = true " +
           "AND a.expectedReturnDate < :currentDate " +
           "AND a.status = 'IN_USE'")
    List<FieldWorkAsset> findOverdueAssets(@Param("currentDate") LocalDateTime currentDate);

    // Maintenance and warranty queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.nextMaintenanceDate <= :currentDate " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findMaintenanceDue(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.warrantyExpiryDate BETWEEN :startDate AND :endDate " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findWarrantyExpiringSoon(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Safety and compliance queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.requiresSafetyTraining = true " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findAssetsRequiringSafetyTraining();

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.safetyInspectionRequired = true " +
           "AND (a.lastSafetyInspection IS NULL OR a.lastSafetyInspection < :inspectionDueDate)")
    List<FieldWorkAsset> findSafetyInspectionDue(@Param("inspectionDueDate") LocalDateTime inspectionDueDate);

    // Damage and loss tracking
    List<FieldWorkAsset> findByIsDamaged(boolean isDamaged);

    List<FieldWorkAsset> findByIsLost(boolean isLost);

    @Query("SELECT a FROM FieldWorkAsset a WHERE (a.isDamaged = true OR a.isLost = true) " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findProblematicAssets();

    // Consumable and returnable queries
    List<FieldWorkAsset> findByIsConsumable(boolean isConsumable);

    List<FieldWorkAsset> findByIsReturnable(boolean isReturnable);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.isConsumable = false " +
           "AND a.status = 'AVAILABLE' " +
           "AND a.condition IN ('EXCELLENT', 'GOOD')")
    List<FieldWorkAsset> findAvailableReusableAssets();

    // Classification and criticality queries
    List<FieldWorkAsset> findByClassification(FieldWorkAsset.AssetClassification classification);

    List<FieldWorkAsset> findByCriticality(FieldWorkAsset.AssetCriticality criticality);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.criticality IN ('CRITICAL', 'ESSENTIAL') " +
           "AND a.status = 'AVAILABLE'")
    List<FieldWorkAsset> findCriticalAvailableAssets();

    // Financial queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.unitCost BETWEEN :minCost AND :maxCost")
    List<FieldWorkAsset> findByCostRange(
            @Param("minCost") Double minCost,
            @Param("maxCost") Double maxCost
    );

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.purchaseDate BETWEEN :startDate AND :endDate")
    List<FieldWorkAsset> findByPurchaseDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Supplier and manufacturer queries
    List<FieldWorkAsset> findBySupplier(String supplier);

    List<FieldWorkAsset> findByManufacturer(String manufacturer);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.manufacturer = :manufacturer " +
           "AND a.model = :model")
    List<FieldWorkAsset> findByManufacturerAndModel(
            @Param("manufacturer") String manufacturer,
            @Param("model") String model
    );

    // Inventory integration queries
    Optional<FieldWorkAsset> findByInventoryItemId(String inventoryItemId);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.inventoryItemId IS NOT NULL " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findIntegratedAssets();

    // Usage tracking queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.usageCount >= :minUsage " +
           "ORDER BY a.usageCount DESC")
    List<FieldWorkAsset> findMostUsed(@Param("minUsage") Integer minUsage, Pageable pageable);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.lastUsedDate >= :since")
    List<FieldWorkAsset> findRecentlyUsed(@Param("since") LocalDateTime since);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.lastUsedDate IS NULL " +
           "AND a.status = 'AVAILABLE'")
    List<FieldWorkAsset> findUnusedAssets();

    // Weight and dimension queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.weight <= :maxWeight " +
           "AND a.status = 'AVAILABLE'")
    List<FieldWorkAsset> findByMaxWeight(@Param("maxWeight") Double maxWeight);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.volume <= :maxVolume " +
           "AND a.status = 'AVAILABLE'")
    List<FieldWorkAsset> findByMaxVolume(@Param("maxVolume") Double maxVolume);

    // Dashboard and statistics queries
    @Query("SELECT COUNT(a) FROM FieldWorkAsset a WHERE a.status = :status")
    long countByStatus(@Param("status") FieldWorkAsset.AssetStatus status);

    @Query("SELECT COUNT(a) FROM FieldWorkAsset a WHERE a.condition = :condition")
    long countByCondition(@Param("condition") FieldWorkAsset.AssetCondition condition);

    @Query("SELECT COUNT(a) FROM FieldWorkAsset a WHERE a.assetCategory = :category " +
           "AND a.status = 'AVAILABLE'")
    long countAvailableByCategory(@Param("category") String category);

    @Query("SELECT SUM(a.totalCost) FROM FieldWorkAsset a WHERE a.status NOT IN ('RETIRED', 'DISPOSED')")
    Double getTotalAssetValue();

    @Query("SELECT SUM(a.totalCost) FROM FieldWorkAsset a WHERE a.status = 'IN_USE'")
    Double getValueInUse();

    // Asset lifecycle queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.purchaseDate >= :since " +
           "ORDER BY a.purchaseDate DESC")
    List<FieldWorkAsset> findRecentlyPurchased(@Param("since") LocalDateTime since);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.firstUsedDate >= :since")
    List<FieldWorkAsset> findFirstUsedSince(@Param("since") LocalDateTime since);

    // Replacement and upgrade queries
    List<FieldWorkAsset> findByReplacementAssetId(String replacementAssetId);

    List<FieldWorkAsset> findByReplacedAssetId(String replacedAssetId);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.isReplacement = true")
    List<FieldWorkAsset> findReplacementAssets();

    // Quality control queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.condition IN ('POOR', 'UNSERVICEABLE') " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findPoorConditionAssets();

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.lastInspectionDate < :inspectionCutoff " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED')")
    List<FieldWorkAsset> findOverdueInspection(@Param("inspectionCutoff") LocalDateTime inspectionCutoff);

    // Location tracking queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.currentLocation LIKE %:location%")
    List<FieldWorkAsset> findByCurrentLocation(@Param("location") String location);

    @Query("SELECT a FROM FieldWorkAsset a WHERE a.locationUpdatedDate < :cutoff " +
           "AND a.status = 'AVAILABLE'")
    List<FieldWorkAsset> findStaleLocation(@Param("cutoff") LocalDateTime cutoff);

    // Barcode and identification queries
    Optional<FieldWorkAsset> findByBarcode(String barcode);

    Optional<FieldWorkAsset> findByQrCode(String qrCode);

    Optional<FieldWorkAsset> findByRfidTag(String rfidTag);

    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "a.barcode IS NOT NULL OR a.qrCode IS NOT NULL OR a.rfidTag IS NOT NULL")
    List<FieldWorkAsset> findAssetsWithIdentification();

    // Document and photo queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "(a.photoUrls IS NOT NULL OR a.documentUrls IS NOT NULL OR a.specificationUrls IS NOT NULL)")
    List<FieldWorkAsset> findAssetsWithDocuments();

    // Advanced search queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE " +
           "(:status IS NULL OR a.status = :status) " +
           "AND (:category IS NULL OR a.assetCategory = :category) " +
           "AND (:condition IS NULL OR a.condition = :condition) " +
           "AND (:manufacturer IS NULL OR LOWER(a.manufacturer) LIKE %:manufacturer%) " +
           "ORDER BY a.assetName")
    List<FieldWorkAsset> findByAdvancedFilters(
            @Param("status") FieldWorkAsset.AssetStatus status,
            @Param("category") String category,
            @Param("condition") FieldWorkAsset.AssetCondition condition,
            @Param("manufacturer") String manufacturer
    );

    // Asset utilization queries
    @Query("SELECT a FROM FieldWorkAsset a WHERE a.usageCount > 0 " +
           "AND a.status NOT IN ('RETIRED', 'DISPOSED') " +
           "ORDER BY (a.usageCount * 1.0 / " +
           "(SELECT COUNT(*) FROM FieldWorkAsset a2 WHERE a2.assetCategory = a.assetCategory " +
           "AND a2.status NOT IN ('RETIRED', 'DISPOSED'))) DESC")
    List<FieldWorkAsset> findMostUtilizedByCategory(Pageable pageable);

    // Cost analysis queries
    @Query("SELECT a.assetCategory, COUNT(a), SUM(a.totalCost) FROM FieldWorkAsset a " +
           "WHERE a.status NOT IN ('RETIRED', 'DISPOSED') " +
           "GROUP BY a.assetCategory")
    List<Object[]> getAssetSummaryByCategory();

    @Query("SELECT a.manufacturer, COUNT(a), SUM(a.totalCost) FROM FieldWorkAsset a " +
           "WHERE a.status NOT IN ('RETIRED', 'DISPOSED') " +
           "GROUP BY a.manufacturer")
    List<Object[]> getAssetSummaryByManufacturer();
}
