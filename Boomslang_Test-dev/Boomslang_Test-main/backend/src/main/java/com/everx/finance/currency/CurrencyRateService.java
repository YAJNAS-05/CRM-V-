package com.everx.finance.currency;

import com.everx.finance.currency.dto.CreateCurrencyRateRequest;
import com.everx.finance.currency.dto.CurrencyRateResponse;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurrencyRateService {

    private final CurrencyRateRepository currencyRateRepository;

    @Transactional(readOnly = true)
    public List<CurrencyRateResponse> getAllRates() {
        return currencyRateRepository.findAllLatest()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CurrencyRateResponse getRateById(UUID id) {
        CurrencyRate rate = currencyRateRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Currency rate not found with id: " + id));
        return toResponse(rate);
    }

    @Transactional(readOnly = true)
    public CurrencyRateResponse getLatestRate(String baseCurrency, String targetCurrency) {
        CurrencyRate rate = currencyRateRepository.findLatestRate(baseCurrency, targetCurrency)
                .orElseThrow(() -> new EntityNotFoundException("Currency rate not found for " + baseCurrency + " to " + targetCurrency));
        return toResponse(rate);
    }

    @Transactional(readOnly = true)
    public List<CurrencyRateResponse> getRatesByBaseCurrency(String baseCurrency) {
        return currencyRateRepository.findByBaseCurrency(baseCurrency)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CurrencyRateResponse createRate(CreateCurrencyRateRequest request) {
        CurrencyRate rate = CurrencyRate.builder()
                .baseCurrency(request.getBaseCurrency())
                .targetCurrency(request.getTargetCurrency())
                .rate(request.getRate())
                .fetchedAt(LocalDateTime.now())
                .build();

        rate.setCreatedAt(OffsetDateTime.now());
        rate.setUpdatedAt(OffsetDateTime.now());

        CurrencyRate saved = currencyRateRepository.save(rate);
        return toResponse(saved);
    }

    @Transactional
    public CurrencyRateResponse updateRate(String baseCurrency, String targetCurrency, BigDecimal newRate) {
        CurrencyRate rate = currencyRateRepository.findLatestRate(baseCurrency, targetCurrency)
                .orElseThrow(() -> new EntityNotFoundException("Currency rate not found for " + baseCurrency + " to " + targetCurrency));

        rate.setRate(newRate);
        rate.setFetchedAt(LocalDateTime.now());
        rate.setUpdatedAt(OffsetDateTime.now());

        CurrencyRate updated = currencyRateRepository.save(rate);
        return toResponse(updated);
    }

    @Transactional
    public void deleteRate(UUID id) {
        CurrencyRate rate = currencyRateRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Currency rate not found with id: " + id));
        rate.setIsDeleted(true);
        rate.setUpdatedAt(OffsetDateTime.now());
        currencyRateRepository.save(rate);
    }

    @Transactional(readOnly = true)
    public BigDecimal convertAmount(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        CurrencyRate rate = currencyRateRepository.findLatestRate(fromCurrency, toCurrency)
                .orElseThrow(() -> new EntityNotFoundException("Currency rate not found for " + fromCurrency + " to " + toCurrency));

        return amount.multiply(rate.getRate());
    }

    private CurrencyRateResponse toResponse(CurrencyRate rate) {
        return CurrencyRateResponse.builder()
                .id(rate.getId())
                .baseCurrency(rate.getBaseCurrency())
                .targetCurrency(rate.getTargetCurrency())
                .rate(rate.getRate())
                .fetchedAt(rate.getFetchedAt())
                .createdAt(rate.getCreatedAt().toLocalDateTime())
                .updatedAt(rate.getUpdatedAt().toLocalDateTime())
                .build();
    }
}
