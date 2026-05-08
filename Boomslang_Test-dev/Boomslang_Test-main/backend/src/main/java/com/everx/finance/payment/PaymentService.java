package com.everx.finance.payment;

import com.everx.finance.payment.dto.CreatePaymentRequest;
import com.everx.finance.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Page<PaymentResponse> findAll(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::toResponse);
    }

    public PaymentResponse findById(UUID id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(payment);
    }

    public List<PaymentResponse> findByInvoice(UUID invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse create(CreatePaymentRequest request) {
        Payment payment = Payment.builder()
            .paymentNumber(generatePaymentNumber())
            .customerId(request.getCustomerId())
            .companyCode(request.getCompanyCode())
            .paymentDate(request.getPaymentDate())
            .amount(request.getAmount())
            .currency(request.getCurrency())
            .paymentMethod(request.getPaymentMethod())
            .status("COMPLETED")
            .build();
        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void delete(UUID id) {
        paymentRepository.deleteById(id);
    }

    private String generatePaymentNumber() {
        return "PAY-" + System.currentTimeMillis();
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
            .id(payment.getId())
            .paymentNumber(payment.getPaymentNumber())
            .customerId(payment.getCustomerId())
            .companyCode(payment.getCompanyCode())
            .paymentDate(payment.getPaymentDate())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .paymentMethod(payment.getPaymentMethod())
            .status(payment.getStatus())
            .build();
    }
}
