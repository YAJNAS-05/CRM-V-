package com.everx.security;

import com.everx.security.dto.SecurityPolicyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SecurityService {

    private final SecurityPolicyRepository policyRepository;

    public Page<SecurityPolicyResponse> findAll(Pageable pageable) {
        return policyRepository.findAll(pageable).map(this::toResponse);
    }

    public SecurityPolicyResponse findById(UUID id) {
        SecurityPolicy policy = policyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Policy not found"));
        return toResponse(policy);
    }

    @Transactional
    public SecurityPolicyResponse create(SecurityPolicy request) {
        request.setIsActive(true);
        return toResponse(policyRepository.save(request));
    }

    private SecurityPolicyResponse toResponse(SecurityPolicy p) {
        return SecurityPolicyResponse.builder()
            .id(p.getId())
            .policyName(p.getPolicyName())
            .policyType(p.getPolicyType())
            .isEnabled(p.getIsEnabled())
            .build();
    }
}
