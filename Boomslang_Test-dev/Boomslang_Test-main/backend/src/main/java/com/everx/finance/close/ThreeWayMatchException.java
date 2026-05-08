package com.everx.finance.close;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Entity
@Table(name = "three_way_match_exception", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ThreeWayMatchException extends BaseEntity {

    @Column(name = "purchase_order_id", nullable = false)
    private java.util.UUID purchaseOrderId;

    @Column(name = "invoice_id")
    private java.util.UUID invoiceId;

    @Column(name = "receipt_id")
    private java.util.UUID receiptId;

    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;

    @Column(name = "exception_type", length = 50)
    private String exceptionType;

    @Column(name = "variance_amount")
    private java.math.BigDecimal varianceAmount;

    @Column(name = "variance_percentage")
    private java.math.BigDecimal variancePercentage;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "resolved_by")
    private java.util.UUID resolvedBy;

    @Column(name = "resolved_at")
    private LocalDate resolvedAt;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;
}
