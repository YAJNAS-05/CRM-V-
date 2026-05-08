package com.everx.fieldwork.service;

import com.everx.fieldwork.dto.*;
import com.everx.fieldwork.entity.FieldJob;
import com.everx.fieldwork.entity.FieldJobNote;
import com.everx.fieldwork.entity.FieldWorkAsset;
import com.everx.fieldwork.entity.Technician;
import com.everx.fieldwork.repository.FieldJobRepository;
import com.everx.fieldwork.repository.FieldJobNoteRepository;
import com.everx.fieldwork.repository.FieldWorkAssetRepository;
import com.everx.fieldwork.repository.TechnicianRepository;
import com.everx.shared.dto.ApiResponse;
import com.everx.shared.exception.ResourceNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FieldJobService {

    private final FieldJobRepository fieldJobRepository;
    private final FieldJobNoteRepository fieldJobNoteRepository;
    private final FieldWorkAssetRepository fieldWorkAssetRepository;
    private final TechnicianRepository technicianRepository;
    private final GpsTrackingService gpsTrackingService;
    private final NotificationService notificationService;
    private final ErpIntegrationService erpIntegrationService;

    public ApiResponse<Page<FieldJobDto>> getAllFieldJobs(Pageable pageable) {
        log.info("Getting all field jobs with pagination: {}", pageable);
        
        Page<FieldJob> fieldJobs = fieldJobRepository.findAll(pageable);
        Page<FieldJobDto> fieldJobDtos = fieldJobs.map(this::convertToDto);
        
        return ApiResponse.ok(fieldJobDtos, "Field jobs retrieved successfully");
    }

    public ApiResponse<FieldJobDto> getFieldJobById(UUID jobId) {
        log.info("Getting field job by ID: {}", jobId);
        
        FieldJob fieldJob = fieldJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Field job not found with ID: " + jobId));
        
        FieldJobDto fieldJobDto = convertToDto(fieldJob);
        
        return ApiResponse.ok(fieldJobDto, "Field job retrieved successfully");
    }

    public ApiResponse<FieldJobDto> getFieldJobByJobNumber(String jobNumber) {
        log.info("Getting field job by job number: {}", jobNumber);
        
        FieldJob fieldJob = fieldJobRepository.findByJobNumber(jobNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Field job not found with job number: " + jobNumber));
        
        FieldJobDto fieldJobDto = convertToDto(fieldJob);
        
        return ApiResponse.ok(fieldJobDto, "Field job retrieved successfully");
    }

    public ApiResponse<FieldJobDto> createFieldJob(CreateFieldJobRequest request) {
        log.info("Creating new field job: {}", request.getTitle());
        
        // Validate request
        validateCreateFieldJobRequest(request);
        
        // Generate unique job number
        String jobNumber = generateJobNumber();
        
        // Validate technician availability
        if (request.getAssignedTechnicianId() != null) {
            validateTechnicianAvailability(request.getAssignedTechnicianId(), 
                    request.getScheduledDate(), request.getEstimatedEndDate());
        }
        
        // Create field job entity
        FieldJob fieldJob = FieldJob.builder()
                .id(UUID.randomUUID())
                .jobNumber(jobNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .customerEmail(request.getCustomerEmail())
                .status(FieldJob.JobStatus.DRAFT)
                .priority(request.getPriority())
                .category(request.getCategory())
                .scheduledDate(request.getScheduledDate())
                .estimatedStartDate(request.getEstimatedStartDate())
                .estimatedEndDate(request.getEstimatedEndDate())
                .estimatedDuration(request.getEstimatedDuration())
                .estimatedCost(request.getEstimatedCost())
                .assignedTechnicianId(request.getAssignedTechnicianId())
                .requiresParts(request.getRequiresParts())
                .requiresSpecialEquipment(request.getRequiresSpecialEquipment())
                .specialRequirements(request.getSpecialRequirements())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .fullAddress(request.getFullAddress())
                .complexity(request.getComplexity())
                .requiredTechnicianLevel(request.getRequiredTechnicianLevel())
                .requiredSkills(request.getRequiredSkills())
                .weatherDependent(request.getWeatherDependent())
                .safetyEquipmentRequired(request.getSafetyEquipmentRequired())
                .safetyRequirements(request.getSafetyRequirements())
                .erpAssetId(request.getErpAssetId())
                .erpWorkOrderId(request.getErpWorkOrderId())
                .crmLeadId(request.getCrmLeadId())
                .crmAccountId(request.getCrmAccountId())
                .createdBy(request.getCreatedBy())
                .lastModifiedBy(request.getCreatedBy())
                .build();
        
        // Save field job
        FieldJob savedFieldJob = fieldJobRepository.save(fieldJob);
        
        // Create initial note
        createInitialNote(savedFieldJob, request.getCreatedBy());
        
        // Send notifications
        if (request.getAssignedTechnicianId() != null) {
            notificationService.sendJobAssignmentNotification(savedFieldJob);
        }
        
        // Integrate with ERP if needed
        if (request.getErpWorkOrderId() != null) {
            erpIntegrationService.syncJobWithErp(savedFieldJob);
        }
        
        FieldJobDto fieldJobDto = convertToDto(savedFieldJob);
        
        return ApiResponse.created(fieldJobDto, "Field job created successfully");
    }

    public ApiResponse<FieldJobDto> updateFieldJob(UUID jobId, UpdateFieldJobRequest request) {
        log.info("Updating field job: {}", jobId);
        
        FieldJob fieldJob = fieldJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Field job not found with ID: " + jobId));
        
        // Validate technician availability if changed
        if (request.getAssignedTechnicianId() != null && 
            !request.getAssignedTechnicianId().equals(fieldJob.getAssignedTechnicianId())) {
            validateTechnicianAvailability(request.getAssignedTechnicianId(), 
                    request.getScheduledDate(), request.getEstimatedEndDate());
        }
        
        // Update fields
        updateFieldJobFromRequest(fieldJob, request);
        fieldJob.setLastModifiedBy(request.getLastModifiedBy());
        
        // Save updated field job
        FieldJob updatedFieldJob = fieldJobRepository.save(fieldJob);
        
        // Create update note
        createUpdateNote(updatedFieldJob, request.getLastModifiedBy());
        
        // Send notifications if technician changed
        if (request.getAssignedTechnicianId() != null && 
            !request.getAssignedTechnicianId().equals(fieldJob.getAssignedTechnicianId())) {
            notificationService.sendJobAssignmentNotification(updatedFieldJob);
        }
        
        FieldJobDto fieldJobDto = convertToDto(updatedFieldJob);
        
        return ApiResponse.ok(fieldJobDto, "Field job updated successfully");
    }

    public ApiResponse<Void> deleteFieldJob(UUID jobId) {
        log.info("Deleting field job: {}", jobId);
        
        FieldJob fieldJob = fieldJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Field job not found with ID: " + jobId));
        
        // Check if job can be deleted (not in progress)
        if (fieldJob.getStatus() == FieldJob.JobStatus.IN_PROGRESS) {
            throw new ValidationException("Cannot delete job that is in progress");
        }
        
        // Delete related entities
        fieldJobNoteRepository.deleteByFieldJobId(fieldJob.getId().toString());
        fieldWorkAssetRepository.deleteByFieldJobId(fieldJob.getId().toString());
        
        // Delete field job
        fieldJobRepository.delete(fieldJob);
        
        return ApiResponse.noContent("Field job deleted successfully");
    }

    public ApiResponse<FieldJobDto> updateJobStatus(UUID jobId, UpdateJobStatusRequest request) {
        log.info("Updating job status: {} to {}", jobId, request.getNewStatus());
        
        FieldJob fieldJob = fieldJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Field job not found with ID: " + jobId));
        
        FieldJob.JobStatus previousStatus = fieldJob.getStatus();
        
        // Validate status transition
        validateStatusTransition(previousStatus, request.getNewStatus());
        
        // Update status
        fieldJob.setStatus(request.getNewStatus());
        fieldJob.setLastModifiedBy(request.getUpdatedBy());
        
        // Handle specific status changes
        handleStatusChange(fieldJob, previousStatus, request.getNewStatus(), request);
        
        // Save field job
        FieldJob updatedFieldJob = fieldJobRepository.save(fieldJob);
        
        // Create status change note
        createStatusChangeNote(updatedFieldJob, previousStatus, request.getNewStatus(), 
                request.getNotes(), request.getUpdatedBy());
        
        // Send notifications
        notificationService.sendStatusChangeNotification(updatedFieldJob, previousStatus);
        
        FieldJobDto fieldJobDto = convertToDto(updatedFieldJob);
        
        return ApiResponse.ok(fieldJobDto, "Job status updated successfully");
    }

    public ApiResponse<Page<FieldJobDto>> searchFieldJobs(FieldJobSearchRequest request, Pageable pageable) {
        log.info("Searching field jobs with criteria: {}", request);
        
        Specification<FieldJob> specification = buildSearchSpecification(request);
        
        Page<FieldJob> fieldJobs = fieldJobRepository.findAll(specification, pageable);
        Page<FieldJobDto> fieldJobDtos = fieldJobs.map(this::convertToDto);
        
        return ApiResponse.ok(fieldJobDtos, "Field jobs search completed");
    }

    public ApiResponse<List<FieldJobDto>> getJobsByTechnician(String technicianId, FieldJob.JobStatus... statuses) {
        log.info("Getting jobs for technician: {}", technicianId);
        
        List<FieldJob.JobStatus> statusList = statuses.length > 0 ? 
                List.of(statuses) : 
                List.of(FieldJob.JobStatus.SCHEDULED, FieldJob.JobStatus.ASSIGNED, FieldJob.JobStatus.IN_PROGRESS);
        
        List<FieldJob> fieldJobs = fieldJobRepository.findByAssignedTechnicianIdAndStatusIn(technicianId, statusList);
        
        List<FieldJobDto> fieldJobDtos = fieldJobs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(fieldJobDtos, "Technician jobs retrieved successfully");
    }

    public ApiResponse<List<FieldJobDto>> getOverdueJobs() {
        log.info("Getting overdue jobs");
        
        List<FieldJob> overdueJobs = fieldJobRepository.findOverdueJobs(LocalDateTime.now());
        
        List<FieldJobDto> fieldJobDtos = overdueJobs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(fieldJobDtos, "Overdue jobs retrieved successfully");
    }

    public ApiResponse<List<FieldJobDto>> getJobsRequiringAttention() {
        log.info("Getting jobs requiring attention");
        
        List<FieldJob> attentionJobs = fieldJobRepository.findJobsRequiringAttention(LocalDateTime.now());
        
        List<FieldJobDto> fieldJobDtos = attentionJobs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        return ApiResponse.ok(fieldJobDtos, "Jobs requiring attention retrieved successfully");
    }

    public ApiResponse<FieldJobScheduleDto> getTechnicianSchedule(String technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting schedule for technician: {} from {} to {}", technicianId, startDate, endDate);
        
        List<FieldJob> scheduledJobs = fieldJobRepository.findTechnicianScheduledJobs(technicianId, startDate, endDate);
        
        List<FieldJobDto> jobDtos = scheduledJobs.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        
        FieldJobScheduleDto scheduleDto = FieldJobScheduleDto.builder()
                .technicianId(technicianId)
                .startDate(startDate)
                .endDate(endDate)
                .jobs(jobDtos)
                .totalJobs(jobDtos.size())
                .build();
        
        return ApiResponse.ok(scheduleDto, "Technician schedule retrieved successfully");
    }

    public ApiResponse<List<TechnicianAvailabilityDto>> getAvailableTechnicians(LocalDateTime startDate, LocalDateTime endDate, String requiredSkills) {
        log.info("Getting available technicians for period: {} to {}", startDate, endDate);
        
        List<Technician> availableTechnicians = technicianRepository.findAvailableBySkills(requiredSkills);
        
        List<TechnicianAvailabilityDto> availabilityDtos = new ArrayList<>();
        
        for (Technician technician : availableTechnicians) {
            List<FieldJob> technicianJobs = fieldJobRepository.findTechnicianJobsInDateRange(
                    technician.getId().toString(), startDate, endDate);
            
            boolean isAvailable = isTechnicianAvailable(technician, technicianJobs, startDate, endDate);
            
            TechnicianAvailabilityDto availabilityDto = TechnicianAvailabilityDto.builder()
                    .technicianId(technician.getId().toString())
                    .technicianName(technician.getFirstName() + " " + technician.getLastName())
                    .level(technician.getLevel())
                    .skills(technician.getSkills())
                    .currentJobs(technicianJobs.size())
                    .isAvailable(isAvailable)
                    .build();
            
            availabilityDtos.add(availabilityDto);
        }
        
        return ApiResponse.ok(availabilityDtos, "Available technicians retrieved successfully");
    }

    // Private helper methods

    private void validateCreateFieldJobRequest(CreateFieldJobRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ValidationException("Job title is required");
        }
        
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new ValidationException("Customer name is required");
        }
        
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new ValidationException("Location is required");
        }
        
        if (request.getScheduledDate() == null) {
            throw new ValidationException("Scheduled date is required");
        }
        
        if (request.getEstimatedEndDate() == null) {
            throw new ValidationException("Estimated end date is required");
        }
        
        if (request.getEstimatedEndDate().isBefore(request.getScheduledDate())) {
            throw new ValidationException("Estimated end date must be after scheduled date");
        }
    }

    private String generateJobNumber() {
        String prefix = "FJ";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int) (Math.random() * 1000));
        return prefix + timestamp + random;
    }

    private void validateTechnicianAvailability(String technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        Technician technician = technicianRepository.findById(UUID.fromString(technicianId))
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        
        if (technician.getStatus() != Technician.TechnicianStatus.ACTIVE || !technician.getAvailableForFieldWork()) {
            throw new ValidationException("Technician is not available for field work");
        }
        
        List<FieldJob> conflictingJobs = fieldJobRepository.findTechnicianJobsInDateRange(
                technicianId, startDate, endDate);
        
        if (!conflictingJobs.isEmpty()) {
            throw new ValidationException("Technician has conflicting jobs during the requested period");
        }
    }

    private void createInitialNote(FieldJob fieldJob, String createdBy) {
        FieldJobNote note = FieldJobNote.builder()
                .id(UUID.randomUUID())
                .fieldJobId(fieldJob.getId().toString())
                .noteText("Job created with status: " + fieldJob.getStatus())
                .createdBy(createdBy)
                .type(FieldJobNote.NoteType.GENERAL)
                .visibility(FieldJobNote.NoteVisibility.INTERNAL)
                .isCustomerVisible(false)
                .isTechnicianVisible(true)
                .isManagerVisible(true)
                .priority(FieldJobNote.NotePriority.NORMAL)
                .build();
        
        fieldJobNoteRepository.save(note);
    }

    private void createUpdateNote(FieldJob fieldJob, String updatedBy) {
        FieldJobNote note = FieldJobNote.builder()
                .id(UUID.randomUUID())
                .fieldJobId(fieldJob.getId().toString())
                .noteText("Job details updated")
                .createdBy(updatedBy)
                .type(FieldJobNote.NoteType.GENERAL)
                .visibility(FieldJobNote.NoteVisibility.INTERNAL)
                .isCustomerVisible(false)
                .isTechnicianVisible(true)
                .isManagerVisible(true)
                .priority(FieldJobNote.NotePriority.NORMAL)
                .build();
        
        fieldJobNoteRepository.save(note);
    }

    private void createStatusChangeNote(FieldJob fieldJob, FieldJob.JobStatus previousStatus, 
            FieldJob.JobStatus newStatus, String notes, String updatedBy) {
        StringBuilder noteText = new StringBuilder();
        noteText.append("Status changed from ").append(previousStatus)
                .append(" to ").append(newStatus);
        
        if (notes != null && !notes.trim().isEmpty()) {
            noteText.append(". Notes: ").append(notes);
        }
        
        FieldJobNote note = FieldJobNote.builder()
                .id(UUID.randomUUID())
                .fieldJobId(fieldJob.getId().toString())
                .noteText(noteText.toString())
                .createdBy(updatedBy)
                .type(FieldJobNote.NoteType.STATUS_UPDATE)
                .visibility(FieldJobNote.NoteVisibility.INTERNAL)
                .isCustomerVisible(false)
                .isTechnicianVisible(true)
                .isManagerVisible(true)
                .priority(FieldJobNote.NotePriority.NORMAL)
                .previousStatus(previousStatus.toString())
                .newStatus(newStatus.toString())
                .isStatusChangeNote(true)
                .build();
        
        fieldJobNoteRepository.save(note);
    }

    private void updateFieldJobFromRequest(FieldJob fieldJob, UpdateFieldJobRequest request) {
        if (request.getTitle() != null) {
            fieldJob.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            fieldJob.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            fieldJob.setLocation(request.getLocation());
        }
        if (request.getCustomerName() != null) {
            fieldJob.setCustomerName(request.getCustomerName());
        }
        if (request.getCustomerPhone() != null) {
            fieldJob.setCustomerPhone(request.getCustomerPhone());
        }
        if (request.getCustomerEmail() != null) {
            fieldJob.setCustomerEmail(request.getCustomerEmail());
        }
        if (request.getPriority() != null) {
            fieldJob.setPriority(request.getPriority());
        }
        if (request.getCategory() != null) {
            fieldJob.setCategory(request.getCategory());
        }
        if (request.getScheduledDate() != null) {
            fieldJob.setScheduledDate(request.getScheduledDate());
        }
        if (request.getEstimatedStartDate() != null) {
            fieldJob.setEstimatedStartDate(request.getEstimatedStartDate());
        }
        if (request.getEstimatedEndDate() != null) {
            fieldJob.setEstimatedEndDate(request.getEstimatedEndDate());
        }
        if (request.getEstimatedDuration() != null) {
            fieldJob.setEstimatedDuration(request.getEstimatedDuration());
        }
        if (request.getEstimatedCost() != null) {
            fieldJob.setEstimatedCost(request.getEstimatedCost());
        }
        if (request.getAssignedTechnicianId() != null) {
            fieldJob.setAssignedTechnicianId(request.getAssignedTechnicianId());
        }
        if (request.getLatitude() != null) {
            fieldJob.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            fieldJob.setLongitude(request.getLongitude());
        }
        if (request.getFullAddress() != null) {
            fieldJob.setFullAddress(request.getFullAddress());
        }
    }

    private void validateStatusTransition(FieldJob.JobStatus currentStatus, FieldJob.JobStatus newStatus) {
        // Define valid transitions
        switch (currentStatus) {
            case DRAFT:
                if (!List.of(FieldJob.JobStatus.SCHEDULED, FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from DRAFT to " + newStatus);
                }
                break;
            case SCHEDULED:
                if (!List.of(FieldJob.JobStatus.ASSIGNED, FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from SCHEDULED to " + newStatus);
                }
                break;
            case ASSIGNED:
                if (!List.of(FieldJob.JobStatus.IN_PROGRESS, FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from ASSIGNED to " + newStatus);
                }
                break;
            case IN_PROGRESS:
                if (!List.of(FieldJob.JobStatus.COMPLETED, FieldJob.JobStatus.PENDING_PARTS, 
                        FieldJob.JobStatus.PENDING_CUSTOMER_APPROVAL, FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from IN_PROGRESS to " + newStatus);
                }
                break;
            case PENDING_PARTS:
                if (!List.of(FieldJob.JobStatus.IN_PROGRESS, FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from PENDING_PARTS to " + newStatus);
                }
                break;
            case PENDING_CUSTOMER_APPROVAL:
                if (!List.of(FieldJob.JobStatus.COMPLETED, FieldJob.JobStatus.IN_PROGRESS, 
                        FieldJob.JobStatus.CANCELLED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from PENDING_CUSTOMER_APPROVAL to " + newStatus);
                }
                break;
            case COMPLETED:
                if (!List.of(FieldJob.JobStatus.REVERSED).contains(newStatus)) {
                    throw new ValidationException("Invalid status transition from COMPLETED to " + newStatus);
                }
                break;
            case CANCELLED:
            case REVERSED:
                throw new ValidationException("Cannot change status from " + currentStatus);
        }
    }

    private void handleStatusChange(FieldJob fieldJob, FieldJob.JobStatus previousStatus, 
            FieldJob.JobStatus newStatus, UpdateJobStatusRequest request) {
        LocalDateTime now = LocalDateTime.now();
        
        switch (newStatus) {
            case IN_PROGRESS:
                fieldJob.setActualStartDate(now);
                break;
            case COMPLETED:
                fieldJob.setActualEndDate(now);
                fieldJob.setCompletedBy(request.getUpdatedBy());
                if (request.getCompletionNotes() != null) {
                    fieldJob.setCompletionNotes(request.getCompletionNotes());
                }
                if (request.getWorkPerformed() != null) {
                    fieldJob.setWorkPerformed(request.getWorkPerformed());
                }
                if (request.getActualCost() != null) {
                    fieldJob.setActualCost(request.getActualCost());
                }
                if (fieldJob.getActualStartDate() != null) {
                    long duration = java.time.Duration.between(fieldJob.getActualStartDate(), now).toMinutes();
                    fieldJob.setActualDuration((int) duration);
                }
                break;
            case CANCELLED:
                fieldJob.setCancelledDate(now);
                fieldJob.setCancelledBy(request.getUpdatedBy());
                if (request.getCancellationReason() != null) {
                    fieldJob.setCancellationReason(request.getCancellationReason());
                }
                break;
        }
    }

    private Specification<FieldJob> buildSearchSpecification(FieldJobSearchRequest request) {
        // Build dynamic search specification based on request criteria
        return (root, query, criteriaBuilder) -> {
            List<javax.persistence.criteria.Predicate> predicates = new ArrayList<>();
            
            if (request.getJobNumber() != null) {
                predicates.add(criteriaBuilder.equal(root.get("jobNumber"), request.getJobNumber()));
            }
            
            if (request.getTitle() != null) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), 
                        "%" + request.getTitle().toLowerCase() + "%"));
            }
            
            if (request.getCustomerName() != null) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("customerName")), 
                        "%" + request.getCustomerName().toLowerCase() + "%"));
            }
            
            if (request.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.getStatus()));
            }
            
            if (request.getPriority() != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), request.getPriority()));
            }
            
            if (request.getAssignedTechnicianId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTechnicianId"), request.getAssignedTechnicianId()));
            }
            
            if (request.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("scheduledDate"), request.getStartDate()));
            }
            
            if (request.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("scheduledDate"), request.getEndDate()));
            }
            
            return criteriaBuilder.and(predicates.toArray(new javax.persistence.criteria.Predicate[0]));
        };
    }

    private boolean isTechnicianAvailable(Technician technician, List<FieldJob> jobs, 
            LocalDateTime startDate, LocalDateTime endDate) {
        // Check if technician has any conflicting jobs
        for (FieldJob job : jobs) {
            if (job.getStatus() == FieldJob.JobStatus.SCHEDULED || 
                job.getStatus() == FieldJob.JobStatus.ASSIGNED || 
                job.getStatus() == FieldJob.JobStatus.IN_PROGRESS) {
                
                if (isDateRangeOverlapping(startDate, endDate, 
                        job.getScheduledDate(), job.getEstimatedEndDate())) {
                    return false;
                }
            }
        }
        return true;
    }

    private boolean isDateRangeOverlapping(LocalDateTime start1, LocalDateTime end1, 
            LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }

    private FieldJobDto convertToDto(FieldJob fieldJob) {
        // Convert FieldJob entity to FieldJobDto
        return FieldJobDto.builder()
                .id(fieldJob.getId())
                .jobNumber(fieldJob.getJobNumber())
                .title(fieldJob.getTitle())
                .description(fieldJob.getDescription())
                .location(fieldJob.getLocation())
                .customerName(fieldJob.getCustomerName())
                .customerPhone(fieldJob.getCustomerPhone())
                .customerEmail(fieldJob.getCustomerEmail())
                .status(fieldJob.getStatus())
                .priority(fieldJob.getPriority())
                .category(fieldJob.getCategory())
                .scheduledDate(fieldJob.getScheduledDate())
                .estimatedStartDate(fieldJob.getEstimatedStartDate())
                .estimatedEndDate(fieldJob.getEstimatedEndDate())
                .actualStartDate(fieldJob.getActualStartDate())
                .actualEndDate(fieldJob.getActualEndDate())
                .estimatedDuration(fieldJob.getEstimatedDuration())
                .actualDuration(fieldJob.getActualDuration())
                .estimatedCost(fieldJob.getEstimatedCost())
                .actualCost(fieldJob.getActualCost())
                .assignedTechnicianId(fieldJob.getAssignedTechnicianId())
                .requiresParts(fieldJob.getRequiresParts())
                .requiresSpecialEquipment(fieldJob.getRequiresSpecialEquipment())
                .specialRequirements(fieldJob.getSpecialRequirements())
                .latitude(fieldJob.getLatitude())
                .longitude(fieldJob.getLongitude())
                .fullAddress(fieldJob.getFullAddress())
                .completionNotes(fieldJob.getCompletionNotes())
                .paymentStatus(fieldJob.getPaymentStatus())
                .amountPaid(fieldJob.getAmountPaid())
                .workPerformed(fieldJob.getWorkPerformed())
                .technicianNotes(fieldJob.getTechnicianNotes())
                .customerRating(fieldJob.getCustomerRating())
                .customerFeedback(fieldJob.getCustomerFeedback())
                .complexity(fieldJob.getComplexity())
                .requiredTechnicianLevel(fieldJob.getRequiredTechnicianLevel())
                .requiredSkills(fieldJob.getRequiredSkills())
                .weatherDependent(fieldJob.getWeatherDependent())
                .safetyEquipmentRequired(fieldJob.getSafetyEquipmentRequired())
                .safetyRequirements(fieldJob.getSafetyRequirements())
                .erpAssetId(fieldJob.getErpAssetId())
                .erpWorkOrderId(fieldJob.getErpWorkOrderId())
                .crmLeadId(fieldJob.getCrmLeadId())
                .crmAccountId(fieldJob.getCrmAccountId())
                .createdAt(fieldJob.getCreatedAt())
                .updatedAt(fieldJob.getUpdatedAt())
                .createdBy(fieldJob.getCreatedBy())
                .lastModifiedBy(fieldJob.getLastModifiedBy())
                .build();
    }
}
