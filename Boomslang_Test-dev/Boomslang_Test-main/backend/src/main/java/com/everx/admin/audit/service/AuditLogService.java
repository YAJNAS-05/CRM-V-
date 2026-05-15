package com.everx.admin.audit.service;

import java.util.Objects;
import com.everx.admin.audit.entity.AuditLog;
import com.everx.admin.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(UUID userId, String action, String entityType, UUID entityId, String oldValue, String newValue, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .build();
        Objects.requireNonNull(auditLogRepository.save(Objects.requireNonNull(auditLog)));
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return Objects.requireNonNull(auditLogRepository.findAll(Objects.requireNonNull(pageable)));
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByEntity(String entityType, UUID entityId, Pageable pageable) {
        return Objects.requireNonNull(auditLogRepository.findByEntityTypeAndEntityId(
                Objects.requireNonNull(entityType), Objects.requireNonNull(entityId), Objects.requireNonNull(pageable)));
    }
}
