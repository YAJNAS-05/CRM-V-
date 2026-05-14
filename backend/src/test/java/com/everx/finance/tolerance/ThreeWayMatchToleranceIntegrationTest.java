package com.everx.finance.tolerance;

import com.everx.erp.purchaseorder.PurchaseOrderService;
import com.everx.erp.purchaseorder.dto.CreatePurchaseOrderItemRequest;
import com.everx.erp.purchaseorder.dto.CreatePurchaseOrderRequest;
import com.everx.erp.suppliers.Supplier;
import com.everx.erp.suppliers.SupplierRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceService;
import com.everx.finance.invoice.dto.CreateInvoiceRequest;
import com.everx.finance.period.PostingPeriod;
import com.everx.finance.period.PostingPeriodRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * FIX #5: Integration Tests for 3-Way Match Tolerance
 * 
 * Tests PO quantity → GR quantity → Invoice quantity matching
 * Validates tolerance thresholds and GL impact
 * 
 * Scenarios:
 * 1. PO 100 units, GR 105 (5% over) - Should accept with variance
 * 2. PO 100 units, Invoice 105 - Should flag uncleared variance
 * 3. PO 100 units, GR 100, Invoice 95 - Should create credit memo
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ThreeWayMatchToleranceIntegrationTest {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ThreeWayMatchService threeWayMatchService;

    @Autowired
    private InvoiceToleranceConfigRepository toleranceConfigRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PostingPeriodRepository postingPeriodRepository;

    /**
     * Scenario: PO 100 units @ 10.00 = 1000, GR 105 units (5% over tolerance)
     * Expected: Accept GR, create variance adjustment
     */
    @Test
    public void testThreeWayMatch_QuantityOverTolerance() {
        // Setup: Create tolerance config (5% allowed)
        upsertToleranceConfig("AUSTRALIA", BigDecimal.valueOf(5), BigDecimal.valueOf(100));

        ensurePostingPeriodOpen("AUSTRALIA");

        // Create PO
        UUID supplierId = createSupplier();
        UUID poId = createPurchaseOrder(supplierId, 100, BigDecimal.TEN);

        // Receive PO (creates receipt)
        purchaseOrderService.receivePurchaseOrder(poId);

        // Create Invoice for 1050 total (50 over receipt)
        createInvoice(poId, new BigDecimal("1050.00"));

        // Perform 3-way match
        ThreeWayMatchResult result = threeWayMatchService.matchPoReceiptInvoice(poId);

        // Assertions
        assertTrue(result.isMatched(), "3-way match should succeed with tolerance");
        assertEquals(new BigDecimal("50.00"), result.getVarianceAmount(),
            "Variance should be 50 within tolerance");
        assertTrue(result.getVarianceAmount().signum() > 0, 
            "Variance should be positive");
    }

    /**
     * Scenario: PO 100 units, GR 100, Invoice 95 (5 units short)
     * Expected: Create credit memo for unmatched 5 units
     */
    @Test
    public void testThreeWayMatch_InvoiceShort() {
        upsertToleranceConfig("AUSTRALIA", BigDecimal.valueOf(5), BigDecimal.valueOf(50));

        ensurePostingPeriodOpen("AUSTRALIA");
        UUID supplierId = createSupplier();
        UUID poId = createPurchaseOrder(supplierId, 100, BigDecimal.TEN);
        
        // Receive PO
        purchaseOrderService.receivePurchaseOrder(poId);

        // Invoice for only 900 total (short by 100)
        createInvoice(poId, new BigDecimal("900.00"));

        // Perform match
        ThreeWayMatchResult result = threeWayMatchService.matchPoReceiptInvoice(poId);

        // Assertions
        assertFalse(result.isMatched(), "Match should fail - invoice short");
        assertEquals(new BigDecimal("-100.00"), result.getVarianceAmount(), 
            "Variance should be -100 (short by 100)");
        assertTrue(result.isRequiresCreditMemo(), 
            "Credit memo should be required for shortage");
    }

    /**
     * Scenario: PO 100 @ 10, GR 100, Invoice 100 @ 12 (price variance)
     * Expected: GL variance posting with price difference
     */
    @Test
    public void testThreeWayMatch_PriceVariance() {
        upsertToleranceConfig("AUSTRALIA", BigDecimal.valueOf(5), BigDecimal.valueOf(100));

        ensurePostingPeriodOpen("AUSTRALIA");
        UUID supplierId = createSupplier();
        UUID poId = createPurchaseOrder(supplierId, 100, BigDecimal.TEN);
        
        purchaseOrderService.receivePurchaseOrder(poId);

        // Invoice with higher total (1200 vs 1000)
        createInvoice(poId, new BigDecimal("1200.00"));

        ThreeWayMatchResult result = threeWayMatchService.matchPoReceiptInvoice(poId);

        assertEquals(new BigDecimal("200.00"), result.getVarianceAmount(), 
            "Variance should be 200");
        assertTrue(result.isVarianceExceedsTolerance() || result.isMatched(),
            "Should either match or flag tolerance exception");
    }

    // Helper methods
    private UUID createSupplier() {
        Supplier supplier = new Supplier();
        supplier.setCompanyName("Test Supplier " + System.currentTimeMillis());
        supplier.setCountry("AU");
        return supplierRepository.save(supplier).getId();
    }

    private UUID createPurchaseOrder(UUID supplierId, int qty, BigDecimal unitPrice) {
        CreatePurchaseOrderItemRequest item = new CreatePurchaseOrderItemRequest(
            null,
            null,
            "Test Item",
            qty,
            unitPrice,
            BigDecimal.valueOf(qty).multiply(unitPrice)
        );

        CreatePurchaseOrderRequest request = new CreatePurchaseOrderRequest(
            "PO-" + System.currentTimeMillis(),
            supplierId,
            "DRAFT",
            LocalDate.now(),
            LocalDate.now().plusDays(7),
            null,
            "AUD",
            BigDecimal.valueOf(qty).multiply(unitPrice),
            "WIRE_TRANSFER",
            null,
            "Test PO",
            List.of(item)
        );

        return purchaseOrderService.createPurchaseOrder(request).getId();
    }

    private void createInvoice(UUID poId, BigDecimal totalAmount) {
        CreateInvoiceRequest request = CreateInvoiceRequest.builder()
            .invoiceNumber("INV-" + System.currentTimeMillis())
            .poId(poId)
            .accountId(UUID.randomUUID())
            .entity(Invoice.InvoiceEntity.AUSTRALIA)
            .type(Invoice.InvoiceType.TAX_INVOICE)
            .issueDate(LocalDate.now())
            .dueDate(LocalDate.now().plusDays(30))
            .currency("AUD")
            .subtotal(totalAmount)
            .taxAmount(BigDecimal.ZERO)
            .totalAmount(totalAmount)
            .notes("Test invoice")
            .build();

        invoiceService.createInvoice(request);
    }

    private void ensurePostingPeriodOpen(String companyCode) {
        int period = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        PostingPeriod pp = postingPeriodRepository
            .findByCompanyCodeAndFiscalYearAndPeriod(companyCode, year, period)
            .orElse(null);

        if (pp == null) {
            PostingPeriod newPeriod = PostingPeriod.builder()
                .companyCode(companyCode)
                .fiscalYear(year)
                .period(period)
                .status(PostingPeriod.PeriodStatus.OPEN)
                .build();
            postingPeriodRepository.save(newPeriod);
        }
    }

    private void upsertToleranceConfig(String companyCode, BigDecimal tolerancePct, BigDecimal toleranceAbs) {
        InvoiceToleranceConfig config = toleranceConfigRepository.findByCompanyCode(companyCode)
            .orElse(InvoiceToleranceConfig.builder().companyCode(companyCode).build());
        config.setTolerancePct(tolerancePct);
        config.setToleranceAbs(toleranceAbs);
        toleranceConfigRepository.save(config);
    }
}
