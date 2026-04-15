package com.everx.erp.logistics;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "shipments", schema = "everx_erp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shipment extends BaseEntity {

    @Column(name = "so_id")
    private UUID soId;

    @Column(name = "po_id")
    private UUID poId;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(length = 50)
    private String carrier;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(name = "destination_country", length = 100)
    private String destinationCountry;

    @Column(nullable = false, length = 50)
    private String status = "BOOKED";

    @Column(name = "shipped_date")
    private LocalDate shippedDate;

    @Column(name = "estimated_arrival")
    private LocalDate estimatedArrival;

    @Column(name = "actual_arrival")
    private LocalDate actualArrival;

    @Column(name = "bill_of_lading_url", columnDefinition = "TEXT")
    private String billOfLadingUrl;

    @Column(name = "packing_list_url", columnDefinition = "TEXT")
    private String packingListUrl;

    @Column(name = "customs_declaration_url", columnDefinition = "TEXT")
    private String customsDeclarationUrl;

    @Column(name = "freight_cost", precision = 15, scale = 2)
    private BigDecimal freightCost;

    @Column(length = 3)
    private String currency;
}
