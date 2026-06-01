package com.everx.finance.account.service;

import com.everx.finance.account.dto.CreateGlAccountRequest;
import com.everx.finance.account.dto.GlAccountResponse;
import com.everx.finance.account.dto.UpdateGlAccountRequest;
import com.everx.finance.account.entity.GlAccount;
import com.everx.finance.account.repository.GlAccountRepository;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for Chart of Accounts (GL Account) operations
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class GlAccountService {

    private final GlAccountRepository glAccountRepository;

    /**
     * Create a new GL account
     */
    public GlAccountResponse createGlAccount(CreateGlAccountRequest request) {
        log.info("Creating GL account: {} - {}", request.getAccountCode(), request.getAccountName());

        // Validate account code uniqueness
        if (glAccountRepository.existsByAccountCodeAndCompanyIdAndIsDeletedFalse(
                request.getAccountCode(), request.getCompanyId())) {
            throw new IllegalArgumentException(
                "Account code " + request.getAccountCode() + " already exists for this company");
        }

        // Validate parent account if provided
        GlAccount parentAccount = null;
        if (request.getParentAccountId() != null) {
            parentAccount = glAccountRepository.findById(request.getParentAccountId())
                .filter(ga -> !ga.getIsDeleted())
                .orElseThrow(() -> new EntityNotFoundException("Parent GL account not found"));

            // Validate hierarchy level
            if (!request.getLevel().equals(parentAccount.getLevel() + 1)) {
                throw new IllegalArgumentException(
                    String.format("Account level must be parent.level + 1. Expected level: %d, Provided: %d",
                        parentAccount.getLevel() + 1, request.getLevel())
                );
            }
        }

        // Set normal balance based on account type if not explicitly provided
        GlAccount.NormalBalance normalBalance = GlAccount.NormalBalance.fromAccountType(request.getAccountType());

        // Create and save GL account
        GlAccount glAccount = GlAccount.builder()
            .accountCode(request.getAccountCode())
            .accountName(request.getAccountName())
            .accountType(request.getAccountType())
            .normalBalance(normalBalance)
            .parentAccount(parentAccount)
            .companyId(request.getCompanyId())
            .level(request.getLevel())
            .isActive(true)
            .description(request.getDescription())
            .requiresCostCenter(request.getRequiresCostCenter())
            .requiresDepartment(request.getRequiresDepartment())
            .allowsManualEntry(request.getAllowsManualEntry())
            .build();

        GlAccount savedAccount = glAccountRepository.save(glAccount);
        log.info("GL account created successfully: {}", savedAccount.getId());

        return toResponse(savedAccount);
    }

    /**
     * Get GL account by ID
     */
    @Transactional(readOnly = true)
    public GlAccountResponse getGlAccountById(UUID id) {
        GlAccount account = glAccountRepository.findById(id)
            .filter(ga -> !ga.getIsDeleted())
            .orElseThrow(() -> new EntityNotFoundException("GL account not found: " + id));
        return toResponse(account);
    }

    /**
     * Get GL account by code
     */
    @Transactional(readOnly = true)
    public GlAccountResponse getGlAccountByCode(String code, UUID companyId) {
        GlAccount account = glAccountRepository.findByAccountCodeAndCompanyIdAndIsDeletedFalse(code, companyId)
            .orElseThrow(() -> new EntityNotFoundException("GL account not found: " + code));
        return toResponse(account);
    }

    /**
     * Get GL account by code without company filter
     */
    @Transactional(readOnly = true)
    public GlAccount getAccountByCode(String code) {
        return glAccountRepository.findFirstByAccountCodeAndIsDeletedFalse(code)
            .orElseThrow(() -> new EntityNotFoundException("GL account not found: " + code));
    }

    /**
     * Get all GL accounts for a company (paginated)
     */
    @Transactional(readOnly = true)
    public Page<GlAccountResponse> getAllGlAccounts(UUID companyId, Pageable pageable) {
        return glAccountRepository.findByCompanyIdAndIsDeletedFalse(companyId, pageable)
            .map(this::toResponse);
    }

    /**
     * Get all active GL accounts for a company
     */
    @Transactional(readOnly = true)
    public Page<GlAccountResponse> getActiveGlAccounts(UUID companyId, Pageable pageable) {
        return glAccountRepository.findByCompanyIdAndIsActiveTrueAndIsDeletedFalse(companyId, pageable)
            .map(this::toResponse);
    }

    /**
     * Get child accounts of a parent
     */
    @Transactional(readOnly = true)
    public List<GlAccountResponse> getChildAccounts(UUID parentAccountId) {
        return glAccountRepository.findByParentAccountIdAndIsDeletedFalse(parentAccountId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Search GL accounts by code or name
     */
    @Transactional(readOnly = true)
    public Page<GlAccountResponse> searchGlAccounts(UUID companyId, String search, Pageable pageable) {
        return glAccountRepository.searchByCodeOrName(companyId, search, pageable)
            .map(this::toResponse);
    }

    /**
     * Update GL account
     */
    public GlAccountResponse updateGlAccount(UUID id, UpdateGlAccountRequest request) {
        log.info("Updating GL account: {}", id);

        GlAccount account = glAccountRepository.findById(id)
            .filter(ga -> !ga.getIsDeleted())
            .orElseThrow(() -> new EntityNotFoundException("GL account not found: " + id));

        // Update allowed fields
        account.setAccountName(request.getAccountName());
        account.setDescription(request.getDescription());
        account.setIsActive(request.getIsActive());
        account.setRequiresCostCenter(request.getRequiresCostCenter());
        account.setRequiresDepartment(request.getRequiresDepartment());
        account.setAllowsManualEntry(request.getAllowsManualEntry());

        GlAccount savedAccount = glAccountRepository.save(account);
        log.info("GL account updated successfully: {}", id);

        return toResponse(savedAccount);
    }

    /**
     * Archive (soft delete) GL account
     */
    public void archiveGlAccount(UUID id) {
        log.info("Archiving GL account: {}", id);

        GlAccount account = glAccountRepository.findById(id)
            .filter(ga -> !ga.getIsDeleted())
            .orElseThrow(() -> new EntityNotFoundException("GL account not found: " + id));

        account.setIsDeleted(true);
        account.setIsActive(false);
        glAccountRepository.save(account);

        log.info("GL account archived successfully: {}", id);
    }

    /**
     * Get full account hierarchy as tree
     */
    @Transactional(readOnly = true)
    public List<GlAccountResponse> getAccountHierarchy(UUID companyId) {
        // Get all top-level accounts (no parent)
        List<GlAccount> topLevelAccounts = glAccountRepository.findByCompanyIdAndIsDeletedFalse(companyId, Pageable.unpaged())
            .getContent()
            .stream()
            .filter(ga -> ga.getParentAccount() == null)
            .collect(Collectors.toList());

        return topLevelAccounts.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    /**
     * Convert entity to response DTO
     */
    private GlAccountResponse toResponse(GlAccount account) {
        List<GlAccountResponse> childResponses = account.getChildAccounts()
            .stream()
            .filter(ga -> !ga.getIsDeleted())
            .map(this::toResponse)
            .collect(Collectors.toList());

        return GlAccountResponse.builder()
            .id(account.getId())
            .accountCode(account.getAccountCode())
            .accountName(account.getAccountName())
            .accountType(account.getAccountType())
            .normalBalance(account.getNormalBalance())
            .parentAccountId(account.getParentAccount() != null ? account.getParentAccount().getId() : null)
            .companyId(account.getCompanyId())
            .level(account.getLevel())
            .isActive(account.getIsActive())
            .description(account.getDescription())
            .requiresCostCenter(account.getRequiresCostCenter())
            .requiresDepartment(account.getRequiresDepartment())
            .allowsManualEntry(account.getAllowsManualEntry())
            .balance(account.getBalance())
            .childAccounts(childResponses)
            .createdAt(account.getCreatedAt())
            .updatedAt(account.getUpdatedAt())
            .createdBy(account.getCreatedBy())
            .build();
    }
}
