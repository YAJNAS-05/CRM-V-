package com.everx.crm.tradeshow.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTradeShowRequest {
    
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String location;

    @Size(max = 100)
    private String country;

    private LocalDate startDate;
    private LocalDate endDate;
    private UUID[] attendees;
    private Integer leadsCaptured;
    private BigDecimal estimatedRoi;
    private String notes;
}
