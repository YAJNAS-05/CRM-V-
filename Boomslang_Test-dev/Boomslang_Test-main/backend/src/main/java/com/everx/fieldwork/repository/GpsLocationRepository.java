package com.everx.fieldwork.repository;

import com.everx.fieldwork.entity.GpsLocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GpsLocationRepository extends JpaRepository<GpsLocation, UUID>, JpaSpecificationExecutor<GpsLocation> {

    // Basic CRUD operations with custom queries
    List<GpsLocation> findByTechnicianId(String technicianId);

    List<GpsLocation> findByFieldJobId(String fieldJobId);

    // Time-based queries
    List<GpsLocation> findByTechnicianIdAndTimestampBetween(
            String technicianId, 
            LocalDateTime startDate, 
            LocalDateTime endDate
    );

    List<GpsLocation> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.timestamp >= :since ORDER BY g.timestamp DESC")
    List<GpsLocation> findRecentByTechnician(@Param("technicianId") String technicianId, @Param("since") LocalDateTime since);

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "ORDER BY g.timestamp DESC")
    List<GpsLocation> findLatestByTechnician(@Param("technicianId") String technicianId, Pageable pageable);

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "ORDER BY g.timestamp DESC LIMIT 1")
    GpsLocation findLatestLocationByTechnician(@Param("technicianId") String technicianId);

    // Location source queries
    List<GpsLocation> findBySource(GpsLocation.LocationSource source);

    List<GpsLocation> findByTechnicianIdAndSource(
            String technicianId, 
            GpsLocation.LocationSource source
    );

    // Accuracy and quality queries
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.isAccurate = true " +
           "AND g.timestamp >= :since " +
           "ORDER BY g.timestamp DESC")
    List<GpsLocation> findAccurateRecentByTechnician(
            @Param("technicianId") String technicianId, 
            @Param("since") LocalDateTime since
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.accuracy <= :maxAccuracy " +
           "AND g.timestamp >= :since " +
           "ORDER BY g.timestamp DESC")
    List<GpsLocation> findHighAccuracyByTechnician(
            @Param("technicianId") String technicianId, 
            @Param("maxAccuracy") Double maxAccuracy,
            @Param("since") LocalDateTime since
    );

    // Location context queries
    List<GpsLocation> findByContext(GpsLocation.LocationContext context);

    List<GpsLocation> findByTechnicianIdAndContext(
            String technicianId, 
            GpsLocation.LocationContext context
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.context IN :contexts " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    List<GpsLocation> findByTechnicianAndContexts(
            @Param("technicianId") String technicianId,
            @Param("contexts") List<GpsLocation.LocationContext> contexts,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Geofence queries
    List<GpsLocation> findByIsInGeofence(boolean isInGeofence);

    List<GpsLocation> findByTechnicianIdAndIsInGeofence(
            String technicianId, 
            boolean isInGeofence
    );

    List<GpsLocation> findByGeofenceId(String geofenceId);

    // Waypoint queries
    List<GpsLocation> findByIsWaypoint(boolean isWaypoint);

    List<GpsLocation> findByTechnicianIdAndIsWaypoint(
            String technicianId, 
            boolean isWaypoint
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.isWaypoint = true " +
           "ORDER BY g.waypointOrder ASC")
    List<GpsLocation> findWaypointsByTechnician(@Param("technicianId") String technicianId);

    // Location bounds queries
    @Query("SELECT g FROM GpsLocation g WHERE " +
           "g.latitude BETWEEN :minLat AND :maxLat " +
           "AND g.longitude BETWEEN :minLng AND :maxLng " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    List<GpsLocation> findByLocationBoundsAndTimeRange(
            @Param("minLat") Double minLatitude,
            @Param("maxLat") Double maxLatitude,
            @Param("minLng") Double minLongitude,
            @Param("maxLng") Double maxLongitude,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Distance and travel queries
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.distanceFromPrevious > :minDistance " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findSignificantMovementsByTechnician(
            @Param("technicianId") String technicianId,
            @Param("minDistance") Double minDistance,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.speed > :minSpeed " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findTravelingByTechnician(
            @Param("technicianId") String technicianId,
            @Param("minSpeed") Double minSpeed,
            @Param("since") LocalDateTime since
    );

    // Battery and device status queries
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.batteryLevel <= :maxBattery " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findLowBatteryByTechnician(
            @Param("technicianId") String technicianId,
            @Param("maxBattery") Integer maxBattery,
            @Param("since") LocalDateTime since
    );

    List<GpsLocation> findByTechnicianIdAndIsCharging(
            String technicianId, 
            boolean isCharging
    );

    // Network and connectivity queries
    List<GpsLocation> findByNetworkType(GpsLocation.NetworkType networkType);

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.networkType != 'NONE' " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findConnectedByTechnician(
            @Param("technicianId") String technicianId, 
            @Param("since") LocalDateTime since
    );

    // Synchronization queries
    List<GpsLocation> findByIsSynced(boolean isSynced);

    List<GpsLocation> findByTechnicianIdAndIsSynced(
            String technicianId, 
            boolean isSynced
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.isSynced = false " +
           "AND g.timestamp < :cutoff")
    List<GpsLocation> findUnsyncedOlderThan(@Param("cutoff") LocalDateTime cutoff);

    // Privacy and consent queries
    List<GpsLocation> findByTechnicianIdAndUserConsent(
            String technicianId, 
            boolean userConsent
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.userConsent = true " +
           "AND g.isWorkHours = true " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findConsentedWorkHoursByTechnician(
            @Param("technicianId") String technicianId, 
            @Param("since") LocalDateTime since
    );

    // Device tracking queries
    List<GpsLocation> findByDeviceId(String deviceId);

    List<GpsLocation> findByExternalTrackingId(String externalTrackingId);

    // Weather information queries
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.weatherCondition IS NOT NULL " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    List<GpsLocation> findWithWeatherByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Dashboard and analytics queries
    @Query("SELECT COUNT(g) FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.timestamp >= :since")
    long countByTechnicianSince(@Param("technicianId") String technicianId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT g.technicianId) FROM GpsLocation g WHERE g.timestamp >= :since")
    long countActiveTechniciansSince(@Param("since") LocalDateTime since);

    @Query("SELECT g FROM GpsLocation g WHERE g.timestamp >= :since " +
           "ORDER BY g.timestamp DESC")
    List<GpsLocation> findRecentLocations(@Param("since") LocalDateTime since, Pageable pageable);

    // Location path reconstruction
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.timestamp BETWEEN :startDate AND :endDate " +
           "AND g.isAccurate = true " +
           "ORDER BY g.timestamp ASC")
    List<GpsLocation> findPathByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Speed and movement analytics
    @Query("SELECT AVG(g.speed) FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.speed > 0 " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageSpeedByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT MAX(g.speed) FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    Double getMaxSpeedByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Distance calculations
    @Query("SELECT COALESCE(SUM(g.distanceFromPrevious), 0) FROM GpsLocation g " +
           "WHERE g.technicianId = :technicianId " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    Double getTotalDistanceByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Location quality metrics
    @Query("SELECT COUNT(g) FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.isAccurate = true " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    long countAccurateLocationsByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT AVG(g.accuracy) FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.accuracy IS NOT NULL " +
           "AND g.timestamp BETWEEN :startDate AND :endDate")
    Double getAverageAccuracyByTechnician(
            @Param("technicianId") String technicianId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // Time-based analytics
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND DATE(g.timestamp) = DATE(:date)")
    List<GpsLocation> findByTechnicianAndDate(
            @Param("technicianId") String technicianId, 
            @Param("date") LocalDateTime date
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND HOUR(g.timestamp) BETWEEN :startHour AND :endHour " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findByTechnicianAndHourRange(
            @Param("technicianId") String technicianId,
            @Param("startHour") Integer startHour,
            @Param("endHour") Integer endHour,
            @Param("since") LocalDateTime since
    );

    // Cleanup queries
    @Query("SELECT g FROM GpsLocation g WHERE g.timestamp < :cutoff " +
           "AND g.isSynced = true")
    List<GpsLocation> findOldSyncedLocations(@Param("cutoff") LocalDateTime cutoff);

    @Query("DELETE FROM GpsLocation g WHERE g.timestamp < :cutoff " +
           "AND g.isSynced = true")
    void deleteOldSyncedLocations(@Param("cutoff") LocalDateTime cutoff);

    // Data quality queries
    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND (g.latitude = 0 OR g.longitude = 0) " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findInvalidLocationsByTechnician(
            @Param("technicianId") String technicianId, 
            @Param("since") LocalDateTime since
    );

    @Query("SELECT g FROM GpsLocation g WHERE g.technicianId = :technicianId " +
           "AND g.speed > :maxSpeed " +
           "AND g.timestamp >= :since")
    List<GpsLocation> findUnrealisticSpeedByTechnician(
            @Param("technicianId") String technicianId,
            @Param("maxSpeed") Double maxSpeed,
            @Param("since") LocalDateTime since
    );
}
