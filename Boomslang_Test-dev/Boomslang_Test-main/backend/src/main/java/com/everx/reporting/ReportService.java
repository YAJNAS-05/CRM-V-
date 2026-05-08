package com.everx.reporting;

import com.everx.reporting.dto.ReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;

    public Page<ReportResponse> findAll(Pageable pageable) {
        return reportRepository.findAll(pageable).map(this::toResponse);
    }

    public ReportResponse findById(UUID id) {
        Report report = reportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        return toResponse(report);
    }

    @Transactional
    public ReportResponse create(Report request) {
        request.setStatus("DRAFT");
        return toResponse(reportRepository.save(request));
    }

    private ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
            .id(r.getId())
            .reportName(r.getReportName())
            .reportType(r.getReportType())
            .status(r.getStatus())
            .build();
    }
}
