package com.everx.fieldwork.repository;

import com.everx.fieldwork.entity.Technician;
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
public interface TechnicianRepository extends JpaRepository<Technician, UUID>, JpaSpecificationExecutor<Technician> {

    // Basic CRUD operations with custom queries
    Optional<Technician> findByEmployeeId(String employeeId);

    Optional<Technician> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    // Status-based queries
    List<Technician> findByStatus(Technician.TechnicianStatus status);

    List<Technician> findByStatusIn(List<Technician.TechnicianStatus> statuses);

    @Query("SELECT t FROM Technician t WHERE t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findAvailableTechnicians();

    // Level and skill-based queries
    List<Technician> findByLevel(Technician.TechnicianLevel level);

    @Query("SELECT t FROM Technician t WHERE t.level.level >= :minLevel " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByMinimumLevel(@Param("minLevel") Integer minLevel);

    @Query("SELECT t FROM Technician t WHERE " +
           "(LOWER(t.skills) LIKE %:skill% OR " +
           "LOWER(t.specializations) LIKE %:skill% OR " +
           "LOWER(t.technicalSkills) LIKE %:skill%) " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findBySkill(@Param("skill") String skill);

    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND (:requiredSkills IS NULL OR " +
           "(LOWER(t.skills) LIKE %:requiredSkills% OR " +
           "LOWER(t.specializations) LIKE %:requiredSkills% OR " +
           "LOWER(t.technicalSkills) LIKE %:requiredSkills%))")
    List<Technician> findAvailableBySkills(@Param("requiredSkills") String requiredSkills);

    // Location-based queries
    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND (:latitude IS NULL OR :longitude IS NULL OR " +
           "(6371 * acos(cos(radians(:latitude)) * cos(radians(t.homeLatitude)) * " +
           "cos(radians(t.homeLongitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
           "sin(radians(t.homeLatitude)))) < :radius)")
    List<Technician> findByLocationWithinRadius(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radiusKm
    );

    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND t.workingRegion = :region")
    List<Technician> findByWorkingRegion(@Param("region") String region);

    // Availability queries
    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND t.hasValidDriversLicense = true " +
           "AND t.hasVehicle = true")
    List<Technician> findTechniciansWithVehicle();

    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND t.licenseExpiryDate > :currentDate")
    List<Technician> findTechniciansWithValidLicense(@Param("currentDate") LocalDateTime currentDate);

    // Search queries
    @Query("SELECT t FROM Technician t WHERE " +
           "LOWER(t.firstName) LIKE %:searchTerm% OR " +
           "LOWER(t.lastName) LIKE %:searchTerm% OR " +
           "LOWER(t.email) LIKE %:searchTerm% OR " +
           "t.phone LIKE %:searchTerm% OR " +
           "t.mobilePhone LIKE %:searchTerm%")
    List<Technician> findBySearchTerm(@Param("searchTerm") String searchTerm);

    @Query("SELECT t FROM Technician t WHERE " +
           "CONCAT(t.firstName, ' ', t.lastName) LIKE %:name%")
    List<Technician> findByName(@Param("name") String name);

    // Performance-based queries
    @Query("SELECT t FROM Technician t WHERE t.averageRating >= :minRating " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByMinimumRating(@Param("minRating") Double minRating);

    @Query("SELECT t FROM Technician t WHERE t.onTimeCompletionRate >= :minRate " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByMinimumOnTimeRate(@Param("minRate") Integer minRate);

    @Query("SELECT t FROM Technician t WHERE t.customerSatisfactionScore >= :minScore " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByMinimumSatisfactionScore(@Param("minScore") Integer minScore);

    // Workload queries
    @Query("SELECT t FROM Technician t WHERE t.jobsInProgress < :maxJobs " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByAvailableCapacity(@Param("maxJobs") Integer maxJobs);

    // Certification and training queries
    @Query("SELECT t FROM Technician t WHERE " +
           "(LOWER(t.certifications) LIKE %:certification% OR " +
           "LOWER(t.trainingRecords) LIKE %:certification%) " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByCertification(@Param("certification") String certification);

    @Query("SELECT t FROM Technician t WHERE t.medicalClearanceValid = true " +
           "AND t.medicalClearanceExpiry > :currentDate " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findTechniciansWithValidMedicalClearance(@Param("currentDate") LocalDateTime currentDate);

    // Equipment and vehicle queries
    @Query("SELECT t FROM Technician t WHERE " +
           "t.hasVehicle = true AND t.vehicleInfo IS NOT NULL " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findTechniciansWithVehicleInfo();

    @Query("SELECT t FROM Technician t WHERE " +
           "LOWER(t.assignedEquipment) LIKE %:equipment% OR " +
           "LOWER(t.assignedTools) LIKE %:equipment% " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findByEquipment(@Param("equipment") String equipment);

    // Integration queries
    Optional<Technician> findByHrEmployeeId(String hrEmployeeId);

    Optional<Technician> findByPayrollId(String payrollId);

    Optional<Technician> findByBadgeNumber(String badgeNumber);

    // GPS tracking queries
    @Query("SELECT t FROM Technician t WHERE t.gpsTrackingEnabled = true " +
           "AND t.locationSharingEnabled = true " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findTechniciansWithGpsTracking();

    @Query("SELECT t FROM Technician t WHERE t.lastLocationUpdate > :since " +
           "AND t.gpsTrackingEnabled = true " +
           "AND t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    List<Technician> findRecentlyActiveTechnicians(@Param("since") LocalDateTime since);

    // Dashboard and statistics queries
    @Query("SELECT COUNT(t) FROM Technician t WHERE t.status = :status")
    long countByStatus(@Param("status") Technician.TechnicianStatus status);

    @Query("SELECT COUNT(t) FROM Technician t WHERE t.status = 'ACTIVE' AND t.availableForFieldWork = true")
    long countAvailableTechnicians();

    @Query("SELECT COUNT(t) FROM Technician t WHERE t.level = :level AND t.status = 'ACTIVE'")
    long countByLevel(@Param("level") Technician.TechnicianLevel level);

    // Performance aggregation queries
    @Query("SELECT AVG(t.averageRating) FROM Technician t WHERE t.status = 'ACTIVE' AND t.totalRatings > 0")
    Double getAverageRating();

    @Query("SELECT AVG(t.onTimeCompletionRate) FROM Technician t WHERE t.status = 'ACTIVE' AND t.jobsCompleted > 0")
    Double getAverageOnTimeCompletionRate();

    @Query("SELECT AVG(t.customerSatisfactionScore) FROM Technician t WHERE t.status = 'ACTIVE' AND t.jobsCompleted > 0")
    Double getAverageCustomerSatisfactionScore();

    @Query("SELECT SUM(t.jobsCompleted) FROM Technician t WHERE t.status = 'ACTIVE'")
    Long getTotalJobsCompleted();

    @Query("SELECT SUM(t.totalEarnings) FROM Technician t WHERE t.status = 'ACTIVE'")
    Double getTotalEarnings();

    // Complex availability queries
    @Query("SELECT t FROM Technician t WHERE " +
           "t.status = 'ACTIVE' AND t.availableForFieldWork = true " +
           "AND (:startTime IS NULL OR t.workStartTime <= :startTime) " +
           "AND (:endTime IS NULL OR t.workEndTime >= :endTime) " +
           "AND (:weekendRequired IS NULL OR t.availableWeekends = :weekendRequired)")
    List<Technician> findAvailableByTimeConstraints(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("weekendRequired") Boolean weekendRequired
    );

    // Expiring certifications and licenses
    @Query("SELECT t FROM Technician t WHERE t.licenseExpiryDate BETWEEN :startDate AND :endDate " +
           "AND t.status = 'ACTIVE'")
    List<Technician> findTechniciansWithExpiringLicenses(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT t FROM Technician t WHERE t.medicalClearanceExpiry BETWEEN :startDate AND :endDate " +
           "AND t.status = 'ACTIVE'")
    List<Technician> findTechniciansWithExpiringMedicalClearance(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Training due queries
    @Query("SELECT t FROM Technician t WHERE " +
           "(t.lastSafetyTraining IS NULL OR t.lastSafetyTraining < :trainingDueDate) " +
           "AND t.status = 'ACTIVE'")
    List<Technician> findTechniciansRequiringSafetyTraining(@Param("trainingDueDate") LocalDateTime trainingDueDate);

    @Query("SELECT t FROM Technician t WHERE " +
           "(t.lastTechnicalTraining IS NULL OR t.lastTechnicalTraining < :trainingDueDate) " +
           "AND t.status = 'ACTIVE'")
    List<Technician> findTechniciansRequiringTechnicalTraining(@Param("trainingDueDate") LocalDateTime trainingDueDate);

    // Top performers queries
    @Query("SELECT t FROM Technician t WHERE t.status = 'ACTIVE' " +
           "ORDER BY t.averageRating DESC, t.jobsCompleted DESC")
    List<Technician> findTopPerformers(Pageable pageable);

    @Query("SELECT t FROM Technician t WHERE t.status = 'ACTIVE' AND t.jobsCompleted >= :minJobs " +
           "ORDER BY t.onTimeCompletionRate DESC")
    List<Technician> findMostReliable(@Param("minJobs") Integer minJobs, Pageable pageable);

    @Query("SELECT t FROM Technician t WHERE t.status = 'ACTIVE' AND t.totalEarnings > 0 " +
           "ORDER BY t.totalEarnings DESC")
    List<Technician> findHighestEarners(Pageable pageable);
}
