package com.everx.reporting.repository;

import com.everx.reporting.entity.DashboardConfigEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardConfigRepository extends JpaRepository<DashboardConfigEntity, Long> {
    
    Page<DashboardConfigEntity> findByUserEmail(String userEmail, Pageable pageable);
    
    Optional<DashboardConfigEntity> findByUserEmailAndDashboardName(String userEmail, String dashboardName);
    
    Optional<DashboardConfigEntity> findByUserEmailAndIsDefaultTrue(String userEmail);
    
    List<DashboardConfigEntity> findByUserEmail(String userEmail);
    
    List<DashboardConfigEntity> findByUserEmailAndIsSharedTrue(String userEmail);
    
    @Query("SELECT COUNT(d) FROM DashboardConfigEntity d WHERE d.userEmail = :userEmail")
    long countUserDashboards(@Param("userEmail") String userEmail);
}
