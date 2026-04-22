package com.everx.erp.fieldwork;

import com.everx.erp.fieldwork.dto.FieldJobDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/field-jobs")
@RequiredArgsConstructor
public class FieldJobWorkflowController {

    private final FieldJobService fieldJobService;

    @PatchMapping("/{jobId}/assign")
    public ResponseEntity<?> assignEngineer(
            @PathVariable UUID jobId,
            @RequestParam UUID engineerId,
            @RequestParam(required = false) EngineerType engineerType,
            @RequestParam(required = false) String engineerName) {
        try {
            FieldJobDto updated = fieldJobService.assignEngineer(jobId, engineerId, engineerType, engineerName);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new FieldJobCompletionResponse("error", e.getMessage(), null, null));
        }
    }

    @PatchMapping("/{jobId}/start")
    public ResponseEntity<?> startFieldJob(@PathVariable UUID jobId) {
        try {
            FieldJobDto updated = fieldJobService.startJob(jobId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new FieldJobCompletionResponse("error", e.getMessage(), null, null));
        }
    }

    @PatchMapping("/{jobId}/complete")
    public ResponseEntity<?> completeFieldJob(
            @PathVariable UUID jobId,
            @RequestParam(required = false) String completionNotes) {
        try {
            FieldJobDto completedJob = fieldJobService.completeFieldJob(jobId, completionNotes);
            return ResponseEntity.ok(new FieldJobCompletionResponse(
                    "success",
                    "Field job completed",
                    completedJob,
                    completedJob.getLinkedInvoiceId() != null ? "Invoice created" : null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new FieldJobCompletionResponse("error", e.getMessage(), null, null));
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FieldJobCompletionResponse {
        private String status;
        private String message;
        private FieldJobDto job;
        private String additionalInfo;
    }
}
