package com.everx.finance.close;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "three_way_match_exceptions", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThreeWayMatchException extends BaseEntity {

    @Column(name = "po_id")
    private UUID poId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "receipt_id")
    private UUID receiptId;

    @Column(name = "exception_type", nullable = false, length = 50)
    private String exceptionType;

    @Column(name = "variance_amount", precision = 15, scale = 2)
    private BigDecimal varianceAmount;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;
}
