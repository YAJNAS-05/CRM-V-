package com.everx.erp.warranty;

import com.everx.erp.warranty.dto.CreateWarrantyRequest;
import com.everx.erp.warranty.dto.WarrantyDto;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final WarrantyRepository warrantyRepository;

    @Transactional
    public WarrantyDto createWarranty(CreateWarrantyRequest request) {
        Warranty warranty = new Warranty();
        warranty.setEquipmentId(request.getEquipmentId());
        warranty.setSoId(request.getSoId());
        warranty.setAccountId(request.getAccountId());
        warranty.setStartDate(request.getStartDate());
        warranty.setEndDate(request.getEndDate());
        warranty.setType(request.getType());
        warranty.setStatus(request.getStatus());
        warranty.setNotes(request.getNotes());
        return toDto(warrantyRepository.save(warranty));
    }

    @Transactional(readOnly = true)
    public WarrantyDto getWarrantyById(UUID id) {
        return toDto(warrantyRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Warranty not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<WarrantyDto> getAllWarranties(Pageable pageable) {
        return warrantyRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<WarrantyDto> getWarrantiesByEquipmentId(UUID equipmentId) {
        return warrantyRepository.findByEquipmentId(equipmentId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WarrantyDto> getWarrantiesByAccountId(UUID accountId, Pageable pageable) {
        return warrantyRepository.findByAccountId(accountId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<WarrantyDto> getExpiringWarranties(LocalDate date) {
        return warrantyRepository.findExpiringWarranties(date).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public WarrantyDto updateWarranty(UUID id, CreateWarrantyRequest request) {
        Warranty warranty = warrantyRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Warranty not found with id: " + id));
        if (request.getEquipmentId() != null) warranty.setEquipmentId(request.getEquipmentId());
        if (request.getSoId() != null) warranty.setSoId(request.getSoId());
        if (request.getAccountId() != null) warranty.setAccountId(request.getAccountId());
        if (request.getStartDate() != null) warranty.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) warranty.setEndDate(request.getEndDate());
        if (request.getType() != null) warranty.setType(request.getType());
        if (request.getStatus() != null) warranty.setStatus(request.getStatus());
        if (request.getNotes() != null) warranty.setNotes(request.getNotes());
        return toDto(warrantyRepository.save(warranty));
    }

    @Transactional
    public void deleteWarranty(UUID id) {
        Warranty warranty = warrantyRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Warranty not found with id: " + id));
        warranty.softDelete();
        warrantyRepository.save(warranty);
    }

    private WarrantyDto toDto(Warranty warranty) {
        WarrantyDto dto = new WarrantyDto();
        dto.setId(warranty.getId());
        dto.setEquipmentId(warranty.getEquipmentId());
        dto.setSoId(warranty.getSoId());
        dto.setAccountId(warranty.getAccountId());
        dto.setStartDate(warranty.getStartDate());
        dto.setEndDate(warranty.getEndDate());
        dto.setType(warranty.getType());
        dto.setStatus(warranty.getStatus());
        dto.setNotes(warranty.getNotes());
        dto.setCreatedAt(warranty.getCreatedAt().toInstant());
        dto.setUpdatedAt(warranty.getUpdatedAt().toInstant());
        return dto;
    }
}
