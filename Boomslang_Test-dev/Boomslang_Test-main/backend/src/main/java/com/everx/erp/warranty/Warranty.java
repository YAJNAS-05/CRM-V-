package com.everx.erp.warranty;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "warranty", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Warranty extends BaseEntity {
    @Column(name = "warranty_number", nullable = false, unique = true)
    private String warrantyNumber;
    @Column(name = "asset_id", nullable = false)
    private UUID assetId;
    @Column(name = "warranty_type", length = 50)
    private String warrantyType;
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
