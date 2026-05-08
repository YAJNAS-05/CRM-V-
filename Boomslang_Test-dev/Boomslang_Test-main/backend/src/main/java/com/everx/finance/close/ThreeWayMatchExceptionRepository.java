package com.everx.finance.close;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ThreeWayMatchExceptionRepository extends JpaRepository<ThreeWayMatchException, UUID> {
    List<ThreeWayMatchException> findByCompanyCode(String companyCode);
    List<ThreeWayMatchException> findByCompanyCodeAndStatus(String companyCode, String status);
}
