package com.everx.finance.consolidation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository for intercompany transaction tracking.
 */
@Repository
public interface IntercompanyTransactionRepository extends JpaRepository<IntercompanyTransaction, UUID> {
    
    /**
     * Find all intercompany transactions for a consolidation period that need elimination.
     */
    @Query(value = """
        SELECT i FROM IntercompanyTransaction i
        WHERE i.consolidationPeriod = :period
          AND i.eliminationStatus = 'PENDING'
        ORDER BY i.transactionDate
    """)
    List<IntercompanyTransaction> findPendingForPeriod(String period);

    /**
     * Find all intercompany transactions between two entities for a period.
     */
    @Query(value = """
        SELECT i FROM IntercompanyTransaction i
        WHERE i.fromEntity = :fromEntity
          AND i.toEntity = :toEntity
          AND i.consolidationPeriod = :period
        ORDER BY i.transactionDate
    """)
    List<IntercompanyTransaction> findByEntityPair(String fromEntity, String toEntity, String period);
}
