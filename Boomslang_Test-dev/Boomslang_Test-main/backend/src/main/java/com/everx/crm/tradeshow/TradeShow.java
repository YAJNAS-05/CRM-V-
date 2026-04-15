package com.everx.crm.tradeshow;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "trade_shows", schema = "everx_crm")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TradeShow extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 255)
    private String location;

    @Column(length = 100)
    private String country;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "attendees", columnDefinition = "uuid[]")
    private UUID[] attendees;

    @Column(name = "leads_captured")
    private Integer leadsCaptured = 0;

    @Column(name = "estimated_roi", precision = 15, scale = 2)
    private BigDecimal estimatedRoi;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
