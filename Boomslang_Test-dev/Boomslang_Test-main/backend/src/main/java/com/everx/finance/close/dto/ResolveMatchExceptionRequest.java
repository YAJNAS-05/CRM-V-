package com.everx.finance.close.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolveMatchExceptionRequest {
    private UUID resolvedBy;
    private String notes;
}
