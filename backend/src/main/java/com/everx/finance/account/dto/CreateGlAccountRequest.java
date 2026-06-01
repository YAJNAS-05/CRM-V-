package com.everx.finance.account.dto;

import com.everx.finance.account.entity.GlAccount;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Create GL Account Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateGlAccountRequest {

    @NotBlank(message = "Account code is required")
    @Pattern(regexp = "^\\d{4}(\\.\\d{1,3})*$", message = "Account code format invalid (e.g., 1100.10.20)")
    private String accountCode;

    @NotBlank(message = "Account name is required")
    @Size(max = 255, message = "Account name must be max 255 characters")
    private String accountName;

    @NotNull(message = "Account type is required")
    private GlAccount.AccountType accountType;

    private UUID parentAccountId;

    @NotNull(message = "Company ID is required")
    private UUID companyId;

    @NotNull(message = "Level is required")
    @Min(value = 1, message = "Level must be >= 1")
    @Max(value = 5, message = "Level must be <= 5")
    private Integer level;

    @Size(max = 500, message = "Description max 500 characters")
    private String description;

    @NotNull(message = "Requires cost center must be specified")
    private Boolean requiresCostCenter = false;

    @NotNull(message = "Requires department must be specified")
    private Boolean requiresDepartment = false;

    @NotNull(message = "Allows manual entry must be specified")
    private Boolean allowsManualEntry = false;
}

/**
 * Tree Node Response for hierarchical structure
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class GlAccountTreeNode {

    private UUID id;
    private String accountCode;
    private String accountName;
    private GlAccount.AccountType accountType;
    private GlAccount.NormalBalance normalBalance;
    private Integer level;
    private Boolean isActive;
    private BigDecimal balance;
    private List<GlAccountTreeNode> children;
    private Boolean hasChildren;
}
