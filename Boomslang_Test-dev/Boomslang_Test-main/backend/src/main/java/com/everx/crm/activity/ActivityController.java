package com.everx.crm.activity;

import com.everx.crm.activity.dto.ActivityDto;
import com.everx.crm.activity.dto.CreateActivityRequest;
import com.everx.crm.activity.dto.UpdateActivityRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDto>> createActivity(@Valid @RequestBody CreateActivityRequest request) {
        ActivityDto activity = activityService.createActivity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(activity, "Activity created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDto>> getActivityById(@PathVariable UUID id) {
        ActivityDto activity = activityService.getActivityById(id);
        return ResponseEntity.ok(ApiResponse.ok(activity));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityDto>>> getAllActivities(Pageable pageable) {
        Page<ActivityDto> activities = activityService.getAllActivities(pageable);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/deal/{dealId}")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getActivitiesByDealId(@PathVariable UUID dealId) {
        List<ActivityDto> activities = activityService.getActivitiesByDealId(dealId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getActivitiesByLeadId(@PathVariable UUID leadId) {
        List<ActivityDto> activities = activityService.getActivitiesByLeadId(leadId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/contact/{contactId}")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getActivitiesByContactId(@PathVariable UUID contactId) {
        List<ActivityDto> activities = activityService.getActivitiesByContactId(contactId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getActivitiesByUserId(@PathVariable UUID userId) {
        List<ActivityDto> activities = activityService.getActivitiesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<ActivityDto>>> getOverdueActivities() {
        List<ActivityDto> activities = activityService.getOverdueActivities();
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDto>> updateActivity(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateActivityRequest request) {
        ActivityDto activity = activityService.updateActivity(id, request);
        return ResponseEntity.ok(ApiResponse.ok(activity, "Activity updated successfully"));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ActivityDto>> completeActivity(@PathVariable UUID id) {
        ActivityDto activity = activityService.completeActivity(id);
        return ResponseEntity.ok(ApiResponse.ok(activity, "Activity marked as completed"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable UUID id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Activity deleted successfully"));
    }
}
