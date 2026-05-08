package com.everx.finance.aging;

import com.everx.finance.aging.dto.ArAgingReportDto;
import com.everx.finance.aging.dto.ArCustomerAgingDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArAgingRepository extends JpaRepository<Object, UUID> {
    
    @Query("SELECT new com.everx.finance.aging.dto.ArAgingReportDto(" +
           "c.id, c.name, c.email, c.phone, " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 90 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 60 AND i.dueDate >= CURRENT_DATE - 90 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 30 AND i.dueDate >= CURRENT_DATE - 60 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE AND i.dueDate >= CURRENT_DATE - 30 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate >= CURRENT_DATE THEN i.amount ELSE 0 END), " +
           "SUM(i.amount)) " +
           "FROM Customer c LEFT JOIN Invoice i ON c.id = i.customerId " +
           "WHERE (:companyCode IS NULL OR c.companyCode = :companyCode) " +
           "AND (:customerId IS NULL OR c.id = :customerId) " +
           "GROUP BY c.id, c.name, c.email, c.phone")
    List<ArAgingReportDto> generateARAgingReport(@Param("companyCode") String companyCode, 
                                                @Param("customerId") UUID customerId);
    
    @Query("SELECT new com.everx.finance.aging.dto.ArCustomerAgingDto(" +
           "c.id, c.name, c.email, c.phone, " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 90 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 60 AND i.dueDate >= CURRENT_DATE - 90 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE - 30 AND i.dueDate >= CURRENT_DATE - 60 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate < CURRENT_DATE AND i.dueDate >= CURRENT_DATE - 30 THEN i.amount ELSE 0 END), " +
           "SUM(CASE WHEN i.dueDate >= CURRENT_DATE THEN i.amount ELSE 0 END), " +
           "SUM(i.amount)) " +
           "FROM Customer c LEFT JOIN Invoice i ON c.id = i.customerId " +
           "WHERE c.id = :customerId " +
           "GROUP BY c.id, c.name, c.email, c.phone")
    ArCustomerAgingDto getCustomerAging(@Param("customerId") UUID customerId);
}
