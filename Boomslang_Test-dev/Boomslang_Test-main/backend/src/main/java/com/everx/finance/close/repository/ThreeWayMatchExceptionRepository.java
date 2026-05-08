package com.everx.finance.close.repository;

import com.everx.finance.close.dto.ThreeWayMatchException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThreeWayMatchExceptionRepository extends JpaRepository<ThreeWayMatchException, UUID> {
    
    List<ThreeWayMatchException> findByCompanyCode(String companyCode);
    
    List<ThreeWayMatchException> findByCompanyCodeAndStatus(String companyCode, String status);
    
    List<ThreeWayMatchException> findByStatus(String status);
    
    List<ThreeWayMatchException> findByPriority(String priority);
    
    List<ThreeWayMatchException> findByAssignedTo(String assignedTo);
    
    @Query("SELECT e FROM ThreeWayMatchException e WHERE e.companyCode = :companyCode AND e.status = :status ORDER BY e.createdAt DESC")
    List<ThreeWayMatchException> findByCompanyCodeAndStatusOrderByCreatedAtDesc(@Param("companyCode") String companyCode, 
                                                                                @Param("status") String status);
    
    @Query("SELECT COUNT(e) FROM ThreeWayMatchException e WHERE e.companyCode = :companyCode AND e.status = 'OPEN'")
    Long countOpenExceptionsByCompany(@Param("companyCode") String companyCode);
    
    @Query("SELECT e FROM ThreeWayMatchException e WHERE e.varianceAmount > :threshold ORDER BY e.varianceAmount DESC")
    List<ThreeWayMatchException> findHighVarianceExceptions(@Param("threshold") java.math.BigDecimal threshold);
}
