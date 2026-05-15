package com.everx.erp.fieldwork;

import com.everx.erp.fieldwork.dto.ChecklistItemDto;
import com.everx.erp.fieldwork.dto.FieldJobChecklistDto;
import com.everx.erp.fieldwork.dto.FieldJobCostDto;
import com.everx.erp.fieldwork.dto.FieldJobDto;
import com.everx.erp.fieldwork.dto.FieldJobReportDto;
import com.everx.erp.fieldwork.dto.FieldJobSignOffDto;
import com.everx.erp.fieldwork.dto.FieldJobTravelDto;
import com.everx.erp.numbering.DocumentNumberGenerator;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldJobOperationsService {

    private static final BigDecimal DEFAULT_FX_RATE = BigDecimal.ONE;

    private final FieldJobRepository fieldJobRepository;
    private final FieldJobCostRepository fieldJobCostRepository;
    private final FieldJobTravelRepository fieldJobTravelRepository;
    private final FieldJobChecklistRepository fieldJobChecklistRepository;
    private final FieldJobReportRepository fieldJobReportRepository;
    private final FieldJobSignOffRepository fieldJobSignOffRepository;
    private final FieldJobService fieldJobService;
    private final DocumentNumberGenerator documentNumberGenerator;

    @Transactional(readOnly = true)
    public List<com.everx.erp.fieldwork.dto.FieldJobDto> getUrgentJobs() {
        return fieldJobRepository.findUrgentJobs().stream()
                .map(fieldJobService::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FieldJobCostDto> getCosts(UUID jobId) {
        assertFieldJobExists(jobId);
        return fieldJobCostRepository.findByFieldJob_IdOrderByPostingDateAsc(jobId).stream()
                .map(this::toCostDto)
                .toList();
    }

    @Transactional
    public FieldJobCostDto addCost(UUID jobId, FieldJobCostDto request) {
        FieldJob job = getFieldJob(jobId);
        FieldJobCost cost = new FieldJobCost();
        cost.setFieldJob(job);
        applyCostRequest(cost, request);
        cost.setCreatedAt(OffsetDateTime.now());
        FieldJobCost saved = fieldJobCostRepository.save(cost);
        refreshReport(jobId);
        return toCostDto(saved);
    }

    @Transactional
    public FieldJobCostDto updateCost(UUID jobId, Long costId, FieldJobCostDto request) {
        FieldJobCost cost = fieldJobCostRepository.findByCostIdAndFieldJob_Id(costId, jobId)
                .orElseThrow(() -> new EntityNotFoundException("Field job cost not found: " + costId));
        applyCostRequest(cost, request);
        FieldJobCost saved = fieldJobCostRepository.save(cost);
        refreshReport(jobId);
        return toCostDto(saved);
    }

    @Transactional(readOnly = true)
    public List<FieldJobTravelDto> getTravel(UUID jobId) {
        assertFieldJobExists(jobId);
        return fieldJobTravelRepository.findByFieldJob_IdOrderByLegNumberAsc(jobId).stream()
                .map(this::toTravelDto)
                .toList();
    }

    @Transactional
    public FieldJobTravelDto addTravel(UUID jobId, FieldJobTravelDto request) {
        FieldJob job = getFieldJob(jobId);
        if (request.getDepartureDatetime() != null && request.getArrivalDatetime() != null
                && request.getArrivalDatetime().isBefore(request.getDepartureDatetime())) {
            throw new ValidationException("Arrival datetime cannot be before departure datetime");
        }

        FieldJobTravel travel = new FieldJobTravel();
        travel.setFieldJob(job);
        travel.setEngineerId(request.getEngineerId());
        travel.setLegNumber(resolveLegNumber(jobId, request.getLegNumber()));
        travel.setTravelMode(request.getTravelMode());
        travel.setDepartureCity(request.getDepartureCity());
        travel.setDepartureCountry(request.getDepartureCountry());
        travel.setDepartureDatetime(request.getDepartureDatetime());
        travel.setArrivalCity(request.getArrivalCity());
        travel.setArrivalCountry(request.getArrivalCountry());
        travel.setArrivalDatetime(request.getArrivalDatetime());
        travel.setFlightNumber(request.getFlightNumber());
        travel.setBookingReference(request.getBookingReference());
        travel.setTicketCostAmount(request.getTicketCostAmount());
        travel.setTicketCostCurrency(request.getTicketCostCurrency());
        travel.setAccommodationNights(request.getAccommodationNights());
        travel.setAccommodationCost(request.getAccommodationCost());
        travel.setAccommodationCurrency(request.getAccommodationCurrency());
        travel.setPerDiemDays(request.getPerDiemDays());
        travel.setPerDiemRateUsd(request.getPerDiemRateUsd());
        travel.setVisaRequired(Boolean.TRUE.equals(request.getVisaRequired()));
        travel.setVisaStatus(request.getVisaStatus());
        travel.setTravelNotes(request.getTravelNotes());

        FieldJobTravel saved = fieldJobTravelRepository.save(travel);
        return toTravelDto(saved);
    }

    @Transactional(readOnly = true)
    public FieldJobChecklistDto getChecklist(UUID jobId) {
        assertFieldJobExists(jobId);
        return fieldJobChecklistRepository.findByFieldJob_Id(jobId)
                .map(this::toChecklistDto)
                .orElseGet(() -> {
                    FieldJobChecklistDto dto = new FieldJobChecklistDto();
                    dto.setFieldJobId(jobId);
                    dto.setItems(new ArrayList<>());
                    return dto;
                });
    }

    @Transactional
    public FieldJobChecklistDto submitChecklist(UUID jobId, FieldJobChecklistDto request) {
        FieldJob job = getFieldJob(jobId);
        FieldJobChecklist checklist = fieldJobChecklistRepository.findByFieldJob_Id(jobId)
                .orElseGet(() -> {
                    FieldJobChecklist created = new FieldJobChecklist();
                    created.setFieldJob(job);
                    return created;
                });

        checklist.setGeneratedFromTemplate(request.getGeneratedFromTemplate());
        checklist.setOverallResult(request.getOverallResult());
        checklist.setCompletedBy(request.getCompletedBy());
        checklist.setCompletedAt(request.getCompletedAt() != null ? request.getCompletedAt() : OffsetDateTime.now());
        checklist.getItems().clear();

        if (request.getItems() != null) {
            for (ChecklistItemDto itemDto : request.getItems()) {
                FieldJobChecklistItem item = new FieldJobChecklistItem();
                item.setChecklist(checklist);
                item.setTemplateItemId(itemDto.getTemplateItemId());
                item.setSectionName(itemDto.getSectionName());
                item.setItemText(itemDto.getItemText());
                item.setResult(itemDto.getResult());
                item.setEngineerNote(itemDto.getEngineerNote());
                item.setPhotoAttached(Boolean.TRUE.equals(itemDto.getPhotoAttached()));
                item.setPhoto(itemDto.getPhoto());
                checklist.getItems().add(item);
            }
        }

        FieldJobChecklist saved = fieldJobChecklistRepository.save(checklist);
        refreshReport(jobId);
        return toChecklistDto(saved);
    }

    @Transactional(readOnly = true)
    public FieldJobReportDto getReport(UUID jobId) {
        return toReportDto(ensureReportForJob(jobId));
    }

    @Transactional
    public FieldJobReport ensureReportForJob(UUID jobId) {
        FieldJob job = getFieldJob(jobId);
        FieldJobReport report = fieldJobReportRepository.findByFieldJob_Id(jobId)
                .orElseGet(() -> {
                    FieldJobReport created = new FieldJobReport();
                    created.setFieldJob(job);
                    created.setReportNumber(documentNumberGenerator.generate(
                            "FJR",
                            fieldJobReportRepository::existsByReportNumber
                    ));
                    return created;
                });

        populateReport(report, job);
        return fieldJobReportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public byte[] getReportPdf(UUID jobId) {
        FieldJobReport report = ensureReportForJob(jobId);
        if (report.getReportPdfDocument() == null || !Boolean.TRUE.equals(report.getReportPdfGenerated())) {
            return renderReportPdf(jobId);
        }
        return report.getReportPdfDocument();
    }

    @Transactional
    public FieldJobDto processSignOff(UUID jobId, FieldJobSignOffDto request) {
        FieldJob job = getFieldJob(jobId);
        if (job.getJobStatus() != FieldJobStatus.PENDING_SIGN_OFF && job.getJobStatus() != FieldJobStatus.COMPLETED) {
            throw new ValidationException("Field job must be pending sign-off before client sign-off");
        }

        FieldJobReport report = ensureReportForJob(jobId);
        FieldJobSignOff signOff = fieldJobSignOffRepository.findByFieldJob_Id(jobId)
                .orElseGet(() -> {
                    FieldJobSignOff created = new FieldJobSignOff();
                    created.setFieldJob(job);
                    created.setReport(report);
                    created.setCreatedAt(OffsetDateTime.now());
                    return created;
                });

        signOff.setReport(report);
        signOff.setSignOffStatus(request.getSignOffStatus() != null ? request.getSignOffStatus() : SignOffStatus.NOT_OBTAINED);
        signOff.setClientRepresentative(request.getClientRepresentative());
        signOff.setClientDesignation(request.getClientDesignation());
        signOff.setSignedOffDate(request.getSignedOffDate());
        signOff.setSignedOffTime(request.getSignedOffTime());
        signOff.setClientSignatureImage(request.getClientSignatureImage());
        signOff.setClientComments(request.getClientComments());
        signOff.setClientSatisfaction(request.getClientSatisfaction());
        signOff.setDisputeReason(request.getDisputeReason());
        signOff.setDisputeResolution(request.getDisputeResolution());
        signOff.setDisputeResolvedDate(request.getDisputeResolvedDate());
        signOff.setWaiverReason(request.getWaiverReason());
        signOff.setWaiverApprovedBy(request.getWaiverApprovedBy());
        signOff.setEverxRepresentative(request.getEverxRepresentative());
        signOff.setSignOffLocation(request.getSignOffLocation());

        if ((signOff.getSignOffStatus() == SignOffStatus.OBTAINED || signOff.getSignOffStatus() == SignOffStatus.WAIVED)
                && job.getJobStatus() != FieldJobStatus.COMPLETED) {
            fieldJobService.markJobCompleted(jobId);
        }

        fieldJobSignOffRepository.save(signOff);
        return fieldJobService.getFieldJobById(jobId);
    }

    @Transactional
    public void refreshReport(UUID jobId) {
        if (fieldJobReportRepository.findByFieldJob_Id(jobId).isPresent()) {
            ensureReportForJob(jobId);
        }
    }

    @Transactional
    public byte[] renderReportPdf(UUID jobId) {
        FieldJobReport report = ensureReportForJob(jobId);
        String body = "%PDF-1.4\n"
                + "Field Job Report\n"
                + "Report Number: " + report.getReportNumber() + "\n"
                + "Job Summary: " + report.getJobSummary() + "\n"
                + "Work Performed: " + report.getWorkPerformedSummary() + "\n"
                + "%%EOF";
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        report.setReportPdfDocument(bytes);
        report.setReportPdfGenerated(true);
        fieldJobReportRepository.save(report);
        return bytes;
    }

    private void applyCostRequest(FieldJobCost cost, FieldJobCostDto request) {
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Cost quantity must be greater than zero");
        }
        if (request.getUnitCostAmount() == null || request.getUnitCostAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Unit cost amount must be greater than zero");
        }
        cost.setCostCategory(request.getCostCategory());
        cost.setDescription(request.getDescription());
        cost.setLinkedPartId(request.getLinkedPartId());
        cost.setQuantity(request.getQuantity());
        cost.setUnit(request.getUnit());
        cost.setUnitCostAmount(request.getUnitCostAmount());
        cost.setCostCurrency(request.getCostCurrency());
        cost.setFxRateToUsd(request.getFxRateToUsd() != null ? request.getFxRateToUsd() : DEFAULT_FX_RATE);
        cost.setReceiptReference(request.getReceiptReference());
        cost.setReceiptAttached(request.getReceiptAttached());
        cost.setGlAccount(request.getGlAccount());
        cost.setPostingDate(request.getPostingDate() != null ? request.getPostingDate() : LocalDate.now());
        cost.setIsPaid(Boolean.TRUE.equals(request.getIsPaid()));
        cost.setPaidDate(request.getPaidDate());
        cost.setCreatedBy(request.getCreatedBy());
        cost.setReversalOfCostId(request.getReversalOfCostId());

        BigDecimal totalLocal = request.getQuantity().multiply(request.getUnitCostAmount());
        cost.setTotalCostLocal(totalLocal);
        cost.setTotalCostUsd(totalLocal.multiply(cost.getFxRateToUsd()));
    }

    private Integer resolveLegNumber(UUID jobId, Integer requestedLegNumber) {
        if (requestedLegNumber != null) {
            return requestedLegNumber;
        }
        return fieldJobTravelRepository.findByFieldJob_IdOrderByLegNumberAsc(jobId).stream()
                .map(FieldJobTravel::getLegNumber)
                .filter(java.util.Objects::nonNull)
                .max(Comparator.naturalOrder())
                .map(value -> value + 1)
                .orElse(1);
    }

    private void populateReport(FieldJobReport report, FieldJob job) {
        FieldJobChecklist checklist = fieldJobChecklistRepository.findByFieldJob_Id(job.getId()).orElse(null);
        List<FieldJobCost> costs = fieldJobCostRepository.findByFieldJob_IdOrderByPostingDateAsc(job.getId());

        report.setReportGeneratedAt(OffsetDateTime.now());
        report.setReportGeneratedBy(job.getPrimaryEngineerName());
        report.setJobSummary(job.getJobType() + " for " + job.getClientOrSellerName() + " at " + job.getSiteCity());
        report.setWorkPerformedSummary(job.getInternalNotes() != null ? job.getInternalNotes() : "Work completed and awaiting sign-off");
        report.setEquipmentCondition(Boolean.TRUE.equals(job.getUnderWarranty()) ? "Under warranty" : "Billable service");
        report.setPostJobEquipmentStatus(job.getJobStatus().name());
        report.setChecklistSummaryResult(checklist != null ? checklist.getOverallResult() : null);
        report.setPartsUsedSummary(costs.stream()
                .filter(cost -> cost.getCostCategory() == CostCategory.SPARE_PARTS)
                .map(FieldJobCost::getDescription)
                .distinct()
                .reduce((left, right) -> left + ", " + right)
                .orElse(null));
        report.setTotalJobCostUsd(costs.stream()
                .map(FieldJobCost::getTotalCostUsd)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        report.setIssuesFoundDuringJob(job.getClientBriefNotes());
        report.setRecommendationsToClient(job.getInternalNotes());
        report.setNextServiceDueDate(job.getActualEndDate() != null ? job.getActualEndDate().toLocalDate().plusMonths(6) : null);
        report.setIsLocked(job.getJobStatus() == FieldJobStatus.COMPLETED);
    }

    private FieldJob getFieldJob(UUID jobId) {
        return fieldJobRepository.findByIdAndNotDeleted(jobId)
                .orElseThrow(() -> new EntityNotFoundException("Field job not found with id: " + jobId));
    }

    private void assertFieldJobExists(UUID jobId) {
        getFieldJob(jobId);
    }

    private FieldJobCostDto toCostDto(FieldJobCost cost) {
        FieldJobCostDto dto = new FieldJobCostDto();
        dto.setCostId(cost.getCostId());
        dto.setVersion(cost.getVersion());
        dto.setFieldJobId(cost.getFieldJob().getId());
        dto.setCostCategory(cost.getCostCategory());
        dto.setDescription(cost.getDescription());
        dto.setLinkedPartId(cost.getLinkedPartId());
        dto.setQuantity(cost.getQuantity());
        dto.setUnit(cost.getUnit());
        dto.setUnitCostAmount(cost.getUnitCostAmount());
        dto.setCostCurrency(cost.getCostCurrency());
        dto.setFxRateToUsd(cost.getFxRateToUsd());
        dto.setTotalCostLocal(cost.getTotalCostLocal());
        dto.setTotalCostUsd(cost.getTotalCostUsd());
        dto.setReceiptReference(cost.getReceiptReference());
        dto.setReceiptAttached(cost.getReceiptAttached());
        dto.setGlAccount(cost.getGlAccount());
        dto.setPostingDate(cost.getPostingDate());
        dto.setIsPaid(cost.getIsPaid());
        dto.setPaidDate(cost.getPaidDate());
        dto.setCreatedBy(cost.getCreatedBy());
        dto.setCreatedAt(cost.getCreatedAt());
        dto.setReversalOfCostId(cost.getReversalOfCostId());
        return dto;
    }

    private FieldJobTravelDto toTravelDto(FieldJobTravel travel) {
        FieldJobTravelDto dto = new FieldJobTravelDto();
        dto.setTravelId(travel.getTravelId());
        dto.setFieldJobId(travel.getFieldJob().getId());
        dto.setEngineerId(travel.getEngineerId());
        dto.setLegNumber(travel.getLegNumber());
        dto.setTravelMode(travel.getTravelMode());
        dto.setDepartureCity(travel.getDepartureCity());
        dto.setDepartureCountry(travel.getDepartureCountry());
        dto.setDepartureDatetime(travel.getDepartureDatetime());
        dto.setArrivalCity(travel.getArrivalCity());
        dto.setArrivalCountry(travel.getArrivalCountry());
        dto.setArrivalDatetime(travel.getArrivalDatetime());
        dto.setFlightNumber(travel.getFlightNumber());
        dto.setBookingReference(travel.getBookingReference());
        dto.setTicketCostAmount(travel.getTicketCostAmount());
        dto.setTicketCostCurrency(travel.getTicketCostCurrency());
        dto.setAccommodationNights(travel.getAccommodationNights());
        dto.setAccommodationCost(travel.getAccommodationCost());
        dto.setAccommodationCurrency(travel.getAccommodationCurrency());
        dto.setPerDiemDays(travel.getPerDiemDays());
        dto.setPerDiemRateUsd(travel.getPerDiemRateUsd());
        dto.setVisaRequired(travel.getVisaRequired());
        dto.setVisaStatus(travel.getVisaStatus());
        dto.setTravelNotes(travel.getTravelNotes());
        return dto;
    }

    private FieldJobChecklistDto toChecklistDto(FieldJobChecklist checklist) {
        FieldJobChecklistDto dto = new FieldJobChecklistDto();
        dto.setChecklistId(checklist.getChecklistId());
        dto.setFieldJobId(checklist.getFieldJob().getId());
        dto.setGeneratedFromTemplate(checklist.getGeneratedFromTemplate());
        dto.setOverallResult(checklist.getOverallResult());
        dto.setCompletedBy(checklist.getCompletedBy());
        dto.setCompletedAt(checklist.getCompletedAt());
        dto.setItems(checklist.getItems().stream().map(item -> {
            ChecklistItemDto itemDto = new ChecklistItemDto();
            itemDto.setItemInstanceId(item.getItemInstanceId());
            itemDto.setChecklistId(checklist.getChecklistId());
            itemDto.setTemplateItemId(item.getTemplateItemId());
            itemDto.setSectionName(item.getSectionName());
            itemDto.setItemText(item.getItemText());
            itemDto.setResult(item.getResult());
            itemDto.setEngineerNote(item.getEngineerNote());
            itemDto.setPhotoAttached(item.getPhotoAttached());
            itemDto.setPhoto(item.getPhoto());
            return itemDto;
        }).toList());
        return dto;
    }

    private FieldJobReportDto toReportDto(FieldJobReport report) {
        FieldJobReportDto dto = new FieldJobReportDto();
        dto.setReportId(report.getReportId());
        dto.setVersion(report.getVersion());
        dto.setFieldJobId(report.getFieldJob().getId());
        dto.setReportNumber(report.getReportNumber());
        dto.setReportGeneratedAt(report.getReportGeneratedAt());
        dto.setReportGeneratedBy(report.getReportGeneratedBy());
        dto.setJobSummary(report.getJobSummary());
        dto.setWorkPerformedSummary(report.getWorkPerformedSummary());
        dto.setEquipmentCondition(report.getEquipmentCondition());
        dto.setPostJobEquipmentStatus(report.getPostJobEquipmentStatus());
        dto.setChecklistSummaryResult(report.getChecklistSummaryResult());
        dto.setPartsUsedSummary(report.getPartsUsedSummary());
        dto.setTotalJobCostUsd(report.getTotalJobCostUsd());
        dto.setIssuesFoundDuringJob(report.getIssuesFoundDuringJob());
        dto.setRecommendationsToClient(report.getRecommendationsToClient());
        dto.setNextServiceDueDate(report.getNextServiceDueDate());
        dto.setReportPdfGenerated(report.getReportPdfGenerated());
        dto.setIsLocked(report.getIsLocked());
        dto.setReversalOfReportId(report.getReversalOfReportId());
        dto.setReversalReason(report.getReversalReason());
        dto.setReversedAt(report.getReversedAt());
        dto.setReversedBy(report.getReversedBy());
        return dto;
    }
}