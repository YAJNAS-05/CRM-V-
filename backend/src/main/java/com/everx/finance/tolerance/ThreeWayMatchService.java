package com.everx.finance.tolerance;

import com.everx.erp.purchaseorder.PurchaseOrderRepository;
import com.everx.erp.purchaseorder.PurchaseReceipt;
import com.everx.erp.purchaseorder.PurchaseReceiptRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Service to perform 3-way matching: PO → Receipt → Invoice
 */
@Service
@RequiredArgsConstructor
public class ThreeWayMatchService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseReceiptRepository purchaseReceiptRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceToleranceConfigRepository toleranceConfigRepository;

    /**
     * Matches Purchase Order, Goods Receipt, and Invoice totals.
     */
    @Transactional(readOnly = true)
    public ThreeWayMatchResult matchPoReceiptInvoice(UUID poId) {
        purchaseOrderRepository.findByIdAndNotDeleted(poId)
                .orElseThrow(() -> new ValidationException("Purchase order not found: " + poId));

        PurchaseReceipt receipt = purchaseReceiptRepository.findTopByPoIdOrderByReceivedDateDesc(poId)
                .orElseThrow(() -> new ValidationException("No receipt found for PO: " + poId));

        Invoice invoice = invoiceRepository.findTopByPoIdAndIsDeletedFalseOrderByIssueDateDesc(poId)
                .orElseThrow(() -> new ValidationException("No invoice found for PO: " + poId));

        BigDecimal receiptAmount = receipt.getTotalAmount() != null ? receipt.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal invoiceAmount = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;

        BigDecimal variance = invoiceAmount.subtract(receiptAmount);
        BigDecimal absVariance = variance.abs();

        InvoiceToleranceConfig config = toleranceConfigRepository
                .findByCompanyCode(resolveCompanyCode(invoice.getEntity()))
                .orElse(InvoiceToleranceConfig.defaultConfig());

        BigDecimal tolerancePctAmount = receiptAmount
                .multiply(config.getTolerancePct())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        boolean withinTolerance = absVariance.compareTo(config.getToleranceAbs()) <= 0
                || absVariance.compareTo(tolerancePctAmount) <= 0;

        boolean exceedsTolerance = !withinTolerance;
        boolean requiresCreditMemo = variance.signum() < 0 && exceedsTolerance;

        String varianceReason = withinTolerance ? "WITHIN_TOLERANCE" :
                (variance.signum() > 0 ? "INVOICE_OVER_RECEIPT" : "INVOICE_UNDER_RECEIPT");

        return ThreeWayMatchResult.builder()
                .matched(!exceedsTolerance)
                .varianceAmount(variance)
                .varianceExceedsTolerance(exceedsTolerance)
                .requiresCreditMemo(requiresCreditMemo)
                .varianceReason(varianceReason)
                .build();
    }

    private String resolveCompanyCode(Invoice.InvoiceEntity entity) {
        if (entity == null) {
            return "DEFAULT";
        }
        return entity.name();
    }
}
