package com.everx.erp.purchaseorder;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Captures goods receipt totals for 3-way match (PO → Receipt → Invoice).
 */
@Entity
@Table(name = "purchase_receipts", schema = "everx_erp", indexes = {
    @Index(name = "idx_purchase_receipt_po", columnList = "po_id"),
    @Index(name = "idx_purchase_receipt_date", columnList = "received_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PurchaseReceipt extends BaseEntity {

    @Column(name = "po_id", nullable = false)
    private UUID poId;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(length = 3)
    private String currency;
}
