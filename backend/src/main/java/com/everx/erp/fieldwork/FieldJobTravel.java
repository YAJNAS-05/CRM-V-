package com.everx.erp.fieldwork;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "field_job_travel", schema = "everx_erp")
@Getter
@Setter
public class FieldJobTravel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "travel_id")
    private Long travelId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_job_id", nullable = false)
    private FieldJob fieldJob;

    @Column(name = "engineer_id", nullable = false)
    private String engineerId;

    @Column(name = "leg_number")
    private Integer legNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_mode", nullable = false)
    private TravelMode travelMode;

    @Column(name = "departure_city", nullable = false)
    private String departureCity;

    @Column(name = "departure_country")
    private String departureCountry;

    @Column(name = "departure_datetime", nullable = false)
    private OffsetDateTime departureDatetime;

    @Column(name = "arrival_city", nullable = false)
    private String arrivalCity;

    @Column(name = "arrival_country")
    private String arrivalCountry;

    @Column(name = "arrival_datetime", nullable = false)
    private OffsetDateTime arrivalDatetime;

    @Column(name = "flight_number")
    private String flightNumber;

    @Column(name = "booking_reference")
    private String bookingReference;

    @Column(name = "ticket_cost_amount", precision = 12, scale = 2)
    private BigDecimal ticketCostAmount;

    @Column(name = "ticket_cost_currency", length = 10)
    private String ticketCostCurrency;

    @Column(name = "accommodation_nights")
    private Integer accommodationNights;

    @Column(name = "accommodation_cost", precision = 12, scale = 2)
    private BigDecimal accommodationCost;

    @Column(name = "accommodation_currency", length = 10)
    private String accommodationCurrency;

    @Column(name = "per_diem_days")
    private Integer perDiemDays;

    @Column(name = "per_diem_rate_usd", precision = 12, scale = 2)
    private BigDecimal perDiemRateUsd;

    @Column(name = "visa_required", nullable = false)
    private Boolean visaRequired = false;

    @Column(name = "visa_status")
    private String visaStatus;

    @Column(name = "travel_notes")
    private String travelNotes;
}