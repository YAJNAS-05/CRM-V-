package com.everx.finance.journal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GlJournalEntryRepository extends JpaRepository<Object, UUID> {
    
    @Query("SELECT e FROM GlJournalEntry e WHERE e.tenantId = :tenantId AND e.createdAt BETWEEN :startDate AND :endDate")
    List<Object> findByTenantIdAndDateRange(@Param("tenantId") UUID tenantId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM GlJournalEntry e WHERE e.accountCode = :accountCode AND e.tenantId = :tenantId")
    List<Object> findByAccountCodeAndTenantId(@Param("accountCode") String accountCode, 
                                             @Param("tenantId") UUID tenantId);
    
    @Query("SELECT COUNT(e) FROM GlJournalEntry e WHERE e.tenantId = :tenantId AND e.isPosted = true")
    Long countPostedEntriesByTenant(@Param("tenantId") UUID tenantId);
}
