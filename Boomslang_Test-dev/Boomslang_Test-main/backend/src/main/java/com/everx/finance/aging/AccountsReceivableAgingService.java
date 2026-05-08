package com.everx.finance.aging;

import com.everx.finance.aging.dto.ArAgingReportDto;
import com.everx.finance.aging.dto.ArCustomerAgingDto;
import com.everx.finance.aging.dto.ArAgingDetailDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountsReceivableAgingService {

    private final ArAgingRepository repository;

    public List<ArAgingReportDto> generateARAgingReport(String companyCode, UUID customerId) {
        return repository.generateARAgingReport(companyCode, customerId);
    }

    public ArCustomerAgingDto getCustomerAging(UUID customerId) {
        List<ArAgingDetailDto> details = repository.findByCustomerId(customerId);
        ArCustomerAgingDto dto = new ArCustomerAgingDto();
        dto.setCustomerId(customerId);
        dto.setDetails(details);
        dto.setTotalOpenAmount(details.stream().map(ArAgingDetailDto::getOpenAmount).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        return dto;
    }

    @Transactional
    public void refreshAgingData(String companyCode) {
        repository.refreshAgingData(companyCode, LocalDateTime.now());
    }
}
