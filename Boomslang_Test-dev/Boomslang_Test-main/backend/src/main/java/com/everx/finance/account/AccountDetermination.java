package com.everx.finance.account;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDate;

@Entity
@Table(name = "account_determination", schema = "everx_erp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"company_code", "transaction_key", "valuation_class"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AccountDetermination extends BaseEntity {

    @Column(name = "company_code", nullable = false, length = 10)
    private String companyCode;

    @Column(name = "transaction_key", nullable = false, length = 10)
    private String transactionKey;

    @Column(name = "valuation_class", nullable = false, length = 20)
    private String valuationClass;

    @Column(name = "gl_account", nullable = false, length = 10)
    private String glAccount;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "effective_from", nullable = false)
    @Builder.Default
    private LocalDate effectiveFrom = LocalDate.now();

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
