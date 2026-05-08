package com.everx.erp.spareparts;

import com.everx.erp.spareparts.dto.SparePartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SparePartService {

    private final SparePartRepository sparePartRepository;

    public Page<SparePartResponse> findAll(Pageable pageable) {
        return sparePartRepository.findAll(pageable).map(this::toResponse);
    }

    public SparePartResponse findById(UUID id) {
        SparePart part = sparePartRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Spare Part not found"));
        return toResponse(part);
    }

    @Transactional
    public SparePartResponse create(SparePart request) {
        return toResponse(sparePartRepository.save(request));
    }

    private SparePartResponse toResponse(SparePart p) {
        return SparePartResponse.builder()
            .id(p.getId())
            .partNumber(p.getPartNumber())
            .description(p.getDescription())
            .compatibleEquipmentType(p.getCompatibleEquipmentType())
            .unitPrice(p.getUnitPrice())
            .quantityInStock(p.getQuantityInStock())
            .build();
    }
}
