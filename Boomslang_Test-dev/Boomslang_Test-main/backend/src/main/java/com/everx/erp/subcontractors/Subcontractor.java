package com.everx.erp.subcontractors;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "subcontractors", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subcontractor extends BaseEntity {

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "contact_name", length = 255)
    private String contactName;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String country;

    @Column(name = "coverage_regions", columnDefinition = "TEXT[]")
    private String[] coverageRegions;

    @Column(columnDefinition = "TEXT[]")
    private String[] specialisations;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(length = 3)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
