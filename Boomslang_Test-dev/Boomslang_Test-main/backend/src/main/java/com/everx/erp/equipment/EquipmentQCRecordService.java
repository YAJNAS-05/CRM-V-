package com.everx.erp.equipment;

import com.everx.erp.acquisition.EquipmentAcquisition;
import com.everx.erp.acquisition.EquipmentAcquisitionRepository;
import com.everx.erp.equipment.dto.CreateEquipmentQCRecordRequest;
import com.everx.erp.equipment.dto.EquipmentQCRecordDto;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentQCRecordService {

    private static final String[] VALID_SCAN_RESULTS = {"PASS", "FAIL"};
    private static final String[] VALID_OVERALL_RESULTS = {"PASS", "FAIL", "CONDITIONAL_PASS"};

    private final EquipmentQCRecordRepository qcRecordRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentAcquisitionRepository acquisitionRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public EquipmentQCRecordDto create(CreateEquipmentQCRecordRequest request) {
        UUID resolvedEquipmentId = resolveEquipmentId(request.getEquipmentId(), request.getAcquisitionId());

        Equipment equipment = equipmentRepository.findByIdAndNotDeleted(resolvedEquipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + resolvedEquipmentId));

        validateScanResult(request.getPhantomScanResult());
        validateOverallResult(request.getOverallResult());

        EquipmentQCRecord record = new EquipmentQCRecord();
        record.setQcNumber(generateQcNumber());
        applyRequest(record, request, resolvedEquipmentId);

        EquipmentQCRecord saved = qcRecordRepository.save(record);

        equipment.setQcTestDate(request.getQcDate() != null ? request.getQcDate() : LocalDate.now());
        equipment.setQcTestResult(request.getOverallResult().toUpperCase(Locale.ROOT));
        equipment.setQcNotes(request.getQcNotes());

        String overall = request.getOverallResult().toUpperCase(Locale.ROOT);
        if ("PASS".equals(overall) || "CONDITIONAL_PASS".equals(overall)) {
            equipment.setPhysicalStatus(PhysicalStatus.AVAILABLE);
        } else {
            equipment.setPhysicalStatus(PhysicalStatus.IN_MAINTENANCE);
        }

        equipmentRepository.save(equipment);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public EquipmentQCRecordDto getById(UUID id) {
        return toDto(qcRecordRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment QC record not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<EquipmentQCRecordDto> getAll(Pageable pageable) {
        return qcRecordRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentQCRecordDto> getByEquipmentId(UUID equipmentId, Pageable pageable) {
        return qcRecordRepository.findByEquipmentId(equipmentId, pageable).map(this::toDto);
    }

    @Transactional
    public EquipmentQCRecordDto update(UUID id, CreateEquipmentQCRecordRequest request) {
        EquipmentQCRecord record = qcRecordRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment QC record not found with id: " + id));

        if (request.getPhantomScanResult() != null) {
            validateScanResult(request.getPhantomScanResult());
        }
        if (request.getOverallResult() != null) {
            validateOverallResult(request.getOverallResult());
        }

        UUID nextAcquisitionId = request.getAcquisitionId() != null
            ? request.getAcquisitionId()
            : record.getAcquisitionId();
        UUID nextEquipmentId = request.getEquipmentId() != null
            ? request.getEquipmentId()
            : record.getEquipmentId();

        UUID resolvedEquipmentId = resolveEquipmentId(nextEquipmentId, nextAcquisitionId);
        record.setEquipmentId(resolvedEquipmentId);
        record.setAcquisitionId(nextAcquisitionId);

        if (request.getQcDate() != null) record.setQcDate(request.getQcDate());
        if (request.getEngineerAssigned() != null) record.setEngineerAssigned(request.getEngineerAssigned());
        if (request.getPhantomScanResult() != null) record.setPhantomScanResult(request.getPhantomScanResult().toUpperCase(Locale.ROOT));
        if (request.getImageQualityRating() != null) record.setImageQualityRating(request.getImageQualityRating());
        if (request.getOverallResult() != null) record.setOverallResult(request.getOverallResult().toUpperCase(Locale.ROOT));
        if (request.getQcNotes() != null) record.setQcNotes(request.getQcNotes());

        return toDto(qcRecordRepository.save(record));
    }

    @Transactional
    public void delete(UUID id) {
        EquipmentQCRecord record = qcRecordRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment QC record not found with id: " + id));
        record.softDelete();
        qcRecordRepository.save(record);
    }

    private void validateScanResult(String scanResult) {
        String normalized = scanResult == null ? "" : scanResult.toUpperCase(Locale.ROOT);
        for (String valid : VALID_SCAN_RESULTS) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid phantom scan result: " + scanResult);
    }

    private void validateOverallResult(String overallResult) {
        String normalized = overallResult == null ? "" : overallResult.toUpperCase(Locale.ROOT);
        for (String valid : VALID_OVERALL_RESULTS) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid QC overall result: " + overallResult);
    }

    private void applyRequest(EquipmentQCRecord record, CreateEquipmentQCRecordRequest request, UUID resolvedEquipmentId) {
        record.setEquipmentId(resolvedEquipmentId);
        record.setAcquisitionId(request.getAcquisitionId());
        record.setQcDate(request.getQcDate());
        record.setEngineerAssigned(request.getEngineerAssigned());
        record.setPhantomScanResult(request.getPhantomScanResult().toUpperCase(Locale.ROOT));
        record.setImageQualityRating(request.getImageQualityRating());
        record.setOverallResult(request.getOverallResult().toUpperCase(Locale.ROOT));
        record.setQcNotes(request.getQcNotes());
    }

    private EquipmentQCRecordDto toDto(EquipmentQCRecord record) {
        return new EquipmentQCRecordDto(
                record.getId(),
                record.getQcNumber(),
                record.getEquipmentId(),
                record.getAcquisitionId(),
                record.getQcDate(),
                record.getEngineerAssigned(),
                record.getPhantomScanResult(),
                record.getImageQualityRating(),
                record.getOverallResult(),
                record.getQcNotes(),
                record.getCreatedAt() != null ? record.getCreatedAt().toInstant() : null,
                record.getUpdatedAt() != null ? record.getUpdatedAt().toInstant() : null
        );
    }

    private UUID resolveEquipmentId(UUID equipmentId, UUID acquisitionId) {
        UUID resolvedEquipmentId = equipmentId;

        if (acquisitionId != null) {
            EquipmentAcquisition acquisition = acquisitionRepository.findByIdAndNotDeleted(acquisitionId)
                    .orElseThrow(() -> new EntityNotFoundException("Equipment acquisition not found with id: " + acquisitionId));

            if (acquisition.getEquipmentId() != null) {
                if (resolvedEquipmentId != null && !resolvedEquipmentId.equals(acquisition.getEquipmentId())) {
                    throw new ValidationException("Equipment ID does not match the selected acquisition");
                }
                resolvedEquipmentId = acquisition.getEquipmentId();
            }
        }

        if (resolvedEquipmentId == null) {
            throw new ValidationException("Equipment ID is required for QC records");
        }

        UUID equipmentIdToValidate = resolvedEquipmentId;
        equipmentRepository.findByIdAndNotDeleted(equipmentIdToValidate)
            .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + equipmentIdToValidate));

        return resolvedEquipmentId;
    }

    private String generateQcNumber() {
        return documentNumberGenerator.generate(
                "QC",
                candidate -> qcRecordRepository.findByQcNumber(candidate).isPresent()
        );
    }
}
