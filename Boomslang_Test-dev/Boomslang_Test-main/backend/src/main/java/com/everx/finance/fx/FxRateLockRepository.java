package com.everx.finance.fx;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FxRateLockRepository extends JpaRepository<FxRateLock, UUID> {
    Optional<FxRateLock> findByInvoiceId(UUID invoiceId);
}
