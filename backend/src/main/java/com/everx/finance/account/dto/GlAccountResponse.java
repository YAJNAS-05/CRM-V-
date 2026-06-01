package com.everx.finance.account.dto;

import com.everx.finance.account.entity.GlAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * GL Account Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlAccountResponse {

    private UUID id;
    private String accountCode;
    private String accountName;
    private GlAccount.AccountType accountType;
    private GlAccount.NormalBalance normalBalance;
    private UUID parentAccountId;
    private UUID companyId;
    private Integer level;
    private Boolean isActive;
    private String description;
    private Boolean requiresCostCenter;
    private Boolean requiresDepartment;
    private Boolean allowsManualEntry;
    private BigDecimal balance;
    private List<GlAccountResponse> childAccounts;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private UUID createdBy;
}
