package com.everx.crm.account;

import com.everx.crm.account.dto.AccountDto;
import com.everx.crm.account.dto.CreateAccountRequest;
import com.everx.crm.account.dto.UpdateAccountRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@Slf4j
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    public Page<AccountDto> getAllAccounts(Pageable pageable) {
        log.info("Fetching accounts page {} size {}", pageable.getPageNumber(), pageable.getPageSize());
        return accountRepository.findAllActive(pageable).map(AccountDto::fromEntity);
    }

    public AccountDto getAccountById(UUID accountId) {
        log.info("Fetching account by ID {}", accountId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + accountId));
        return AccountDto.fromEntity(account);
    }

    public AccountDto createAccount(CreateAccountRequest request) {
        log.info("Creating account {}", request.getName());
        Account account = Account.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .accountType(request.getAccountType())
                .website(request.getWebsite())
                .phone(request.getPhone())
                .email(request.getEmail())
                .billingStreet(request.getBillingStreet())
                .billingCity(request.getBillingCity())
                .billingState(request.getBillingState())
                .billingZip(request.getBillingZip())
                .billingCountry(request.getBillingCountry())
                .annualRevenue(request.getAnnualRevenue())
                .employees(request.getEmployees())
                .description(request.getDescription())
                .ownerId(request.getOwnerId())
                .build();
        return AccountDto.fromEntity(accountRepository.save(account));
    }

    public AccountDto updateAccount(UUID accountId, UpdateAccountRequest request) {
        log.info("Updating account {}", accountId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + accountId));

        if (request.getName() != null) account.setName(request.getName());
        if (request.getIndustry() != null) account.setIndustry(request.getIndustry());
        if (request.getAccountType() != null) account.setAccountType(request.getAccountType());
        if (request.getWebsite() != null) account.setWebsite(request.getWebsite());
        if (request.getPhone() != null) account.setPhone(request.getPhone());
        if (request.getEmail() != null) account.setEmail(request.getEmail());
        if (request.getBillingStreet() != null) account.setBillingStreet(request.getBillingStreet());
        if (request.getBillingCity() != null) account.setBillingCity(request.getBillingCity());
        if (request.getBillingState() != null) account.setBillingState(request.getBillingState());
        if (request.getBillingZip() != null) account.setBillingZip(request.getBillingZip());
        if (request.getBillingCountry() != null) account.setBillingCountry(request.getBillingCountry());
        if (request.getAnnualRevenue() != null) account.setAnnualRevenue(request.getAnnualRevenue());
        if (request.getEmployees() != null) account.setEmployees(request.getEmployees());
        if (request.getDescription() != null) account.setDescription(request.getDescription());
        if (request.getOwnerId() != null) account.setOwnerId(request.getOwnerId());

        return AccountDto.fromEntity(accountRepository.save(account));
    }

    public void deleteAccount(UUID accountId) {
        log.info("Soft deleting account {}", accountId);
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + accountId));
        account.softDelete();
        accountRepository.save(account);
    }

    public Page<AccountDto> searchAccounts(String query, Pageable pageable) {
        log.info("Searching accounts with query {}", query);
        return accountRepository.findByNameContains(query, pageable).map(AccountDto::fromEntity);
    }
}
