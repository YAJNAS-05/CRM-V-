package com.everx.finance.controller;

import com.everx.finance.dto.*;
import com.everx.finance.service.InvoiceService;
import com.everx.finance.service.PaymentService;
import com.everx.finance.service.CurrencyService;
import com.everx.finance.close.FinancialCloseService;
import com.everx.finance.aging.AccountsReceivableAgingService;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@Slf4j
public class FinanceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;
    private final CurrencyService currencyService;
    private final FinancialCloseService financialCloseService;
    private final AccountsReceivableAgingService agingService;

    // Invoice Management
    @GetMapping("/invoices")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> getAllInvoices(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/finance/invoices");
        Page<InvoiceDto> invoices = invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Invoices retrieved successfully"));
    }

    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<InvoiceDto>> getInvoiceById(@PathVariable UUID invoiceId) {
        log.info("GET /api/v1/finance/invoices/{}", invoiceId);
        InvoiceDto invoice = invoiceService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(ApiResponse.ok(invoice, "Invoice retrieved successfully"));
    }

    @GetMapping("/invoices/number/{invoiceNumber}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<InvoiceDto>> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        log.info("GET /api/v1/finance/invoices/number/{}", invoiceNumber);
        InvoiceDto invoice = invoiceService.getInvoiceByNumber(invoiceNumber);
        return ResponseEntity.ok(ApiResponse.ok(invoice, "Invoice retrieved successfully"));
    }

    @GetMapping("/invoices/account/{accountId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> getInvoicesByAccount(
            @PathVariable UUID accountId,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/finance/invoices/account/{}", accountId);
        Page<InvoiceDto> invoices = invoiceService.getInvoicesByAccount(accountId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Invoices retrieved successfully"));
    }

    @GetMapping("/invoices/status/{status}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> getInvoicesByStatus(
            @PathVariable String status,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/finance/invoices/status/{}", status);
        Page<InvoiceDto> invoices = invoiceService.getInvoicesByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Invoices retrieved successfully"));
    }

    @GetMapping("/invoices/entity/{entity}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<InvoiceDto>>> getInvoicesByEntity(
            @PathVariable String entity,
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/finance/invoices/entity/{}", entity);
        Page<InvoiceDto> invoices = invoiceService.getInvoicesByEntity(entity, pageable);
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Invoices retrieved successfully"));
    }

    @GetMapping("/invoices/overdue")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getOverdueInvoices() {
        log.info("GET /api/v1/finance/invoices/overdue");
        List<InvoiceDto> invoices = invoiceService.getOverdueInvoices();
        return ResponseEntity.ok(ApiResponse.ok(invoices, "Overdue invoices retrieved successfully"));
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAuthority('FINANCE_CREATE')")
    public ResponseEntity<ApiResponse<InvoiceDto>> createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        log.info("POST /api/v1/finance/invoices - Creating invoice");
        ApiResponse<InvoiceDto> response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/invoices/{invoiceId}")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<InvoiceDto>> updateInvoice(@PathVariable UUID invoiceId, @Valid @RequestBody UpdateInvoiceRequest request) {
        log.info("PUT /api/v1/finance/invoices/{} - Updating invoice", invoiceId);
        ApiResponse<InvoiceDto> response = invoiceService.updateInvoice(invoiceId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/invoices/{invoiceId}/status")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<InvoiceDto>> updateInvoiceStatus(@PathVariable UUID invoiceId, @RequestParam String status) {
        log.info("PATCH /api/v1/finance/invoices/{}/status - Updating status to: {}", invoiceId, status);
        ApiResponse<InvoiceDto> response = invoiceService.updateInvoiceStatus(invoiceId, status);
        return ResponseEntity.ok(response);
    }

    // Payment Management
    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<PaymentDto>>> getAllPayments(
            @PageableDefault(size = 20, page = 0, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("GET /api/v1/finance/payments");
        Page<PaymentDto> payments = paymentService.getAllPayments(pageable);
        return ResponseEntity.ok(ApiResponse.ok(payments, "Payments retrieved successfully"));
    }

    @GetMapping("/payments/{paymentId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<PaymentDto>> getPaymentById(@PathVariable UUID paymentId) {
        log.info("GET /api/v1/finance/payments/{}", paymentId);
        PaymentDto payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(ApiResponse.ok(payment, "Payment retrieved successfully"));
    }

    @GetMapping("/payments/invoice/{invoiceId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getPaymentsByInvoice(@PathVariable UUID invoiceId) {
        log.info("GET /api/v1/finance/payments/invoice/{}", invoiceId);
        List<PaymentDto> payments = paymentService.getPaymentsByInvoice(invoiceId);
        return ResponseEntity.ok(ApiResponse.ok(payments, "Payments retrieved successfully"));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAuthority('FINANCE_CREATE')")
    public ResponseEntity<ApiResponse<PaymentDto>> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        log.info("POST /api/v1/finance/payments - Creating payment");
        ApiResponse<PaymentDto> response = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Currency Management
    @GetMapping("/currencies/rates")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<CurrencyRateDto>>> getCurrencyRates() {
        log.info("GET /api/v1/finance/currencies/rates");
        List<CurrencyRateDto> rates = currencyService.getAllCurrencyRates();
        return ResponseEntity.ok(ApiResponse.ok(rates, "Currency rates retrieved successfully"));
    }

    @GetMapping("/currencies/rates/{fromCurrency}/{toCurrency}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<CurrencyRateDto>> getCurrencyRate(@PathVariable String fromCurrency, @PathVariable String toCurrency) {
        log.info("GET /api/v1/finance/currencies/rates/{}/{}", fromCurrency, toCurrency);
        CurrencyRateDto rate = currencyService.getCurrencyRate(fromCurrency, toCurrency);
        return ResponseEntity.ok(ApiResponse.ok(rate, "Currency rate retrieved successfully"));
    }

    @PostMapping("/currencies/rates")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<CurrencyRateDto>> createCurrencyRate(@Valid @RequestBody CreateCurrencyRateRequest request) {
        log.info("POST /api/v1/finance/currencies/rates - Creating currency rate");
        ApiResponse<CurrencyRateDto> response = currencyService.createCurrencyRate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Financial Close
    @GetMapping("/close/exceptions")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<ThreeWayMatchException>>> getExceptions(
            @RequestParam(required = false) String companyCode,
            @RequestParam(required = false) String status) {
        log.info("GET /api/v1/finance/close/exceptions - companyCode: {}, status: {}", companyCode, status);
        List<ThreeWayMatchException> exceptions = financialCloseService.getExceptions(companyCode, status);
        return ResponseEntity.ok(ApiResponse.ok(exceptions, "Financial close exceptions retrieved successfully"));
    }

    @PostMapping("/close/exceptions/{exceptionId}/resolve")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<ThreeWayMatchException>> resolveException(
            @PathVariable UUID exceptionId,
            @Valid @RequestBody ResolveMatchExceptionRequest request) {
        log.info("POST /api/v1/finance/close/exceptions/{}/resolve", exceptionId);
        ThreeWayMatchException resolved = financialCloseService.resolveException(exceptionId, request);
        return ResponseEntity.ok(ApiResponse.ok(resolved, "Exception resolved successfully"));
    }

    @PostMapping("/close/period/{companyCode}")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> closePeriod(@PathVariable String companyCode) {
        log.info("POST /api/v1/finance/close/period/{}", companyCode);
        financialCloseService.closePeriod(companyCode);
        return ResponseEntity.ok(ApiResponse.ok(null, "Period closed successfully"));
    }

    // Accounts Receivable Aging
    @GetMapping("/aging/ar")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<ArAgingReportDto>>> getArAgingReport(
            @RequestParam(required = false) String companyCode,
            @RequestParam(required = false) UUID customerId) {
        log.info("GET /api/v1/finance/aging/ar - companyCode: {}, customerId: {}", companyCode, customerId);
        List<ArAgingReportDto> report = agingService.generateARAgingReport(companyCode, customerId);
        return ResponseEntity.ok(ApiResponse.ok(report, "AR aging report retrieved successfully"));
    }

    @GetMapping("/aging/ar/customer/{customerId}")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<ArCustomerAgingDto>> getCustomerAging(@PathVariable UUID customerId) {
        log.info("GET /api/v1/finance/aging/ar/customer/{}", customerId);
        ArCustomerAgingDto aging = agingService.getCustomerAging(customerId);
        return ResponseEntity.ok(ApiResponse.ok(aging, "Customer aging retrieved successfully"));
    }

    @PostMapping("/aging/ar/refresh")
    @PreAuthorize("hasAuthority('FINANCE_UPDATE')")
    public ResponseEntity<ApiResponse<Void>> refreshAging(@RequestParam String companyCode) {
        log.info("POST /api/v1/finance/aging/ar/refresh - companyCode: {}", companyCode);
        agingService.refreshAgingData(companyCode);
        return ResponseEntity.ok(ApiResponse.ok(null, "Aging data refreshed successfully"));
    }

    // Dashboard and Analytics
    @GetMapping("/dashboard/overview")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getDashboardOverview(@RequestParam UUID tenantId) {
        log.info("GET /api/v1/finance/dashboard/overview - tenantId: {}", tenantId);
        Object overview = invoiceService.getDashboardOverview(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(overview, "Finance dashboard overview retrieved successfully"));
    }

    @GetMapping("/analytics/revenue")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getRevenueAnalytics(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String period) {
        log.info("GET /api/v1/finance/analytics/revenue - tenantId: {}, period: {}", tenantId, period);
        Object analytics = invoiceService.getRevenueAnalytics(tenantId, period);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Revenue analytics retrieved successfully"));
    }

    @GetMapping("/analytics/cash-flow")
    @PreAuthorize("hasAuthority('FINANCE_VIEW')")
    public ResponseEntity<ApiResponse<Object>> getCashFlowAnalytics(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) String period) {
        log.info("GET /api/v1/finance/analytics/cash-flow - tenantId: {}, period: {}", tenantId, period);
        Object analytics = paymentService.getCashFlowAnalytics(tenantId, period);
        return ResponseEntity.ok(ApiResponse.ok(analytics, "Cash flow analytics retrieved successfully"));
    }
}
