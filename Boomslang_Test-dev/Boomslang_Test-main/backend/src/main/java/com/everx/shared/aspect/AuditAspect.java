package com.everx.shared.aspect;

import com.everx.admin.audit.service.AuditLogService;
import com.everx.auth.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Pointcut("(execution(* com.everx..service..create*(..)) || " +
              "execution(* com.everx..service..update*(..)) || " +
              "execution(* com.everx..service..delete*(..))) && " +
              "!within(com.everx.admin.audit..*)")
    public void serviceMutationMethods() {}

    @AfterReturning(pointcut = "serviceMutationMethods()", returning = "result")
    public void auditLogMutation(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            
            UUID userId = getCurrentUserId();
            String ipAddress = getClientIp();
            
            String action = methodName.toUpperCase();
            String entityType = className.replace("Service", "");
            
            // For a production system, we would calculate diffs. 
            // Here we log the resulting state as the "new value".
            String newValueJson = objectMapper.writeValueAsString(result);
            
            // Extracting entity ID from result if possible (standard Response DTOs have getId())
            UUID entityId = null;
            try {
                java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                entityId = (UUID) getIdMethod.invoke(result);
            } catch (Exception ignored) {}

            auditLogService.log(
                userId, 
                action, 
                entityType, 
                entityId, 
                null, // Old value would require fetching prior state
                newValueJson, 
                ipAddress
            );
            
            log.debug("Audited mutation: {} on {} by user {}", action, entityType, userId);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage());
        }
    }

    private UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return ((User) auth.getPrincipal()).getId();
        }
        return null;
    }

    private String getClientIp() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            String ip = attributes.getRequest().getHeader("X-Forwarded-For");
            return (ip != null) ? ip : attributes.getRequest().getRemoteAddr();
        }
        return "UNKNOWN";
    }
}
