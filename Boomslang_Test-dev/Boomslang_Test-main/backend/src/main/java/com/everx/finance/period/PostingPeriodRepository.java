package com.everx.finance.period;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostingPeriodRepository extends JpaRepository<PostingPeriod, UUID> {
    Optional<PostingPeriod> findByCompanyCodeAndFiscalYearAndPeriod(String companyCode, Integer fiscalYear, Integer period);
}
