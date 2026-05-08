package com.everx.erp.warranty;

import com.everx.erp.warranty.dto.WarrantyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;

    public Page<WarrantyResponse> findAll(Pageable pageable) {
        return warrantyRepository.findAll(pageable).map(this::toResponse);
    }

    public WarrantyResponse findById(UUID id) {
        Warranty warranty = warrantyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Warranty not found"));
        return toResponse(warranty);
    }

    @Transactional
    public WarrantyResponse create(Warranty request) {
        request.setWarrantyNumber(generateWarrantyNumber());
        request.setIsActive(true);
        return toResponse(warrantyRepository.save(request));
    }

    private String generateWarrantyNumber() {
        return "WTY-" + System.currentTimeMillis();
    }

    private WarrantyResponse toResponse(Warranty w) {
        return WarrantyResponse.builder()
            .id(w.getId())
            .warrantyNumber(w.getWarrantyNumber())
            .assetId(w.getAssetId())
            .warrantyType(w.getWarrantyType())
            .startDate(w.getStartDate())
            .endDate(w.getEndDate())
            .coverageDetails(w.getCoverageDetails())
            .isActive(w.getIsActive())
            .build();
    }
}
