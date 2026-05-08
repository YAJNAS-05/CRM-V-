package com.everx.customersuccess.repository;

import com.everx.customersuccess.entity.IndustryTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface IndustryTemplateRepository extends JpaRepository<IndustryTemplate, UUID> {

    List<IndustryTemplate> findByTenantId(UUID tenantId);

    List<IndustryTemplate> findByTenantIdAndIndustry(UUID tenantId, IndustryTemplate.Industry industry);

    List<IndustryTemplate> findByTenantIdAndTemplateType(UUID tenantId, IndustryTemplate.TemplateType templateType);

    List<IndustryTemplate> findByTenantIdAndCompanySizeCategory(UUID tenantId, IndustryTemplate.CompanySizeCategory companySizeCategory);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isActive = true")
    List<IndustryTemplate> findActiveTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isPublic = true")
    List<IndustryTemplate> findPublicTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isDefault = true")
    List<IndustryTemplate> findDefaultTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.canBeUsed = true")
    List<IndustryTemplate> findUsableTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isPublished = true")
    List<IndustryTemplate> findPublishedTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isPopular = true")
    List<IndustryTemplate> findPopularTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isHighlyRated = true")
    List<IndustryTemplate> findHighlyRatedTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isComplex = true")
    List<IndustryTemplate> findComplexTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.isSimple = true")
    List<IndustryTemplate> findSimpleTemplates(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.industry = :industry")
    long countByTenantIdAndIndustry(@Param("tenantId") UUID tenantId, @Param("industry") IndustryTemplate.Industry industry);

    @Query("SELECT COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.templateType = :templateType")
    long countByTenantIdAndTemplateType(@Param("tenantId") UUID tenantId, @Param("templateType") IndustryTemplate.TemplateType templateType);

    @Query("SELECT AVG(t.rating) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.rating IS NOT NULL")
    Double getAverageRating(@Param("tenantId") UUID tenantId);

    @Query("SELECT AVG(t.estimatedSetupTimeHours) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.estimatedSetupTimeHours IS NOT NULL")
    Double getAverageSetupTime(@Param("tenantId") UUID tenantId);

    @Query("SELECT t.industry, COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId GROUP BY t.industry")
    List<Object[]> getIndustryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT t.templateType, COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId GROUP BY t.templateType")
    List<Object[]> getTemplateTypeStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT t.companySizeCategory, COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId GROUP BY t.companySizeCategory")
    List<Object[]> getCompanySizeCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT t.category, COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.category IS NOT NULL GROUP BY t.category")
    List<Object[]> getCategoryStats(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.createdBy = :createdBy")
    List<IndustryTemplate> findByTenantIdAndCreatedBy(@Param("tenantId") UUID tenantId, @Param("createdBy") String createdBy);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :startDate AND :endDate")
    List<IndustryTemplate> findByTenantIdAndCreatedAtBetween(@Param("tenantId") UUID tenantId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.lastUsedAt BETWEEN :startDate AND :endDate")
    List<IndustryTemplate> findByTenantIdAndLastUsedAtBetween(@Param("tenantId") UUID tenantId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.usageCount >= :minUsage ORDER BY t.usageCount DESC")
    List<IndustryTemplate> findByTenantIdAndUsageCountGreaterThanEqualOrderByUsageCountDesc(@Param("tenantId") UUID tenantId, 
                                                                                             @Param("minUsage") Long minUsage);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.rating >= :minRating ORDER BY t.rating DESC")
    List<IndustryTemplate> findByTenantIdAndRatingGreaterThanEqualOrderByRatingDesc(@Param("tenantId") UUID tenantId, 
                                                                                   @Param("minRating") Double minRating);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.estimatedSetupTimeHours <= :maxHours ORDER BY t.estimatedSetupTimeHours")
    List<IndustryTemplate> findByTenantIdAndEstimatedSetupTimeHoursLessThanEqualOrderByEstimatedSetupTimeHours(@Param("tenantId") UUID tenantId, 
                                                                                                               @Param("maxHours") Integer maxHours);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.complexityLevel = :complexityLevel")
    List<IndustryTemplate> findByTenantIdAndComplexityLevel(@Param("tenantId") UUID tenantId, @Param("complexityLevel") String complexityLevel);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.name LIKE %:name%")
    List<IndustryTemplate> findByTenantIdAndNameContaining(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.tags LIKE %:tag%")
    List<IndustryTemplate> findByTenantIdAndTagContaining(@Param("tenantId") UUID tenantId, @Param("tag") String tag);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.language = :language")
    List<IndustryTemplate> findByTenantIdAndLanguage(@Param("tenantId") UUID tenantId, @Param("language") String language);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.region = :region")
    List<IndustryTemplate> findByTenantIdAndRegion(@Param("tenantId") UUID tenantId, @Param("region") String region);

    @Query("SELECT COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.industry = :industry AND t.templateType = :templateType")
    long countByTenantIdAndIndustryAndTemplateType(@Param("tenantId") UUID tenantId, 
                                                   @Param("industry") IndustryTemplate.Industry industry, 
                                                   @Param("templateType") IndustryTemplate.TemplateType templateType);

    @Query("SELECT SUM(t.getEnabledFeaturesCount()) FROM IndustryTemplate t WHERE t.tenantId = :tenantId")
    Long getTotalEnabledFeaturesCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(t.getTotalFeaturesCount()) FROM IndustryTemplate t WHERE t.tenantId = :tenantId")
    Long getTotalFeaturesCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT SUM(t.getRequiredIntegrationsCount()) FROM IndustryTemplate t WHERE t.tenantId = :tenantId")
    Long getTotalRequiredIntegrationsCount(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.hasComplianceRequirements = true")
    long countByTenantIdAndHasComplianceRequirements(@Param("tenantId") UUID tenantId);

    @Query("SELECT COUNT(t) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.hasTrainingMaterials = true")
    long countByTenantIdAndHasTrainingMaterials(@Param("tenantId") UUID tenantId);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.version = :version")
    List<IndustryTemplate> findByTenantIdAndVersion(@Param("tenantId") UUID tenantId, @Param("version") String version);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.publishedBy = :publishedBy")
    List<IndustryTemplate> findByTenantIdAndPublishedBy(@Param("tenantId") UUID tenantId, @Param("publishedBy") String publishedBy);

    @Query("SELECT MAX(t.version) FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.name = :name")
    String getLatestVersionByName(@Param("tenantId") UUID tenantId, @Param("name") String name);

    @Query("SELECT t FROM IndustryTemplate t WHERE t.tenantId = :tenantId AND t.prerequisites LIKE %:prerequisite%")
    List<IndustryTemplate> findByTenantIdAndPrerequisitesContaining(@Param("tenantId") UUID tenantId, @Param("prerequisite") String prerequisite);
}
