package com.everx.finance.ap.entity;

import com.everx.finance.journal.entity.JournalEntry;
import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * AP Payment - Payment made to vendor for an invoice
 */
@Entity
@Table(name = "ap_payments", schema = "everx_finance",
       indexes = {
           @Index(name = "idx_app_vendor_invoice", columnList = "vendor_invoice_id"),
           @Index(name = "idx_app_status", columnList = "status"),
           @Index(name = "idx_app_payment_date", columnList = "payment_date")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApPayment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_invoice_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_app_vendor_invoice"))
    private VendorInvoice vendorInvoice;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal paymentAmount;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "bank_account_id")
    private UUID bankAccountId;

    @Column(length = 100)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Status status = Status.DRAFT;

    // FX Tracking
    @Column(precision = 19, scale = 4)
    private BigDecimal exchangeRate = BigDecimal.ONE;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountInBaseCurrency;

    // GL Posting
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_journal_entry_id",
                foreignKey = @ForeignKey(name = "fk_app_journal_entry"))
    private JournalEntry paymentJournalEntry;

    @Column(name = "reconciled_at")
    private OffsetDateTime reconciledAt;

    public enum PaymentMethod {
        BANK_TRANSFER,
        CHECK,
        CREDIT_CARD,
        ACH,
        LC,
        BARTER
    }

    public enum Status {
        DRAFT,
        SCHEDULED,
        PROCESSED,
        CLEARED,
        FAILED
    }
}
