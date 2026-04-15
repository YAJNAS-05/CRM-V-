package com.everx.crm.tradeshow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateTradeShowRequest {
    
    @NotBlank(message = "Trade show name is required")
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String location;

    @Size(max = 100)
    private String country;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private UUID[] attendees;
    private Integer leadsCaptured;
    private BigDecimal estimatedRoi;
    private String notes;
}
