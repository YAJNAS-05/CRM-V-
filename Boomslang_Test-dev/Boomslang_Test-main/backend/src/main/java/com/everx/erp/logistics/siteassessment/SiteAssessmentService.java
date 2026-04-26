package com.everx.erp.logistics.siteassessment;

import com.everx.erp.logistics.siteassessment.dto.CreateSiteAssessmentRequest;
import com.everx.erp.logistics.siteassessment.dto.SiteAssessmentDto;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.erp.salesorder.SalesOrder;
import com.everx.erp.salesorder.SalesOrderRepository;
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
public class SiteAssessmentService {

    private static final String[] VALID_READINESS = {
            "PENDING", "READY", "REMEDIATION_REQUIRED", "FAILED"
    };

    private final SiteAssessmentRepository siteAssessmentRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional
    public SiteAssessmentDto create(CreateSiteAssessmentRequest request) {
        validateReadiness(request.getOverallReadiness());

        SiteAssessment entity = new SiteAssessment();
        entity.setAssessmentNumber(generateSiteAssessmentNumber());
        applyRequest(entity, request);

        return toDto(siteAssessmentRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public SiteAssessmentDto getById(UUID id) {
        return toDto(siteAssessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Site assessment not found with id: " + id)));
    }

    @Transactional(readOnly = true)
    public Page<SiteAssessmentDto> getAll(Pageable pageable) {
        return siteAssessmentRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public SiteAssessmentDto getBySalesOrder(UUID salesOrderId) {
        return toDto(siteAssessmentRepository.findActiveBySalesOrderId(salesOrderId)
                .orElseThrow(() -> new EntityNotFoundException("Site assessment not found for sales order: " + salesOrderId)));
    }

    @Transactional(readOnly = true)
    public Page<SiteAssessmentDto> getByReadiness(String overallReadiness, Pageable pageable) {
        validateReadiness(overallReadiness);
        return siteAssessmentRepository.findByOverallReadiness(overallReadiness.toUpperCase(Locale.ROOT), pageable)
                .map(this::toDto);
    }

    @Transactional
    public SiteAssessmentDto update(UUID id, CreateSiteAssessmentRequest request) {
        SiteAssessment entity = siteAssessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Site assessment not found with id: " + id));

        if (request.getOverallReadiness() != null) {
            validateReadiness(request.getOverallReadiness());
        }

        applyPartialRequest(entity, request);
        return toDto(siteAssessmentRepository.save(entity));
    }

    @Transactional
    public void delete(UUID id) {
        SiteAssessment entity = siteAssessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Site assessment not found with id: " + id));
        entity.softDelete();
        siteAssessmentRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public boolean isSalesOrderSiteReady(UUID salesOrderId) {
        return siteAssessmentRepository.findActiveBySalesOrderId(salesOrderId)
                .map(siteAssessment -> "READY".equalsIgnoreCase(siteAssessment.getOverallReadiness()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public SiteAssessment requireReadyById(UUID id) {
        SiteAssessment assessment = siteAssessmentRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Site assessment not found with id: " + id));

        if (!"READY".equalsIgnoreCase(assessment.getOverallReadiness())) {
            throw new ValidationException("Shipment blocked. Site assessment is not READY. Current status: " + assessment.getOverallReadiness());
        }

        return assessment;
    }

    private void validateReadiness(String readiness) {
        String normalized = readiness == null ? "" : readiness.toUpperCase(Locale.ROOT);
        for (String valid : VALID_READINESS) {
            if (valid.equals(normalized)) {
                return;
            }
        }
        throw new ValidationException("Invalid readiness value: " + readiness);
    }

    private void applyRequest(SiteAssessment entity, CreateSiteAssessmentRequest request) {
        UUID resolvedAccountId = resolveAccountId(request.getSalesOrderId(), request.getAccountId());
        entity.setSalesOrderId(request.getSalesOrderId());
        entity.setAccountId(resolvedAccountId);
        entity.setAssessmentMethod(request.getAssessmentMethod());
        entity.setRoomDimensions(request.getRoomDimensions());
        entity.setPowerCompliant(request.getPowerCompliant());
        entity.setShieldingType(request.getShieldingType());
        entity.setCoolingCapacity(request.getCoolingCapacity());
        entity.setNetworkReadiness(request.getNetworkReadiness());
        entity.setOverallReadiness(request.getOverallReadiness().toUpperCase(Locale.ROOT));
        entity.setRemediationRequired(request.getRemediationRequired());
        entity.setAssessedDate(request.getAssessedDate());
        entity.setRoomSignOffDate(request.getRoomSignOffDate());
        entity.setNotes(request.getNotes());
    }

    private void applyPartialRequest(SiteAssessment entity, CreateSiteAssessmentRequest request) {
        UUID nextSalesOrderId = request.getSalesOrderId() != null
            ? request.getSalesOrderId()
            : entity.getSalesOrderId();
        UUID nextAccountId = request.getAccountId() != null
            ? request.getAccountId()
            : entity.getAccountId();

        entity.setSalesOrderId(nextSalesOrderId);
        entity.setAccountId(resolveAccountId(nextSalesOrderId, nextAccountId));

        if (request.getAssessmentMethod() != null) entity.setAssessmentMethod(request.getAssessmentMethod());
        if (request.getRoomDimensions() != null) entity.setRoomDimensions(request.getRoomDimensions());
        if (request.getPowerCompliant() != null) entity.setPowerCompliant(request.getPowerCompliant());
        if (request.getShieldingType() != null) entity.setShieldingType(request.getShieldingType());
        if (request.getCoolingCapacity() != null) entity.setCoolingCapacity(request.getCoolingCapacity());
        if (request.getNetworkReadiness() != null) entity.setNetworkReadiness(request.getNetworkReadiness());
        if (request.getOverallReadiness() != null) entity.setOverallReadiness(request.getOverallReadiness().toUpperCase(Locale.ROOT));
        if (request.getRemediationRequired() != null) entity.setRemediationRequired(request.getRemediationRequired());
        if (request.getAssessedDate() != null) entity.setAssessedDate(request.getAssessedDate());
        if (request.getRoomSignOffDate() != null) entity.setRoomSignOffDate(request.getRoomSignOffDate());
        if (request.getNotes() != null) entity.setNotes(request.getNotes());
    }

    private UUID resolveAccountId(UUID salesOrderId, UUID accountId) {
        UUID resolvedAccountId = accountId;

        if (salesOrderId != null) {
            SalesOrder salesOrder = salesOrderRepository.findByIdAndNotDeleted(salesOrderId)
                    .orElseThrow(() -> new EntityNotFoundException("Sales order not found with id: " + salesOrderId));

            if (resolvedAccountId == null) {
                resolvedAccountId = salesOrder.getAccountId();
            } else if (!resolvedAccountId.equals(salesOrder.getAccountId())) {
                throw new ValidationException("Account ID does not match the selected sales order");
            }
        }

        if (resolvedAccountId == null) {
            throw new ValidationException("Account ID is required when Sales Order is not provided");
        }

        return resolvedAccountId;
    }

    private String generateSiteAssessmentNumber() {
        return documentNumberGenerator.generate(
                "SA",
                candidate -> siteAssessmentRepository.findByAssessmentNumber(candidate).isPresent()
        );
    }

    private SiteAssessmentDto toDto(SiteAssessment entity) {
        return new SiteAssessmentDto(
                entity.getId(),
                entity.getAssessmentNumber(),
                entity.getSalesOrderId(),
                entity.getAccountId(),
                entity.getAssessmentMethod(),
                entity.getRoomDimensions(),
                entity.getPowerCompliant(),
                entity.getShieldingType(),
                entity.getCoolingCapacity(),
                entity.getNetworkReadiness(),
                entity.getOverallReadiness(),
                entity.getRemediationRequired(),
                entity.getAssessedDate(),
                entity.getRoomSignOffDate(),
                entity.getNotes(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toInstant() : null,
                entity.getUpdatedAt() != null ? entity.getUpdatedAt().toInstant() : null
        );
    }
}
