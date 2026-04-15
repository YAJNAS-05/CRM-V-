package com.everx.crm.tradeshow.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeShowDto {
    private UUID id;
    private String name;
    private String location;
    private String country;
    private LocalDate startDate;
    private LocalDate endDate;
    private UUID[] attendees;
    private Integer leadsCaptured;
    private BigDecimal estimatedRoi;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
