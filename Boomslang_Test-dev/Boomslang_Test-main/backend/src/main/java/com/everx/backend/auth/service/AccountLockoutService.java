package com.everx.backend.auth.service;

import com.everx.backend.auth.entity.AccountLockout;
import com.everx.backend.auth.repository.AccountLockoutRepository;
import com.everx.shared.exception.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing account lockouts after failed login attempts
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AccountLockoutService {
    
    private final AccountLockoutRepository accountLockoutRepository;
    
    @Value("${security.lockout.max-attempts:5}")
    private int maxFailedAttempts;
    
    @Value("${security.lockout.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;
    
    /**
     * Check if account is locked
     */
    public boolean isAccountLocked(UUID userId) {
        Optional<AccountLockout> lockout = accountLockoutRepository.findByUserIdAndIsDeletedFalse(userId);
        
        if (lockout.isEmpty()) {
            return false;
        }
        
        AccountLockout al = lockout.get();
        
        // Check if lockout has expired
        if (al.getLockedUntil() != null && al.getLockedUntil().isBefore(LocalDateTime.now())) {
            // Unlock and reset attempts
            unlockAccount(userId);
            return false;
        }
        
        // Account is still locked
        return al.getLockedUntil() != null && al.getLockedUntil().isAfter(LocalDateTime.now());
    }
    
    /**
     * Record a failed login attempt
     */
    @Transactional
    public void recordFailedAttempt(UUID userId) {
        Optional<AccountLockout> existing = accountLockoutRepository.findByUserIdAndIsDeletedFalse(userId);
        
        AccountLockout lockout;
        if (existing.isPresent()) {
            lockout = existing.get();
            
            // Check if lockout has expired
            if (lockout.getLockedUntil() != null && lockout.getLockedUntil().isBefore(LocalDateTime.now())) {
                // Reset attempts
                lockout.setFailedAttempts(1);
                lockout.setLockedUntil(null);
                lockout.setLockoutReason(null);
            } else {
                lockout.setFailedAttempts(lockout.getFailedAttempts() + 1);
            }
        } else {
            lockout = new AccountLockout();
            lockout.setId(UUID.randomUUID());
            lockout.setUserId(userId);
            lockout.setFailedAttempts(1);
        }
        
        // Lock account if max attempts exceeded
        if (lockout.getFailedAttempts() >= maxFailedAttempts) {
            lockout.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            lockout.setLockoutReason("Account locked due to " + maxFailedAttempts + " failed login attempts");
            log.warn("Account locked for user {} after {} failed attempts", userId, maxFailedAttempts);
        }
        
        accountLockoutRepository.save(lockout);
    }
    
    /**
     * Record a successful login attempt (resets counter)
     */
    @Transactional
    public void recordSuccessfulLogin(UUID userId) {
        Optional<AccountLockout> existing = accountLockoutRepository.findByUserIdAndIsDeletedFalse(userId);
        
        if (existing.isPresent()) {
            AccountLockout lockout = existing.get();
            lockout.setFailedAttempts(0);
            lockout.setLockedUntil(null);
            lockout.setLockoutReason(null);
            accountLockoutRepository.save(lockout);
            log.debug("Reset failed attempts for user {}", userId);
        }
    }
    
    /**
     * Unlock an account manually
     */
    @Transactional
    public void unlockAccount(UUID userId) {
        Optional<AccountLockout> existing = accountLockoutRepository.findByUserIdAndIsDeletedFalse(userId);
        
        if (existing.isPresent()) {
            AccountLockout lockout = existing.get();
            lockout.setFailedAttempts(0);
            lockout.setLockedUntil(null);
            lockout.setLockoutReason(null);
            accountLockoutRepository.save(lockout);
            log.info("Account unlocked for user {}", userId);
        }
    }
    
    /**
     * Get remaining lockout time in seconds
     */
    public long getRemainingLockoutSeconds(UUID userId) {
        Optional<AccountLockout> lockout = accountLockoutRepository.findByUserIdAndIsDeletedFalse(userId);
        
        if (lockout.isEmpty() || lockout.get().getLockedUntil() == null) {
            return 0;
        }
        
        LocalDateTime lockedUntil = lockout.get().getLockedUntil();
        if (lockedUntil.isBefore(LocalDateTime.now())) {
            return 0;
        }
        
        return java.time.temporal.ChronoUnit.SECONDS.between(LocalDateTime.now(), lockedUntil);
    }
    
    /**
     * Throw exception if account is locked
     */
    public void checkAndThrowIfLocked(UUID userId) {
        if (isAccountLocked(userId)) {
            long remainingSeconds = getRemainingLockoutSeconds(userId);
            throw AuthenticationException.accountLocked();
        }
    }
}
