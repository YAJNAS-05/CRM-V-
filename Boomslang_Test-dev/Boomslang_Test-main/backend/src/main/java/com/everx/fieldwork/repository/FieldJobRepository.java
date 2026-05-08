package com.everx.fieldwork.repository;

import com.everx.fieldwork.entity.FieldJob;
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
public interface FieldJobRepository extends JpaRepository<FieldJob, UUID>, JpaSpecificationExecutor<FieldJob> {

    // Basic CRUD operations with custom queries
    Optional<FieldJob> findByJobNumber(String jobNumber);

    boolean existsByJobNumber(String jobNumber);

    List<FieldJob> findByAssignedTechnicianId(String technicianId);

    List<FieldJob> findByCustomerId(String customerId);

    // Status-based queries
    List<FieldJob> findByStatus(FieldJob.JobStatus status);

    List<FieldJob> findByStatusIn(List<FieldJob.JobStatus> statuses);

    @Query("SELECT f FROM FieldJob f WHERE f.status IN :statuses AND f.scheduledDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findByStatusAndDateRange(
            @Param("statuses") List<FieldJob.JobStatus> statuses,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Priority-based queries
    List<FieldJob> findByPriority(FieldJob.JobPriority priority);

    List<FieldJob> findByPriorityIn(List<FieldJob.JobPriority> priorities);

    // Date-based queries
    List<FieldJob> findByScheduledDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<FieldJob> findByScheduledDate(LocalDateTime date);

    List<FieldJob> findByEstimatedStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Location-based queries
    @Query("SELECT f FROM FieldJob f WHERE f.latitude BETWEEN :minLat AND :maxLat AND f.longitude BETWEEN :minLng AND :maxLng")
    List<FieldJob> findByLocationBounds(
            @Param("minLat") Double minLatitude,
            @Param("maxLat") Double maxLatitude,
            @Param("minLng") Double minLongitude,
            @Param("maxLng") Double maxLongitude
    );

    @Query("SELECT f FROM FieldJob f WHERE " +
           "(:latitude IS NULL OR :longitude IS NULL OR " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(f.latitude)) * " +
           "cos(radians(f.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
           "sin(radians(f.latitude)))) < :radius)")
    List<FieldJob> findByLocationWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radiusKm
    );

    // Category-based queries
    List<FieldJob> findByCategory(FieldJob.JobCategory category);

    List<FieldJob> findByCategoryIn(List<FieldJob.JobCategory> categories);

    // Technician availability queries
    @Query("SELECT f FROM FieldJob f WHERE f.assignedTechnicianId = :technicianId " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED', 'IN_PROGRESS') " +
           "AND f.scheduledDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findTechnicianJobsInDateRange(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Completion and performance queries
    @Query("SELECT f FROM FieldJob f WHERE f.assignedTechnicianId = :technicianId " +
           "AND f.status = 'COMPLETED' " +
           "AND f.actualEndDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findCompletedJobsByTechnicianInDateRange(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Overdue jobs
    @Query("SELECT f FROM FieldJob f WHERE f.status IN ('SCHEDULED', 'ASSIGNED') " +
           "AND f.estimatedEndDate < :currentDate")
    List<FieldJob> findOverdueJobs(@Param("currentDate") LocalDateTime currentDate);

    // Jobs requiring attention
    @Query("SELECT f FROM FieldJob f WHERE " +
           "(f.status = 'PENDING_PARTS' OR f.status = 'PENDING_CUSTOMER_APPROVAL') " +
           "OR (f.estimatedEndDate < :currentDate AND f.status NOT IN ('COMPLETED', 'CANCELLED'))")
    List<FieldJob> findJobsRequiringAttention(@Param("currentDate") LocalDateTime currentDate);

    // Customer-related queries
    @Query("SELECT f FROM FieldJob f WHERE " +
           "LOWER(f.customerName) LIKE %:searchTerm% " +
           "OR f.customerPhone LIKE %:searchTerm% " +
           "OR f.customerEmail LIKE %:searchTerm%")
    List<FieldJob> findByCustomerSearchTerm(@Param("searchTerm") String searchTerm);

    // Search queries
    @Query("SELECT f FROM FieldJob f WHERE " +
           "f.jobNumber LIKE %:searchTerm% " +
           "OR f.title LIKE %:searchTerm% " +
           "OR f.description LIKE %:searchTerm% " +
           "OR f.location LIKE %:searchTerm% " +
           "OR f.customerName LIKE %:searchTerm%")
    List<FieldJob> findBySearchTerm(@Param("searchTerm") String searchTerm);

    // Payment status queries
    List<FieldJob> findByPaymentStatus(FieldJob.PaymentStatus paymentStatus);

    @Query("SELECT f FROM FieldJob f WHERE f.paymentStatus IN ('PENDING', 'PARTIALLY_PAID', 'OVERDUE')")
    List<FieldJob> findUnpaidJobs();

    // Integration queries
    List<FieldJob> findByErpAssetId(String erpAssetId);

    List<FieldJob> findByErpWorkOrderId(String erpWorkOrderId);

    List<FieldJob> findByCrmLeadId(String crmLeadId);

    List<FieldJob> findByCrmAccountId(String crmAccountId);

    // Dashboard and statistics queries
    @Query("SELECT COUNT(f) FROM FieldJob f WHERE f.status = :status")
    long countByStatus(@Param("status") FieldJob.JobStatus status);

    @Query("SELECT COUNT(f) FROM FieldJob f WHERE f.assignedTechnicianId = :technicianId AND f.status = :status")
    long countByTechnicianAndStatus(
            @Param("technicianId") String technicianId,
            @Param("status") FieldJob.JobStatus status
    );

    @Query("SELECT f FROM FieldJob f WHERE f.createdBy = :userId " +
           "AND f.createdAt BETWEEN :startDate AND :endDate")
    List<FieldJob> findByCreatorAndDateRange(
            @Param("userId") String userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Complex queries for scheduling
    @Query("SELECT f FROM FieldJob f WHERE " +
           "f.assignedTechnicianId = :technicianId " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED') " +
           "AND f.scheduledDate BETWEEN :startDate AND :endDate " +
           "ORDER BY f.scheduledDate ASC")
    List<FieldJob> findTechnicianScheduledJobs(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Jobs by complexity and skill requirements
    List<FieldJob> findByComplexity(FieldJob.JobComplexity complexity);

    @Query("SELECT f FROM FieldJob f WHERE f.requiredTechnicianLevel <= :level " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED')")
    List<FieldJob> findJobsByTechnicianLevel(@Param("level") Integer level);

    // Weather-dependent jobs
    @Query("SELECT f FROM FieldJob f WHERE f.weatherDependent = true " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED') " +
           "AND f.scheduledDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findWeatherDependentJobs(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Jobs requiring special equipment
    @Query("SELECT f FROM FieldJob f WHERE f.requiresSpecialEquipment = true " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED')")
    List<FieldJob> findJobsRequiringSpecialEquipment();

    // Jobs with safety requirements
    @Query("SELECT f FROM FieldJob f WHERE f.safetyEquipmentRequired = true " +
           "AND f.status IN ('SCHEDULED', 'ASSIGNED')")
    List<FieldJob> findJobsWithSafetyRequirements();

    // Cancellation and reschedule queries
    @Query("SELECT f FROM FieldJob f WHERE f.cancelledDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findCancelledJobsInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT f FROM FieldJob f WHERE f.originalScheduledDate != f.scheduledDate " +
           "AND f.scheduledDate BETWEEN :startDate AND :endDate")
    List<FieldJob> findRescheduledJobsInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Performance metrics queries
    @Query("SELECT COUNT(f) FROM FieldJob f WHERE f.assignedTechnicianId = :technicianId " +
           "AND f.status = 'COMPLETED' " +
           "AND f.actualStartDate <= f.estimatedEndDate")
    long countOnTimeCompletedJobs(@Param("technicianId") String technicianId);

    @Query("SELECT AVG(f.actualDuration) FROM FieldJob f WHERE f.assignedTechnicianId = :technicianId " +
           "AND f.status = 'COMPLETED' AND f.actualDuration IS NOT NULL")
    Double getAverageJobDuration(@Param("technicianId") String technicianId);
}
