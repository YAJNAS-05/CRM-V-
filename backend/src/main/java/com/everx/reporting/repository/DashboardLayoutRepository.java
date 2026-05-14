package com.everx.reporting.repository;

import com.everx.reporting.entity.DashboardLayoutEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardLayoutRepository extends JpaRepository<DashboardLayoutEntity, Long> {
    Optional<DashboardLayoutEntity> findByUserEmail(String userEmail);
}
