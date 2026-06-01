package com.everx.finance.ap.entity;

import com.everx.finance.account.entity.GlAccount;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Vendor Invoice - Accounts Payable invoice from vendors
 * Tracks invoice lifecycle: DRAFT → RECEIVED → APPROVED → POSTED → PARTIALLY_PAID → PAID
 */
@Entity
@Table(name = "vendor_invoices", schema = "everx_finance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"vendor_id", "invoice_number"}),
       indexes = {
           @Index(name = "idx_vi_vendor", columnList = "vendor_id"),
           @Index(name = "idx_vi_status", columnList = "status"),
           @Index(name = "idx_vi_due_date", columnList = "due_date"),
           @Index(name = "idx_vi_matching", columnList = "matching_status")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorInvoice extends BaseEntity {

    @Column(nullable = false)
    private UUID vendorId;

    @Column(nullable = false, length = 100)
    private String invoiceNumber;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(name = "expected_payment_date")
    private LocalDate expectedPaymentDate;

    @Column(name = "po_id")
    private UUID poId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal grossAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal netAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gl_account_id", foreignKey = @ForeignKey(name = "fk_vi_gl_account"))
    private GlAccount glAccount;

    @Column(name = "posting_date")
    private OffsetDateTime postingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MatchingStatus matchingStatus = MatchingStatus.UNMATCHED;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(columnDefinition = "TEXT")
    private String approvalNotes;

    @Column(nullable = false)
    private Integer daysOverdue = 0;

    @Column(nullable = false)
    private Boolean lateFeeApplicable = false;

    @Column(precision = 19, scale = 2)
    private BigDecimal lateFeeAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "vendorInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApPayment> payments = new ArrayList<>();

    /**
     * Calculate outstanding balance
     */
    @Transient
    public BigDecimal getOutstandingAmount() {
        BigDecimal paid = payments.stream()
            .filter(p -> p.getStatus() != ApPayment.Status.FAILED)
            .map(ApPayment::getPaymentAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return netAmount.subtract(paid);
    }

    public enum Status {
        DRAFT,
        RECEIVED,
        APPROVED,
        POSTED,
        PARTIALLY_PAID,
        PAID,
        OVERDUE,
        CANCELLED
    }

    public enum MatchingStatus {
        UNMATCHED,
        MATCHED_PO,
        MATCHED_RECEIPT,
        THREE_WAY_MATCHED,
        EXCEPTION
    }

    @PreUpdate
    private void onUpdate() {
        daysOverdue = (int) java.time.temporal.ChronoUnit.DAYS.between(dueDate, LocalDate.now());
        if (daysOverdue > 30) {
            lateFeeApplicable = true;
        }
    }
}
