package com.everx.finance.close;

import com.everx.finance.close.dto.ThreeWayMatchException;
import com.everx.finance.close.dto.ResolveMatchExceptionRequest;
import com.everx.finance.close.repository.ThreeWayMatchExceptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinancialCloseService {

    private final ThreeWayMatchExceptionRepository exceptionRepository;

    public List<ThreeWayMatchException> getExceptions(String companyCode, String status) {
        if (companyCode != null && status != null) {
            return exceptionRepository.findByCompanyCodeAndStatus(companyCode, status);
        } else if (companyCode != null) {
            return exceptionRepository.findByCompanyCode(companyCode);
        }
        return exceptionRepository.findAll();
    }

    @Transactional
    public ThreeWayMatchException resolveException(UUID id, ResolveMatchExceptionRequest request) {
        ThreeWayMatchException exception = exceptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exception not found"));
        exception.setStatus("RESOLVED");
        exception.setResolvedBy(request.getResolvedBy());
        exception.setResolvedAt(LocalDate.now());
        exception.setResolutionNotes(request.getNotes());
        return exceptionRepository.save(exception);
    }

    @Transactional
    public void closePeriod(String companyCode, String period) {
    }

    @Transactional
    public void reopenPeriod(String companyCode, String period) {
    }
}
