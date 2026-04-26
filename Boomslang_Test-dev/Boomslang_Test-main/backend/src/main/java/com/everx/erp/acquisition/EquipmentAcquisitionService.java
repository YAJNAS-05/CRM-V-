package com.everx.erp.acquisition;

import com.everx.erp.acquisition.dto.CreateEquipmentAcquisitionRequest;
import com.everx.erp.acquisition.dto.EquipmentAcquisitionDto;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentAcquisitionService {

    private static final String[] VALID_STAGES = {
            "SOURCED", "ASSESSED", "PO_RAISED", "DEINSTALLED", "IN_TRANSIT",
            "ARRIVED_WAREHOUSE", "REFURBISHED", "QC_PASSED", "AVAILABLE"
    };

    private final EquipmentAcquisitionRepository acquisitionRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public EquipmentAcquisitionDto create(CreateEquipmentAcquisitionRequest request) {
        validateStage(request.getStage());

        EquipmentAcquisition entity = new EquipmentAcquisition();
        entity.setAcquisitionNumber(generateAcquisitionNumber());
        applyRequest(entity, request);

        return toDto(acquisitionRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public EquipmentAcquisitionDto getById(UUID id) {
        return toDto(acquisitionRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment acquisition not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<EquipmentAcquisitionDto> getAll(Pageable pageable) {
        return acquisitionRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentAcquisitionDto> getByStage(String stage, Pageable pageable) {
        validateStage(stage);
        return acquisitionRepository.findByStage(stage.toUpperCase(Locale.ROOT), pageable).map(this::toDto);
    }

    @Transactional
    public EquipmentAcquisitionDto update(UUID id, CreateEquipmentAcquisitionRequest request) {
        EquipmentAcquisition entity = acquisitionRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment acquisition not found with id: " + id));

        if (request.getStage() != null) {
            validateStage(request.getStage());
        }

        applyPartialRequest(entity, request);
        return toDto(acquisitionRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        EquipmentAcquisition entity = acquisitionRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment acquisition not found with id: " + id));
        entity.softDelete();
        acquisitionRepository.save(entity);
    }

    private void validateStage(String stage) {
        String normalized = stage == null ? "" : stage.toUpperCase(Locale.ROOT);
        for (String valid : VALID_STAGES) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid acquisition stage: " + stage);
    }

    private void applyRequest(EquipmentAcquisition entity, CreateEquipmentAcquisitionRequest request) {
        entity.setEquipmentId(request.getEquipmentId());
        entity.setSupplierId(request.getSupplierId());
        entity.setPurchaseOrderId(request.getPurchaseOrderId());
        entity.setEquipmentSource(request.getEquipmentSource());
        entity.setSellerName(request.getSellerName());
        entity.setStage(request.getStage().toUpperCase(Locale.ROOT));
        entity.setWarehouseLocation(request.getWarehouseLocation());
        entity.setRefurbCost(request.getRefurbCost());
        entity.setShipmentTracking(request.getShipmentTracking());
        entity.setSourcedDate(request.getSourcedDate());
        entity.setAssessedDate(request.getAssessedDate());
        entity.setPoRaisedDate(request.getPoRaisedDate());
        entity.setDeinstalledDate(request.getDeinstalledDate());
        entity.setArrivedWarehouseDate(request.getArrivedWarehouseDate());
        entity.setRefurbishedDate(request.getRefurbishedDate());
        entity.setQcPassedDate(request.getQcPassedDate());
        entity.setAvailableDate(request.getAvailableDate());
        entity.setNotes(request.getNotes());
    }

    private void applyPartialRequest(EquipmentAcquisition entity, CreateEquipmentAcquisitionRequest request) {
        if (request.getEquipmentId() != null) entity.setEquipmentId(request.getEquipmentId());
        if (request.getSupplierId() != null) entity.setSupplierId(request.getSupplierId());
        if (request.getPurchaseOrderId() != null) entity.setPurchaseOrderId(request.getPurchaseOrderId());
        if (request.getEquipmentSource() != null) entity.setEquipmentSource(request.getEquipmentSource());
        if (request.getSellerName() != null) entity.setSellerName(request.getSellerName());
        if (request.getStage() != null) entity.setStage(request.getStage().toUpperCase(Locale.ROOT));
        if (request.getWarehouseLocation() != null) entity.setWarehouseLocation(request.getWarehouseLocation());
        if (request.getRefurbCost() != null) entity.setRefurbCost(request.getRefurbCost());
        if (request.getShipmentTracking() != null) entity.setShipmentTracking(request.getShipmentTracking());
        if (request.getSourcedDate() != null) entity.setSourcedDate(request.getSourcedDate());
        if (request.getAssessedDate() != null) entity.setAssessedDate(request.getAssessedDate());
        if (request.getPoRaisedDate() != null) entity.setPoRaisedDate(request.getPoRaisedDate());
        if (request.getDeinstalledDate() != null) entity.setDeinstalledDate(request.getDeinstalledDate());
        if (request.getArrivedWarehouseDate() != null) entity.setArrivedWarehouseDate(request.getArrivedWarehouseDate());
        if (request.getRefurbishedDate() != null) entity.setRefurbishedDate(request.getRefurbishedDate());
        if (request.getQcPassedDate() != null) entity.setQcPassedDate(request.getQcPassedDate());
        if (request.getAvailableDate() != null) entity.setAvailableDate(request.getAvailableDate());
        if (request.getNotes() != null) entity.setNotes(request.getNotes());
    }

    private String generateAcquisitionNumber() {
        return documentNumberGenerator.generate(
                "ACQ",
                candidate -> acquisitionRepository.findByAcquisitionNumber(candidate).isPresent()
        );
    }

    private EquipmentAcquisitionDto toDto(EquipmentAcquisition entity) {
        return new EquipmentAcquisitionDto(
                entity.getId(),
                entity.getAcquisitionNumber(),
                entity.getEquipmentId(),
                entity.getSupplierId(),
                entity.getPurchaseOrderId(),
                entity.getEquipmentSource(),
                entity.getSellerName(),
                entity.getStage(),
                entity.getWarehouseLocation(),
                entity.getRefurbCost(),
                entity.getShipmentTracking(),
                entity.getSourcedDate(),
                entity.getAssessedDate(),
                entity.getPoRaisedDate(),
                entity.getDeinstalledDate(),
                entity.getArrivedWarehouseDate(),
                entity.getRefurbishedDate(),
                entity.getQcPassedDate(),
                entity.getAvailableDate(),
                entity.getNotes(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toInstant() : null,
                entity.getUpdatedAt() != null ? entity.getUpdatedAt().toInstant() : null
        );
    }
}
