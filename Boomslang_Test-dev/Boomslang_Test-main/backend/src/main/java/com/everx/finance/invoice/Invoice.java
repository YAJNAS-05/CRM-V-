package com.everx.finance.invoice;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "invoices", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Invoice extends BaseEntity {

    @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "so_id")
    private UUID soId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InvoiceEntity entity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InvoiceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InvoiceStatus status;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 3)
    private String currency;

    @Column(precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 15, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reversal_of")
    private UUID reversalOf;

    @Column(name = "reversed_by", length = 50)
    private String reversedBy;

    @Column(name = "reversal_reason", length = 50)
    private String reversalReason;

    @Column(name = "reversal_note", columnDefinition = "TEXT")
    private String reversalNote;

    public enum InvoiceEntity {
        AUSTRALIA, USA, JAPAN
    }

    public enum InvoiceType {
        PROFORMA, TAX_INVOICE, CREDIT_NOTE
    }

    public enum InvoiceStatus {
        DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE, VOID, CANCELLED
    }
}
