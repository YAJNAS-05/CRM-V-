package com.everx.finance.account;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountDeterminationService {

    private final AccountDeterminationRepository repository;

    public List<AccountDetermination> findAll() {
        return repository.findAll();
    }

    public AccountDetermination findById(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Account determination not found"));
    }

    @Transactional
    public AccountDetermination create(CreateAccountDeterminationRequest request) {
        AccountDetermination entity = AccountDetermination.builder()
            .companyCode(request.getCompanyCode())
            .transactionKey(request.getTransactionKey())
            .valuationClass(request.getValuationClass())
            .glAccount(request.getGlAccount())
            .description(request.getDescription())
            .effectiveFrom(request.getEffectiveFrom() != null ? request.getEffectiveFrom() : LocalDate.now())
            .effectiveTo(request.getEffectiveTo())
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .build();
        return repository.save(entity);
    }

    @Transactional
    public AccountDetermination update(UUID id, AccountDetermination request) {
        AccountDetermination existing = findById(id);
        existing.setCompanyCode(request.getCompanyCode());
        existing.setTransactionKey(request.getTransactionKey());
        existing.setValuationClass(request.getValuationClass());
        existing.setGlAccount(request.getGlAccount());
        existing.setDescription(request.getDescription());
        existing.setEffectiveFrom(request.getEffectiveFrom());
        existing.setEffectiveTo(request.getEffectiveTo());
        existing.setIsActive(request.getIsActive());
        return repository.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    public AccountDeterminationResponse determineAccount(String companyCode, String transactionKey, String valuationClass) {
        AccountDetermination det = repository.findByKeys(companyCode, transactionKey, valuationClass, LocalDate.now())
            .orElseThrow(() -> new AccountDeterminationException("No account determination found"));
        return AccountDeterminationResponse.builder()
            .glAccount(det.getGlAccount())
            .description(det.getDescription())
            .transactionKey(det.getTransactionKey())
            .valuationClass(det.getValuationClass())
            .build();
    }
}
