package com.everx.erp.spareparts;

import com.everx.erp.spareparts.dto.CreateSparePartRequest;
import com.everx.erp.spareparts.dto.SparePartDto;
import com.everx.erp.spareparts.dto.UpdateSparePartRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SparePartService {

    private final SparePartRepository sparePartRepository;

    @Transactional
    public SparePartDto createSparePart(CreateSparePartRequest request) {
        if (sparePartRepository.findByPartNumber(request.getPartNumber()).isPresent()) {
            throw new ValidationException("Spare part with part number " + request.getPartNumber() + " already exists");
        }

        SparePart sparePart = new SparePart();
        sparePart.setPartNumber(request.getPartNumber());
        sparePart.setName(request.getName());
        sparePart.setDescription(request.getDescription());
        sparePart.setCategory(request.getCategory());
        sparePart.setCompatibleModels(request.getCompatibleModels());
        sparePart.setStockQty(request.getStockQty() != null ? request.getStockQty() : 0);
        sparePart.setReorderPoint(request.getReorderPoint());
        sparePart.setUnitCost(request.getUnitCost());
        sparePart.setCurrency(request.getCurrency());
        sparePart.setSupplierId(request.getSupplierId());
        sparePart.setWarehouseLocation(request.getWarehouseLocation());
        sparePart.setManufacturer(request.getManufacturer());
        sparePart.setLocationCountry(request.getLocationCountry());
        sparePart.setYearOfManufacture(request.getYearOfManufacture());

        SparePart saved = sparePartRepository.save(sparePart);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public SparePartDto getSparePartById(UUID id) {
        SparePart sparePart = sparePartRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Spare part not found with id: " + id));
        return toDto(sparePart);
    }

    @Transactional(readOnly = true)
    public SparePartDto getSparePartByPartNumber(String partNumber) {
        SparePart sparePart = sparePartRepository.findByPartNumber(partNumber)
                .orElseThrow(() -> new EntityNotFoundException("Spare part not found with part number: " + partNumber));
        return toDto(sparePart);
    }

    @Transactional(readOnly = true)
    public Page<SparePartDto> getAllSpareParts(Pageable pageable) {
        return sparePartRepository.findAllNotDeleted(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SparePartDto> getSparePartsByCategory(String category, Pageable pageable) {
        return sparePartRepository.findByCategory(category, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<SparePartDto> getLowStockParts() {
        return sparePartRepository.findLowStockParts().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SparePartDto updateSparePart(UUID id, UpdateSparePartRequest request) {
        SparePart sparePart = sparePartRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Spare part not found with id: " + id));

        if (request.getPartNumber() != null && !request.getPartNumber().equals(sparePart.getPartNumber())) {
            if (sparePartRepository.findByPartNumber(request.getPartNumber()).isPresent()) {
                throw new ValidationException("Spare part with part number " + request.getPartNumber() + " already exists");
            }
            sparePart.setPartNumber(request.getPartNumber());
        }

        if (request.getName() != null) sparePart.setName(request.getName());
        if (request.getDescription() != null) sparePart.setDescription(request.getDescription());
        if (request.getCategory() != null) sparePart.setCategory(request.getCategory());
        if (request.getCompatibleModels() != null) sparePart.setCompatibleModels(request.getCompatibleModels());
        if (request.getStockQty() != null) sparePart.setStockQty(request.getStockQty());
        if (request.getReorderPoint() != null) sparePart.setReorderPoint(request.getReorderPoint());
        if (request.getUnitCost() != null) sparePart.setUnitCost(request.getUnitCost());
        if (request.getCurrency() != null) sparePart.setCurrency(request.getCurrency());
        if (request.getSupplierId() != null) sparePart.setSupplierId(request.getSupplierId());
        if (request.getWarehouseLocation() != null) sparePart.setWarehouseLocation(request.getWarehouseLocation());
        if (request.getManufacturer() != null) sparePart.setManufacturer(request.getManufacturer());
        if (request.getLocationCountry() != null) sparePart.setLocationCountry(request.getLocationCountry());
        if (request.getYearOfManufacture() != null) sparePart.setYearOfManufacture(request.getYearOfManufacture());

        SparePart updated = sparePartRepository.save(sparePart);
        return toDto(updated);
    }

    @Transactional
    public void deleteSparePart(UUID id) {
        SparePart sparePart = sparePartRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Spare part not found with id: " + id));
        sparePart.softDelete();
        sparePartRepository.save(sparePart);
    }

    private SparePartDto toDto(SparePart sparePart) {
        SparePartDto dto = new SparePartDto();
        dto.setId(sparePart.getId());
        dto.setPartNumber(sparePart.getPartNumber());
        dto.setName(sparePart.getName());
        dto.setDescription(sparePart.getDescription());
        dto.setCategory(sparePart.getCategory());
        dto.setCompatibleModels(sparePart.getCompatibleModels());
        dto.setStockQty(sparePart.getStockQty());
        dto.setReorderPoint(sparePart.getReorderPoint());
        dto.setUnitCost(sparePart.getUnitCost());
        dto.setCurrency(sparePart.getCurrency());
        dto.setSupplierId(sparePart.getSupplierId());
        dto.setWarehouseLocation(sparePart.getWarehouseLocation());
        dto.setManufacturer(sparePart.getManufacturer());
        dto.setLocationCountry(sparePart.getLocationCountry());
        dto.setYearOfManufacture(sparePart.getYearOfManufacture());
        dto.setCreatedAt(sparePart.getCreatedAt().toInstant());
        dto.setUpdatedAt(sparePart.getUpdatedAt().toInstant());
        return dto;
    }
}
