package com.everx.crm.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.id = :id")
    Optional<Activity> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false")
    Page<Activity> findAllNotDeleted(Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.dealId = :dealId ORDER BY a.createdAt DESC")
    List<Activity> findByDealId(@Param("dealId") UUID dealId);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.leadId = :leadId ORDER BY a.createdAt DESC")
    List<Activity> findByLeadId(@Param("leadId") UUID leadId);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.contactId = :contactId ORDER BY a.createdAt DESC")
    List<Activity> findByContactId(@Param("contactId") UUID contactId);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.assignedTo = :userId ORDER BY a.dueDate DESC")
    List<Activity> findByAssignedTo(@Param("userId") UUID userId);

    @Query("SELECT a FROM Activity a WHERE a.isDeleted = false AND a.completedAt IS NULL AND a.dueDate < CURRENT_TIMESTAMP ORDER BY a.dueDate ASC")
    List<Activity> findOverdueActivities();
}
