package com.everx.crm.account;

import com.everx.crm.account.dto.AccountDto;
import com.everx.crm.account.dto.CreateAccountRequest;
import com.everx.crm.account.dto.UpdateAccountRequest;
import com.everx.shared.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/accounts")
@Validated
@Slf4j
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<AccountDto>>> getAllAccounts(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/accounts");
        Page<AccountDto> accounts = accountService.getAllAccounts(pageable);
        return ResponseEntity.ok(ApiResponse.ok(accounts, "Accounts retrieved successfully"));
    }

    @GetMapping("/{accountId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<AccountDto>> getAccountById(@PathVariable UUID accountId) {
        log.info("GET /api/v1/crm/accounts/{}", accountId);
        AccountDto account = accountService.getAccountById(accountId);
        return ResponseEntity.ok(ApiResponse.ok(account, "Account retrieved successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CRM_VIEW')")
    public ResponseEntity<ApiResponse<Page<AccountDto>>> searchAccounts(
            @RequestParam("q") String q,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/crm/accounts/search?q={}", q);
        Page<AccountDto> accounts = accountService.searchAccounts(q, pageable);
        return ResponseEntity.ok(ApiResponse.ok(accounts, "Accounts search results"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CRM_CREATE')")
    public ResponseEntity<ApiResponse<AccountDto>> createAccount(@Valid @RequestBody CreateAccountRequest request) {
        log.info("POST /api/v1/crm/accounts");
        AccountDto account = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(account, "Account created successfully"));
    }

    @PutMapping("/{accountId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_EDIT')")
    public ResponseEntity<ApiResponse<AccountDto>> updateAccount(
            @PathVariable UUID accountId,
            @Valid @RequestBody UpdateAccountRequest request) {
        log.info("PUT /api/v1/crm/accounts/{}", accountId);
        AccountDto account = accountService.updateAccount(accountId, request);
        return ResponseEntity.ok(ApiResponse.ok(account, "Account updated successfully"));
    }

    @DeleteMapping("/{accountId:[0-9a-fA-F-]{36}}")
    @PreAuthorize("hasAuthority('CRM_DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable UUID accountId) {
        log.info("DELETE /api/v1/crm/accounts/{}", accountId);
        accountService.deleteAccount(accountId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Account deleted successfully"));
    }
}
