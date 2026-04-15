package com.everx.finance.tolerance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceToleranceConfigRepository extends JpaRepository<InvoiceToleranceConfig, UUID> {
    Optional<InvoiceToleranceConfig> findByCompanyCode(String companyCode);
}
