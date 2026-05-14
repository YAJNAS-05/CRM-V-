package com.everx.erp.fieldwork;

import com.everx.erp.fieldwork.dto.CreateFieldJobRequest;
import com.everx.erp.fieldwork.dto.FieldJobDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/field-jobs-test")
@RequiredArgsConstructor
public class FieldJobTestController {

    private final FieldJobService fieldJobService;

    @PostMapping("/create")
    public ResponseEntity<FieldJobDto> createTestFieldJob(@RequestBody TestFieldJobRequest request) {
        CreateFieldJobRequest create = new CreateFieldJobRequest();
        create.setJobNumber("TEST-" + System.currentTimeMillis());
        create.setJobType(request.getJobType() != null ? request.getJobType() : FieldJobType.INSTALLATION);
        create.setJobStatus(FieldJobStatus.DRAFT);
        create.setPriority(request.getPriority() != null ? request.getPriority() : JobPriority.ROUTINE);
        create.setClientOrSellerName("Test Client");
        create.setSiteContactName("Test Contact");
        create.setSiteContactEmail("test@example.com");
        create.setSiteAddressLine1("Test Address");
        create.setSiteCity("Test City");
        create.setScheduledStartDate(OffsetDateTime.now());
        create.setScheduledEndDate(OffsetDateTime.now().plusDays(1));
        create.setInternalNotes(request.getInternalNotes());

        FieldJobDto job = fieldJobService.createFieldJob(create);
        return ResponseEntity.status(HttpStatus.CREATED).body(job);
    }

    @GetMapping("/list")
    public ResponseEntity<Page<FieldJobDto>> listTestFieldJobs(Pageable pageable) {
        return ResponseEntity.ok(fieldJobService.getFieldJobs(pageable));
    }

    @Data
    public static class TestFieldJobRequest {
        private FieldJobType jobType;
        private JobPriority priority;
        private String internalNotes;
    }
}
