package com.everx.subscription;

import com.everx.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public Page<SubscriptionResponse> findAll(Pageable pageable) {
        return subscriptionRepository.findAll(pageable).map(this::toResponse);
    }

    public SubscriptionResponse findById(UUID id) {
        Subscription sub = subscriptionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subscription not found"));
        return toResponse(sub);
    }

    @Transactional
    public SubscriptionResponse create(Subscription request) {
        request.setStatus("ACTIVE");
        return toResponse(subscriptionRepository.save(request));
    }

    private SubscriptionResponse toResponse(Subscription s) {
        return SubscriptionResponse.builder()
            .id(s.getId())
            .planName(s.getPlanName())
            .status(s.getStatus())
            .build();
    }
}
