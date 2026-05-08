package com.everx.tenant;

import com.everx.tenant.dto.TenantResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public Page<TenantResponse> findAll(Pageable pageable) {
        return tenantRepository.findAll(pageable).map(this::toResponse);
    }

    public TenantResponse findById(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return toResponse(tenant);
    }

    @Transactional
    public TenantResponse create(Tenant request) {
        request.setIsActive(true);
        return toResponse(tenantRepository.save(request));
    }

    private TenantResponse toResponse(Tenant t) {
        return TenantResponse.builder()
            .id(t.getId())
            .tenantName(t.getTenantName())
            .domain(t.getDomain())
            .isActive(t.getIsActive())
            .build();
    }
}
