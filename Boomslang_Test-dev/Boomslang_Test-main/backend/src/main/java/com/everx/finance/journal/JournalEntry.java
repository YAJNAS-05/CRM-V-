package com.everx.finance.journal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "journal_entry", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JournalEntry extends BaseEntity {
    @Column(name = "entry_number", nullable = false, unique = true)
    private String entryNumber;
    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;
    @Column(name = "posting_date", nullable = false)
    private java.time.LocalDate postingDate;
    @Column(name = "document_date")
    private java.time.LocalDate documentDate;
    @Column(name = "reference", length = 20)
    private String reference;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "status", length = 20)
    private String status;
}
