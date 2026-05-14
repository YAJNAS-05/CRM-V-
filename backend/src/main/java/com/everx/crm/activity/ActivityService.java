package com.everx.crm.activity;

import com.everx.crm.activity.dto.ActivityDto;
import com.everx.crm.activity.dto.CreateActivityRequest;
import com.everx.crm.activity.dto.UpdateActivityRequest;
import com.everx.shared.util.SecurityUserContext;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    @Transactional
    public ActivityDto createActivity(CreateActivityRequest request) {
        Activity activity = new Activity();
        UUID assignedTo = request.getAssignedTo() != null ? request.getAssignedTo() : SecurityUserContext.getCurrentUserIdOrNull();

        activity.setType(request.getType());
        activity.setSubject(request.getSubject());
        activity.setDescription(request.getDescription());
        activity.setDueDate(request.getDueDate());
        activity.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        activity.setDurationMins(request.getDurationMins());
        activity.setContactId(request.getContactId());
        activity.setDealId(request.getDealId());
        activity.setLeadId(request.getLeadId());
        activity.setAccountId(request.getAccountId());
        activity.setAssignedTo(assignedTo);

        Activity saved = activityRepository.save(activity);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public ActivityDto getActivityById(UUID id) {
        Activity activity = activityRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found with id: " + id));
        return toDto(activity);
    }

    @Transactional(readOnly = true)
    public Page<ActivityDto> getAllActivities(Pageable pageable) {
        return activityRepository.findAllNotDeleted(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByDealId(UUID dealId) {
        return activityRepository.findByDealId(dealId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByLeadId(UUID leadId) {
        return activityRepository.findByLeadId(leadId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByContactId(UUID contactId) {
        return activityRepository.findByContactId(contactId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getActivitiesByUserId(UUID userId) {
        return activityRepository.findByAssignedTo(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDto> getOverdueActivities() {
        return activityRepository.findOverdueActivities().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActivityDto updateActivity(UUID id, UpdateActivityRequest request) {
        Activity activity = activityRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found with id: " + id));

        if (request.getType() != null) activity.setType(request.getType());
        if (request.getSubject() != null) activity.setSubject(request.getSubject());
        if (request.getDescription() != null) activity.setDescription(request.getDescription());
        if (request.getDueDate() != null) activity.setDueDate(request.getDueDate());
        if (request.getCompletedAt() != null) activity.setCompletedAt(request.getCompletedAt());
        if (request.getStatus() != null) activity.setStatus(request.getStatus());
        if (request.getDurationMins() != null) activity.setDurationMins(request.getDurationMins());
        if (request.getContactId() != null) activity.setContactId(request.getContactId());
        if (request.getDealId() != null) activity.setDealId(request.getDealId());
        if (request.getLeadId() != null) activity.setLeadId(request.getLeadId());
        if (request.getAccountId() != null) activity.setAccountId(request.getAccountId());
        if (request.getAssignedTo() != null) activity.setAssignedTo(request.getAssignedTo());

        Activity updated = activityRepository.save(activity);
        return toDto(updated);
    }

    @Transactional
    public ActivityDto completeActivity(UUID id) {
        Activity activity = activityRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found with id: " + id));

        activity.setCompletedAt(Instant.now());
        Activity updated = activityRepository.save(activity);
        return toDto(updated);
    }

    @Transactional
    public void deleteActivity(UUID id) {
        Activity activity = activityRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found with id: " + id));
        activity.softDelete();
        activityRepository.save(activity);
    }

    private ActivityDto toDto(Activity activity) {
        ActivityDto dto = new ActivityDto();
        dto.setId(activity.getId());
        dto.setType(activity.getType());
        dto.setSubject(activity.getSubject());
        dto.setDescription(activity.getDescription());
        dto.setDueDate(activity.getDueDate());
        dto.setCompletedAt(activity.getCompletedAt());
        dto.setStatus(activity.getStatus());
        dto.setDurationMins(activity.getDurationMins());
        dto.setContactId(activity.getContactId());
        dto.setDealId(activity.getDealId());
        dto.setLeadId(activity.getLeadId());
        dto.setAccountId(activity.getAccountId());
        dto.setAssignedTo(activity.getAssignedTo());
        dto.setCreatedAt(activity.getCreatedAt().toInstant());
        dto.setUpdatedAt(activity.getUpdatedAt().toInstant());
        return dto;
    }
}
