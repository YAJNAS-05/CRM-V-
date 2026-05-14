package com.everx.finance.reversal.dto;

import com.everx.finance.reversal.ReversalReasonCode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for requesting reversal of an accounting document.
 * Requires reason code and optional narrative note.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReversalRequest {

    @NotNull(message = "Reversal reason code is required")
    private ReversalReasonCode reasonCode;

    private String note;
}
