package com.everx.erp.settings;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "numbering_patterns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NumberingPattern {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String documentType; // e.g., "SALES_ORDER", "INVOICE", "SERVICE_TICKET"

    @Column(nullable = false, length = 100)
    private String prefix; // e.g., "SO"

    @Column(nullable = false, length = 200)
    private String pattern; // e.g., "{PREFIX}-{YYYY}-{NNNNNN}" or "{PREFIX}-{MM}/{NNNNNN}"

    @Column(nullable = false)
    @Builder.Default
    private Integer sequenceWidth = 6; // Width for {NNNNNN}

    @Column(nullable = false)
    @Builder.Default
    private Long nextSequence = 1L; // Current sequence counter

    @Column(length = 500)
    private String description; // e.g., "Sales Order numbering with year and 6-digit sequence"

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
