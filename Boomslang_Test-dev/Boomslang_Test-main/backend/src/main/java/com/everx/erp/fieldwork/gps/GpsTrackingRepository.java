package com.everx.erp.fieldwork.gps;

import com.everx.erp.fieldwork.gps.entity.GpsTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GpsTrackingRepository extends JpaRepository<GpsTracking, UUID> {
    
    List<GpsTracking> findByEmployeeIdOrderByTimestampDesc(UUID employeeId);
    
    List<GpsTracking> findByEmployeeIdAndTimestampBetweenOrderByTimestampAsc(
        UUID employeeId, LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT g FROM GpsTracking g WHERE g.employeeId = :employeeId " +
           "AND g.timestamp >= :since ORDER BY g.timestamp DESC")
    List<GpsTracking> findRecentByEmployeeId(@Param("employeeId") UUID employeeId, 
                                           @Param("since") LocalDateTime since);
    
    @Query("SELECT g FROM GpsTracking g WHERE g.fieldJobId = :fieldJobId " +
           "ORDER BY g.timestamp ASC")
    List<GpsTracking> findByFieldJobIdOrderByTimestampAsc(@Param("fieldJobId") UUID fieldJobId);
}
