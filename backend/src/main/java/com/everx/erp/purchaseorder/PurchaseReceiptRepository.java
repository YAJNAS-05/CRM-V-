package com.everx.erp.purchaseorder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseReceiptRepository extends JpaRepository<PurchaseReceipt, UUID> {
    Optional<PurchaseReceipt> findTopByPoIdOrderByReceivedDateDesc(UUID poId);
}
