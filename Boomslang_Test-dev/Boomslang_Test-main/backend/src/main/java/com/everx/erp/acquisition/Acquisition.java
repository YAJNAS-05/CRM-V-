package com.everx.erp.acquisition;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "acquisition", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Acquisition extends BaseEntity {
    @Column(name = "acquisition_number", nullable = false, unique = true)
    private String acquisitionNumber;
    @Column(name = "asset_id")
    private UUID assetId;
    @Column(name = "vendor_id")
    private UUID vendorId;
    @Column(name = "acquisition_date")
    private java.time.LocalDate acquisitionDate;
    @Column(name = "acquisition_cost")
    private BigDecimal acquisitionCost;
    @Column(name = "status", length = 20)
    private String status;
}
