package com.everx.finance.payment;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Idempotency guard for payment creation.
 *
 * <p>Callers supply an {@code idempotencyKey} (e.g. the client-generated UUID
 * sent in the HTTP header {@code X-Idempotency-Key}).  The same key arriving
 * within the configured window will be rejected as a duplicate, protecting
 * against double-clicks, retry storms, and network-level retransmissions.
 *
 * <p>The key is evicted from the in-process cache after
 * {@link #TTL_MINUTES} minutes.  For multi-node deployments, replace the
 * Caffeine cache with a distributed store (Redis SETNX) while keeping this
 * service interface unchanged.
 */
@Service
@Slf4j
public class PaymentDeduplicationService {

    /** Duration after which an idempotency key expires. */
    private static final long TTL_MINUTES = 30;

    /** Maximum number of in-flight keys held in memory. */
    private static final long MAX_ENTRIES = 10_000;

    private final Cache<String, UUID> seenKeys = Caffeine.newBuilder()
            .maximumSize(MAX_ENTRIES)
            .expireAfterWrite(Duration.ofMinutes(TTL_MINUTES))
            .build();

    /**
     * Check whether the given key has already been used within the TTL window.
     *
     * @param idempotencyKey  client-supplied idempotency key (must not be null)
     * @return {@code true} if this key was previously registered (i.e. it is a
     *         duplicate request); {@code false} if it is new
     */
    public boolean isDuplicate(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            // No key supplied – cannot detect duplicates; allow through
            return false;
        }
        UUID existing = seenKeys.getIfPresent(idempotencyKey);
        return existing != null;
    }

    /**
     * Register an idempotency key after the payment has been successfully
     * persisted.  Subsequent calls with the same key will be detected as
     * duplicates until the TTL expires.
     *
     * @param idempotencyKey client-supplied idempotency key
     * @param paymentId      the UUID of the created payment
     */
    public void register(String idempotencyKey, UUID paymentId) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        seenKeys.put(idempotencyKey, paymentId);
        log.debug("Registered idempotency key={} for paymentId={}", idempotencyKey, paymentId);
    }

    /**
     * Retrieve the payment UUID that was previously created for this key.
     * Useful for returning a 200 response with the original payment on replay.
     *
     * @param idempotencyKey client-supplied idempotency key
     * @return the original payment UUID, or {@code null} if the key is not
     *         present in the cache
     */
    public UUID getPaymentId(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        return seenKeys.getIfPresent(idempotencyKey);
    }
}
