package com.everx.customersuccess.repository;

import com.everx.customersuccess.model.CustomerEngagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerEngagementRepository extends JpaRepository<CustomerEngagement, Long> {
    
    List<CustomerEngagement> findByCustomerId(Long customerId);
    
    List<CustomerEngagement> findByManagerId(Long managerId);
    
    List<CustomerEngagement> findByEngagementType(String engagementType);
    
    List<CustomerEngagement> findByStatus(String status);
    
    List<CustomerEngagement> findByPriority(String priority);
    
    List<CustomerEngagement> findByScheduledDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT e FROM CustomerEngagement e WHERE e.customerId = :customerId AND e.status = :status ORDER BY e.scheduledDate ASC")
    List<CustomerEngagement> findUpcomingEngagementsByCustomer(@Param("customerId") Long customerId, @Param("status") String status);
    
    @Query("SELECT e FROM CustomerEngagement e WHERE e.managerId = :managerId AND e.scheduledDate >= :since ORDER BY e.scheduledDate ASC")
    List<CustomerEngagement> findManagerUpcomingEngagements(@Param("managerId") Long managerId, @Param("since") LocalDateTime since);
    
    @Query("SELECT e FROM CustomerEngagement e WHERE e.status = 'COMPLETED' AND e.completedDate >= :since")
    List<CustomerEngagement> findCompletedEngagementsSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(e) FROM CustomerEngagement e WHERE e.managerId = :managerId AND e.status = 'COMPLETED' AND e.completedDate >= :since")
    Long countCompletedEngagementsByManagerSince(@Param("managerId") Long managerId, @Param("since") LocalDateTime since);
    
    @Query("SELECT AVG(e.satisfactionRating) FROM CustomerEngagement e WHERE e.customerId = :customerId AND e.satisfactionRating IS NOT NULL")
    Double getAverageSatisfactionRatingByCustomer(@Param("customerId") Long customerId);
    
    @Query("SELECT e FROM CustomerEngagement e WHERE e.priority = 'HIGH' AND e.status = 'SCHEDULED'")
    List<CustomerEngagement> findHighPriorityScheduledEngagements();
    
    @Query("SELECT DISTINCT e.engagementType FROM CustomerEngagement e")
    List<String> findAllEngagementTypes();
    
    @Query("SELECT e FROM CustomerEngagement e WHERE e.isVirtual = true AND e.status = 'SCHEDULED'")
    List<CustomerEngagement> findVirtualScheduledEngagements();
    
    @Query("SELECT COUNT(e) FROM CustomerEngagement e WHERE e.status = 'MISSED' AND e.scheduledDate < :now")
    Long countMissedEngagements(@Param("now") LocalDateTime now);
}
