package com.everx.crm.quote;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "quote_conversions", schema = "everx_crm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuoteConversion extends BaseEntity {

    @Column(name = "quote_id", nullable = false)
    private UUID quoteId;

    @Column(name = "sales_order_id")
    private UUID salesOrderId;

    @Column(name = "converted_by")
    private UUID convertedBy;

    @Column(name = "converted_at")
    private OffsetDateTime convertedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
