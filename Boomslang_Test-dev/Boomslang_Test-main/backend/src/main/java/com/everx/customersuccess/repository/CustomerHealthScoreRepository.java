package com.everx.customersuccess.repository;

import com.everx.customersuccess.model.CustomerHealthScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerHealthScoreRepository extends JpaRepository<CustomerHealthScore, Long> {
    
    List<CustomerHealthScore> findByCustomerId(Long customerId);
    
    List<CustomerHealthScore> findByManagerId(Long managerId);
    
    List<CustomerHealthScore> findByHealthCategory(String healthCategory);
    
    List<CustomerHealthScore> findByCalculatedDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.customerId = :customerId ORDER BY h.calculatedDate DESC")
    List<CustomerHealthScore> findLatestHealthScoresByCustomer(@Param("customerId") Long customerId);
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.overallScore < :threshold")
    List<CustomerHealthScore> findCustomersWithLowHealthScore(@Param("threshold") Double threshold);
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.needsAttention = true ORDER BY h.overallScore ASC")
    List<CustomerHealthScore> findCustomersNeedingAttention();
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.customerId = :customerId ORDER BY h.calculatedDate DESC LIMIT 1")
    CustomerHealthScore findLatestHealthScoreByCustomer(@Param("customerId") Long customerId);
    
    @Query("SELECT AVG(h.overallScore) FROM CustomerHealthScore h WHERE h.calculatedDate >= :since")
    Double getAverageHealthScoreSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(h) FROM CustomerHealthScore h WHERE h.healthCategory = :category")
    Long countCustomersByHealthCategory(@Param("category") String category);
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.trend = 'DECLINING' AND h.needsAttention = true")
    List<CustomerHealthScore> findDecliningHealthScores();
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.nextReviewDate <= :date")
    List<CustomerHealthScore> findCustomersDueForReview(@Param("date") LocalDateTime date);
    
    @Query("SELECT DISTINCT h.healthCategory FROM CustomerHealthScore h")
    List<String> findAllHealthCategories();
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.managerId = :managerId AND h.needsAttention = true")
    List<CustomerHealthScore> findAtRiskCustomersByManager(@Param("managerId") Long managerId);
    
    @Query("SELECT h FROM CustomerHealthScore h WHERE h.previousScore IS NOT NULL AND h.overallScore < h.previousScore")
    List<CustomerHealthScore> findCustomersWithDecliningScores();
}
