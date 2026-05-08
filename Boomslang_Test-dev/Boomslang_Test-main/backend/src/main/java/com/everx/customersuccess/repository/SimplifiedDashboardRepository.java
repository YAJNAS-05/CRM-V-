package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.SimplifiedDashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SimplifiedDashboardRepository extends JpaRepository<SimplifiedDashboard, UUID> {

    List<SimplifiedDashboard> findByTenantId(UUID tenantId);

    List<SimplifiedDashboard> findByTenantIdAndDashboardType(UUID tenantId, SimplifiedDashboard.DashboardType dashboardType);

    List<SimplifiedDashboard> findByTenantIdAndCategory(UUID tenantId, SimplifiedDashboard.Category category);

    List<SimplifiedDashboard> findByTenantIdAndTargetAudience(UUID tenantId, SimplifiedDashboard.TargetAudience targetAudience);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isActive = true")
    List<SimplifiedDashboard> findActiveDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isPublic = true")
    List<SimplifiedDashboard> findPublicDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isDefault = true")
    List<SimplifiedDashboard> findDefaultDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.canBeViewed = true")
    List<SimplifiedDashboard> findViewableDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isPublished = true")
    List<SimplifiedDashboard> findPublishedDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isPopular = true")
    List<SimplifiedDashboard> findPopularDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isHighlyRated = true")
    List<SimplifiedDashboard> findHighlyRatedDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isExecutiveDashboard = true")
    List<SimplifiedDashboard> findExecutiveDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.isOperationalDashboard = true")
    List<SimplifiedDashboard> findOperationalDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.dashboardType = :dashboardType")
    long countByTenantIdAndDashboardType(@Param("tenantId") UUID tenantId, @Param("dashboardType") SimplifiedDashboard.DashboardType dashboardType);

    @Query("SELECT COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.category = :category")
    long countByTenantIdAndCategory(@Param("tenantId") UUID tenantId, @Param("category") SimplifiedDashboard.Category category);

    @Query("SELECT AVG(d.rating) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.rating IS NOT NULL")
    Double getAverageRating(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(d.refreshIntervalMinutes) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.refreshIntervalMinutes IS NOT NULL")
    Double getAverageRefreshInterval(@Param("tenantId") UUID tenantId);

    @Query("SELECT d.dashboardType, COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId GROUP BY d.dashboardType")
    List<Object[]> getDashboardTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT d.category, COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId GROUP BY d.category")
    List<Object[]> getCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT d.targetAudience, COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId GROUP BY d.targetAudience")
    List<Object[]> getTargetAudienceStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT d.layoutType, COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.layoutType IS NOT NULL GROUP BY d.layoutType")
    List<Object[]> getLayoutTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.createdBy = :createdBy")
    List<SimplifiedDashboard> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.createdAt BETWEEN :startDate AND :endDate")
    List<SimplifiedDashboard> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                               @Param("startDate") LocalDateTime startDate, 
                                                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.lastViewedAt BETWEEN :startDate AND :endDate")
    List<SimplifiedDashboard> findByTenantIdAndLastViewedAtBetween(@Param("tenantId") UUID tenantId, 
                                                                  @Param("startDate") LocalDateTime startDate, 
                                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.viewCount >= :minViews ORDER BY d.viewCount DESC")
    List<SimplifiedDashboard> findByTenantIdAndViewCountGreaterThanEqualOrderByViewCountDesc(@Param("tenantId") UUID tenantId, 
                                                                                             @Param("minViews") Long minViews);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.rating >= :minRating ORDER BY d.rating DESC")
    List<SimplifiedDashboard> findByTenantIdAndRatingGreaterThanEqualOrderByRatingDesc(@Param("tenantId") UUID tenantId, 
                                                                                   @Param("minRating") Double minRating);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.favoriteCount >= :minFavorites ORDER BY d.favoriteCount DESC")
    List<SimplifiedDashboard> findByTenantIdAndFavoriteCountGreaterThanEqualOrderByFavoriteCountDesc(@Param("tenantId") UUID tenantId, 
                                                                                                     @Param("minFavorites") Long minFavorites);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.layoutType = :layoutType")
    List<SimplifiedDashboard> findByTenantIdAndLayoutType(@Param("tenantId") UUID tenantId, @Param("layoutType") String layoutType);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.autoRefresh = true")
    List<SimplifiedDashboard> findAutoRefreshDashboards(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.refreshIntervalMinutes <= :maxMinutes ORDER BY d.refreshIntervalMinutes")
    List<SimplifiedDashboard> findByTenantIdAndRefreshIntervalMinutesLessThanEqualOrderByRefreshIntervalMinutes(@Param("tenantId") UUID tenantId, 
                                                                                                               @Param("maxMinutes") Integer maxMinutes);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.name LIKE %:name%")
    List<SimplifiedDashboard> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.tags LIKE %:tag%")
    List<SimplifiedDashboard> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.industry = :industry")
    List<SimplifiedDashboard> findByTenantIdAndIndustry(@Param("tenantId") UUID tenantId, @Param("industry") String industry);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.language = :language")
    List<SimplifiedDashboard> findByTenantIdAndLanguage(@Param("tenantId") UUID tenantId, @Param("language") String language);

    @Query("SELECT COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.dashboardType = :dashboardType AND d.category = :category")
    long countByTenantIdAndDashboardTypeAndCategory(@Param("tenantId") UUID tenantId, 
                                                    @Param("dashboardType") SimplifiedDashboard.DashboardType dashboardType, 
                                                    @Param("category") SimplifiedDashboard.Category category);

    @Query("SELECT SUM(d.getVisibleWidgetsCount()) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId")
    Long getTotalVisibleWidgetsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(d.getTotalWidgetsCount()) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId")
    Long getTotalWidgetsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(d.getActiveDataSourcesCount()) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId")
    Long getTotalActiveDataSourcesCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.hasRealTimeData = true")
    long countByTenantIdAndHasRealTimeData(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(d) FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.hasSubscriptions = true")
    long countByTenantIdAndHasSubscriptions(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.publishedBy = :publishedBy")
    List<SimplifiedDashboard> findByTenantIdAndPublishedBy(@Param("tenantId") UUID tenantId, @Param("publishedBy") String publishedBy);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.description LIKE %:keyword%")
    List<SimplifiedDashboard> findByTenantIdAndDescriptionContaining(@Param("tenantId") UUID tenantId, @Param("keyword") String keyword);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.targetAudience = :targetAudience AND d.category = :category")
    List<SimplifiedDashboard> findByTenantIdAndTargetAudienceAndCategory(@Param("tenantId") UUID tenantId, 
                                                                         @Param("targetAudience") SimplifiedDashboard.TargetAudience targetAudience, 
                                                                         @Param("category") SimplifiedDashboard.Category category);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId ORDER BY d.viewCount DESC")
    List<SimplifiedDashboard> findByTenantIdOrderByViewCountDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId ORDER BY d.rating DESC")
    List<SimplifiedDashboard> findByTenantIdOrderByRatingDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId ORDER BY d.lastViewedAt DESC")
    List<SimplifiedDashboard> findByTenantIdOrderByLastViewedAtDesc(@Param("tenantId") UUID tenantId);

    @Query("SELECT d FROM SimplifiedDashboard d WHERE d.tenantId = :tenantId AND d.favoriteCount > :threshold ORDER BY d.favoriteCount DESC")
    List<SimplifiedDashboard> findByTenantIdAndFavoriteCountGreaterThanOrderByFavoriteCountDesc(@Param("tenantId") UUID tenantId, 
                                                                                               @Param("threshold") Long threshold);
}
