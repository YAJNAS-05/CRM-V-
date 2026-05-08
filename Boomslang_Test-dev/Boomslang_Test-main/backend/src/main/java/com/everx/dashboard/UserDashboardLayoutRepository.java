package com.everx.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserDashboardLayoutRepository extends JpaRepository<UserDashboardLayout, UUID> {

    Optional<UserDashboardLayout> findByUserIdAndDashboardType(UUID userId, String dashboardType);
}
