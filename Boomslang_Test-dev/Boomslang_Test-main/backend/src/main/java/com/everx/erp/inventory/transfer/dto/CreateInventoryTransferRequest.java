package com.everx.erp.inventory.transfer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateInventoryTransferRequest {

    @NotNull
    private UUID itemId;

    @NotBlank
    private String fromLocation;

    @NotBlank
    private String toLocation;

    @NotNull
    private Integer quantity;

    private String notes;
}
