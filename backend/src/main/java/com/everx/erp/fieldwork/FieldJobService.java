package com.everx.erp.fieldwork;

import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.fieldwork.dto.CreateFieldJobRequest;
import com.everx.erp.fieldwork.dto.FieldJobDto;
import com.everx.erp.fieldwork.dto.UpdateFieldJobRequest;
import com.everx.erp.warranty.Warranty;
import com.everx.erp.warranty.WarrantyRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceService;
import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldJobService {

    private final FieldJobRepository fieldJobRepository;
    private final EquipmentRepository equipmentRepository;
    private final WarrantyRepository warrantyRepository;
    private final InvoiceService invoiceService;

    @Transactional
    public FieldJobDto createFieldJob(CreateFieldJobRequest request) {
        if (fieldJobRepository.findByJobNumber(request.getJobNumber()).isPresent()) {
            throw new ValidationException("Field job with job number " + request.getJobNumber() + " already exists");
        }

        validateSchedule(request.getScheduledStartDate(), request.getScheduledEndDate());

        if (request.getEquipmentId() != null) {
            equipmentRepository.findByIdAndNotDeleted(request.getEquipmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + request.getEquipmentId()));
        }

        FieldJob job = new FieldJob();
        applyCreateRequest(job, request);

        if (request.getEquipmentId() != null && request.getUnderWarranty() == null) {
            resolveWarrantyStatus(job, request.getEquipmentId());
        } else {
            job.setUnderWarranty(Boolean.TRUE.equals(request.getUnderWarranty()));
            job.setBillable(request.getBillable() != null ? request.getBillable() : !Boolean.TRUE.equals(job.getUnderWarranty()));
        }

        FieldJob saved = fieldJobRepository.save(job);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public FieldJobDto getFieldJobById(UUID id) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));
        return toDto(job);
    }

    @Transactional(readOnly = true)
    public Page<FieldJobDto> getFieldJobs(Pageable pageable) {
        return fieldJobRepository.findAllNotDeleted(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<FieldJobDto> getFieldJobsByStatus(FieldJobStatus status, Pageable pageable) {
        return fieldJobRepository.findByStatus(status, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<FieldJobDto> getFieldJobsByPriority(JobPriority priority, Pageable pageable) {
        return fieldJobRepository.findByPriority(priority, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<FieldJobDto> getFieldJobsByPrimaryEngineer(UUID engineerId, Pageable pageable) {
        return fieldJobRepository.findByPrimaryEngineer(engineerId, pageable).map(this::toDto);
    }

    @Transactional
    public FieldJobDto updateFieldJob(UUID id, UpdateFieldJobRequest request) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));

        if (request.getJobNumber() != null && !request.getJobNumber().equals(job.getJobNumber())) {
            if (fieldJobRepository.findByJobNumber(request.getJobNumber()).isPresent()) {
                throw new ValidationException("Field job with job number " + request.getJobNumber() + " already exists");
            }
            job.setJobNumber(request.getJobNumber());
        }

        updateIfPresent(request.getJobType(), job::setJobType);
        updateIfPresent(request.getJobStatus(), status -> {
            job.setJobStatus(status);
            applyCompletionIfNeeded(job, status, null);
        });
        updateIfPresent(request.getPriority(), job::setPriority);

        updateIfPresent(request.getLinkedEntity(), job::setLinkedEntity);
        updateIfPresent(request.getLinkedEquipmentSku(), job::setLinkedEquipmentSku);
        updateIfPresent(request.getLinkedLeadId(), job::setLinkedLeadId);
        updateIfPresent(request.getLinkedPoId(), job::setLinkedPoId);
        updateIfPresent(request.getLinkedSalesOrderId(), job::setLinkedSalesOrderId);
        updateIfPresent(request.getLinkedShipmentId(), job::setLinkedShipmentId);
        updateIfPresent(request.getLinkedWarrantyId(), job::setLinkedWarrantyId);
        updateIfPresent(request.getLinkedInvoiceId(), job::setLinkedInvoiceId);

        updateIfPresent(request.getAccountId(), job::setAccountId);

        if (request.getEquipmentId() != null && !request.getEquipmentId().equals(job.getEquipmentId())) {
            equipmentRepository.findByIdAndNotDeleted(request.getEquipmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Equipment not found with id: " + request.getEquipmentId()));
            job.setEquipmentId(request.getEquipmentId());
            resolveWarrantyStatus(job, request.getEquipmentId());
        }

        updateIfPresent(request.getClientOrSellerName(), job::setClientOrSellerName);
        updateIfPresent(request.getSiteContactName(), job::setSiteContactName);
        updateIfPresent(request.getSiteContactPhone(), job::setSiteContactPhone);
        updateIfPresent(request.getSiteContactEmail(), job::setSiteContactEmail);
        updateIfPresent(request.getSiteAddressLine1(), job::setSiteAddressLine1);
        updateIfPresent(request.getSiteAddressLine2(), job::setSiteAddressLine2);
        updateIfPresent(request.getSiteCity(), job::setSiteCity);
        updateIfPresent(request.getSiteCountry(), job::setSiteCountry);
        updateIfPresent(request.getSiteTimezone(), job::setSiteTimezone);

        if (request.getScheduledStartDate() != null || request.getScheduledEndDate() != null) {
            OffsetDateTime start = request.getScheduledStartDate() != null ? request.getScheduledStartDate() : job.getScheduledStartDate();
            OffsetDateTime end = request.getScheduledEndDate() != null ? request.getScheduledEndDate() : job.getScheduledEndDate();
            validateSchedule(start, end);
            job.setScheduledStartDate(start);
            job.setScheduledEndDate(end);
        }

        updateIfPresent(request.getEstimatedDurationDays(), job::setEstimatedDurationDays);
        updateIfPresent(request.getActualStartDate(), job::setActualStartDate);
        updateIfPresent(request.getActualEndDate(), job::setActualEndDate);
        updateIfPresent(request.getActualDurationDays(), job::setActualDurationDays);

        updateIfPresent(request.getPrimaryEngineerType(), job::setPrimaryEngineerType);
        updateIfPresent(request.getPrimaryEngineerId(), job::setPrimaryEngineerId);
        updateIfPresent(request.getPrimaryEngineerName(), job::setPrimaryEngineerName);
        updateIfPresent(request.getSecondaryEngineerId(), job::setSecondaryEngineerId);
        updateIfPresent(request.getSecondaryEngineerName(), job::setSecondaryEngineerName);
        updateIfPresent(request.getEngineerAssignedDate(), job::setEngineerAssignedDate);
        updateIfPresent(request.getEngineerAccepted(), job::setEngineerAccepted);
        updateIfPresent(request.getEngineerAcceptedDate(), job::setEngineerAcceptedDate);

        updateIfPresent(request.getInternalNotes(), job::setInternalNotes);
        updateIfPresent(request.getClientBriefNotes(), job::setClientBriefNotes);

        if (request.getUnderWarranty() != null) {
            job.setUnderWarranty(request.getUnderWarranty());
        }
        if (request.getBillable() != null) {
            job.setBillable(request.getBillable());
        }
        updateIfPresent(request.getCostEstimate(), job::setCostEstimate);
        updateIfPresent(request.getCostActual(), job::setCostActual);
        updateIfPresent(request.getCurrency(), job::setCurrency);

        applyCompletionIfNeeded(job, job.getJobStatus(), request.getActualEndDate());

        FieldJob saved = fieldJobRepository.save(job);
        return toDto(saved);
    }

    @Transactional
    public FieldJobDto completeFieldJob(UUID id, String completionNotes) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));

        if (completionNotes != null && (job.getInternalNotes() == null || job.getInternalNotes().isBlank())) {
            job.setInternalNotes(completionNotes);
        }

        applyCompletionIfNeeded(job, FieldJobStatus.COMPLETED, OffsetDateTime.now());
        FieldJob saved = fieldJobRepository.save(job);
        return toDto(saved);
    }

    @Transactional
    public FieldJobDto assignEngineer(UUID id, UUID engineerId, EngineerType engineerType, String engineerName) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));

        job.setPrimaryEngineerId(engineerId);
        job.setPrimaryEngineerType(engineerType != null ? engineerType : EngineerType.INTERNAL);
        job.setPrimaryEngineerName(engineerName);
        job.setEngineerAssignedDate(OffsetDateTime.now());
        job.setJobStatus(FieldJobStatus.ENGINEER_ASSIGNED);

        FieldJob saved = fieldJobRepository.save(job);
        return toDto(saved);
    }

    @Transactional
    public FieldJobDto startJob(UUID id) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));

        job.setJobStatus(FieldJobStatus.IN_PROGRESS);
        if (job.getActualStartDate() == null) {
            job.setActualStartDate(OffsetDateTime.now());
        }

        FieldJob saved = fieldJobRepository.save(job);
        return toDto(saved);
    }

    @Transactional
    public void deleteFieldJob(UUID id) {
        FieldJob job = fieldJobRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + id));
        job.softDelete();
        fieldJobRepository.save(job);
    }

    private void applyCreateRequest(FieldJob job, CreateFieldJobRequest request) {
        job.setJobNumber(request.getJobNumber());
        job.setJobType(request.getJobType());
        job.setJobStatus(request.getJobStatus() != null ? request.getJobStatus() : FieldJobStatus.DRAFT);
        job.setPriority(request.getPriority() != null ? request.getPriority() : JobPriority.ROUTINE);
        job.setLinkedEntity(request.getLinkedEntity());
        job.setLinkedEquipmentSku(request.getLinkedEquipmentSku());
        job.setLinkedLeadId(request.getLinkedLeadId());
        job.setLinkedPoId(request.getLinkedPoId());
        job.setLinkedSalesOrderId(request.getLinkedSalesOrderId());
        job.setLinkedShipmentId(request.getLinkedShipmentId());
        job.setLinkedWarrantyId(request.getLinkedWarrantyId());
        job.setLinkedInvoiceId(request.getLinkedInvoiceId());
        job.setAccountId(request.getAccountId());
        job.setEquipmentId(request.getEquipmentId());
        job.setClientOrSellerName(request.getClientOrSellerName());
        job.setSiteContactName(request.getSiteContactName());
        job.setSiteContactPhone(request.getSiteContactPhone());
        job.setSiteContactEmail(request.getSiteContactEmail());
        job.setSiteAddressLine1(request.getSiteAddressLine1());
        job.setSiteAddressLine2(request.getSiteAddressLine2());
        job.setSiteCity(request.getSiteCity());
        job.setSiteCountry(request.getSiteCountry());
        job.setSiteTimezone(request.getSiteTimezone());
        job.setScheduledStartDate(request.getScheduledStartDate());
        job.setScheduledEndDate(request.getScheduledEndDate());
        job.setEstimatedDurationDays(request.getEstimatedDurationDays());
        job.setActualStartDate(request.getActualStartDate());
        job.setActualEndDate(request.getActualEndDate());
        job.setActualDurationDays(request.getActualDurationDays());
        job.setPrimaryEngineerType(request.getPrimaryEngineerType());
        job.setPrimaryEngineerId(request.getPrimaryEngineerId());
        job.setPrimaryEngineerName(request.getPrimaryEngineerName());
        job.setSecondaryEngineerId(request.getSecondaryEngineerId());
        job.setSecondaryEngineerName(request.getSecondaryEngineerName());
        job.setEngineerAssignedDate(request.getEngineerAssignedDate());
        job.setEngineerAccepted(request.getEngineerAccepted());
        job.setEngineerAcceptedDate(request.getEngineerAcceptedDate());
        job.setInternalNotes(request.getInternalNotes());
        job.setClientBriefNotes(request.getClientBriefNotes());
        if (request.getBillable() != null) {
            job.setBillable(request.getBillable());
        }
        if (request.getUnderWarranty() != null) {
            job.setUnderWarranty(request.getUnderWarranty());
        }
        job.setCostEstimate(request.getCostEstimate());
        job.setCostActual(request.getCostActual());
        job.setCurrency(request.getCurrency());
    }

    private void validateSchedule(OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null) {
            return;
        }
        if (end.isBefore(start)) {
            throw new ValidationException("Scheduled end date cannot be before start date");
        }
    }

    private void resolveWarrantyStatus(FieldJob job, UUID equipmentId) {
        List<Warranty> warranties = warrantyRepository.findByEquipmentId(equipmentId);
        Warranty activeWarranty = warranties.stream()
                .filter(w -> "ACTIVE".equalsIgnoreCase(w.getStatus()))
                .filter(w -> {
                    LocalDate startDate = w.getStartDate();
                    LocalDate endDate = w.getEndDate();
                    LocalDate reference = LocalDate.now();
                    return (startDate == null || !reference.isBefore(startDate))
                            && (endDate == null || !reference.isAfter(endDate));
                })
                .findFirst()
                .orElse(null);

        if (activeWarranty != null) {
            job.setUnderWarranty(true);
            job.setLinkedWarrantyId(activeWarranty.getId());
            job.setBillable(false);
        } else {
            job.setUnderWarranty(false);
            job.setBillable(true);
        }
    }

    private void applyCompletionIfNeeded(FieldJob job, FieldJobStatus status, OffsetDateTime completedAt) {
        if (status != FieldJobStatus.COMPLETED) {
            return;
        }

        job.setJobStatus(FieldJobStatus.COMPLETED);
        if (job.getActualStartDate() == null) {
            job.setActualStartDate(job.getScheduledStartDate());
        }
        if (job.getActualEndDate() == null) {
            job.setActualEndDate(completedAt != null ? completedAt : OffsetDateTime.now());
        }

        if (job.getActualStartDate() != null && job.getActualEndDate() != null) {
            long days = java.time.Duration.between(job.getActualStartDate(), job.getActualEndDate()).toDays();
            job.setActualDurationDays((int) Math.max(days, 0));
        }

        if (Boolean.TRUE.equals(job.getBillable())) {
            createInvoiceIfRequired(job);
        }
    }

    private void createInvoiceIfRequired(FieldJob job) {
        if (job.getLinkedInvoiceId() != null) {
            return;
        }
        if (job.getAccountId() == null) {
            return;
        }

        BigDecimal amount = job.getCostActual() != null ? job.getCostActual() : job.getCostEstimate();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        String currency = job.getCurrency() != null ? job.getCurrency() : "AUD";
        CreateInvoiceRequest invoiceRequest = CreateInvoiceRequest.builder()
                .invoiceNumber(generateInvoiceNumber(job))
                .accountId(job.getAccountId())
                .type(Invoice.InvoiceType.TAX_INVOICE)
                .entity(Invoice.InvoiceEntity.AUSTRALIA)
                .issueDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(30))
                .currency(currency)
                .subtotal(amount)
                .taxAmount(amount.multiply(new BigDecimal("0.10")))
                .totalAmount(amount.multiply(new BigDecimal("1.10")))
                .notes("Field job billing - Job: " + job.getJobNumber())
                .build();

        try {
            var invoiceResponse = invoiceService.createInvoice(invoiceRequest);
            job.setLinkedInvoiceId(invoiceResponse.getId());
        } catch (Exception e) {
            System.err.println("Failed to create invoice for field job " + job.getJobNumber() + ": " + e.getMessage());
        }
    }

    private String generateInvoiceNumber(FieldJob job) {
        return "INV-FJ-" + job.getJobNumber();
    }

    private FieldJobDto toDto(FieldJob job) {
        FieldJobDto dto = new FieldJobDto();
        dto.setFieldJobId(job.getId());
        dto.setVersion(job.getVersion());
        dto.setJobNumber(job.getJobNumber());
        dto.setJobType(job.getJobType());
        dto.setJobStatus(job.getJobStatus());
        dto.setPriority(job.getPriority());
        dto.setLinkedEntity(job.getLinkedEntity());
        dto.setLinkedEquipmentSku(job.getLinkedEquipmentSku());
        dto.setLinkedLeadId(job.getLinkedLeadId());
        dto.setLinkedPoId(job.getLinkedPoId());
        dto.setLinkedSalesOrderId(job.getLinkedSalesOrderId());
        dto.setLinkedShipmentId(job.getLinkedShipmentId());
        dto.setLinkedWarrantyId(job.getLinkedWarrantyId());
        dto.setLinkedInvoiceId(job.getLinkedInvoiceId());
        dto.setAccountId(job.getAccountId());
        dto.setEquipmentId(job.getEquipmentId());
        dto.setClientOrSellerName(job.getClientOrSellerName());
        dto.setSiteContactName(job.getSiteContactName());
        dto.setSiteContactPhone(job.getSiteContactPhone());
        dto.setSiteContactEmail(job.getSiteContactEmail());
        dto.setSiteAddressLine1(job.getSiteAddressLine1());
        dto.setSiteAddressLine2(job.getSiteAddressLine2());
        dto.setSiteCity(job.getSiteCity());
        dto.setSiteCountry(job.getSiteCountry());
        dto.setSiteTimezone(job.getSiteTimezone());
        dto.setScheduledStartDate(job.getScheduledStartDate());
        dto.setScheduledEndDate(job.getScheduledEndDate());
        dto.setEstimatedDurationDays(job.getEstimatedDurationDays());
        dto.setActualStartDate(job.getActualStartDate());
        dto.setActualEndDate(job.getActualEndDate());
        dto.setActualDurationDays(job.getActualDurationDays());
        dto.setPrimaryEngineerType(job.getPrimaryEngineerType());
        dto.setPrimaryEngineerId(job.getPrimaryEngineerId());
        dto.setPrimaryEngineerName(job.getPrimaryEngineerName());
        dto.setSecondaryEngineerId(job.getSecondaryEngineerId());
        dto.setSecondaryEngineerName(job.getSecondaryEngineerName());
        dto.setEngineerAssignedDate(job.getEngineerAssignedDate());
        dto.setEngineerAccepted(job.getEngineerAccepted());
        dto.setEngineerAcceptedDate(job.getEngineerAcceptedDate());
        dto.setInternalNotes(job.getInternalNotes());
        dto.setClientBriefNotes(job.getClientBriefNotes());
        dto.setBillable(job.getBillable());
        dto.setUnderWarranty(job.getUnderWarranty());
        dto.setCostEstimate(job.getCostEstimate());
        dto.setCostActual(job.getCostActual());
        dto.setCurrency(job.getCurrency());
        if (job.getCreatedAt() != null) {
            dto.setCreatedAt(job.getCreatedAt().toInstant());
        }
        if (job.getUpdatedAt() != null) {
            dto.setUpdatedAt(job.getUpdatedAt().toInstant());
        }
        return dto;
    }

    private <T> void updateIfPresent(T value, java.util.function.Consumer<T> setter) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
