package com.everx.erp.fieldwork.dto;

import com.everx.erp.fieldwork.TravelMode;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class FieldJobTravelDto {
    private Long travelId;
    private UUID fieldJobId;
    private String engineerId;
    private Integer legNumber;
    private TravelMode travelMode;
    private String departureCity;
    private String departureCountry;
    private OffsetDateTime departureDatetime;
    private String arrivalCity;
    private String arrivalCountry;
    private OffsetDateTime arrivalDatetime;
    private String flightNumber;
    private String bookingReference;
    private BigDecimal ticketCostAmount;
    private String ticketCostCurrency;
    private Integer accommodationNights;
    private BigDecimal accommodationCost;
    private String accommodationCurrency;
    private Integer perDiemDays;
    private BigDecimal perDiemRateUsd;
    private Boolean visaRequired;
    private String visaStatus;
    private String travelNotes;
}