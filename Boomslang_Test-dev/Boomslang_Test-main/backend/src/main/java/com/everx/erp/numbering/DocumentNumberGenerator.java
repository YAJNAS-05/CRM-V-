package com.everx.erp.numbering;

import com.everx.shared.exception.ValidationException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import java.util.function.Predicate;

@Component
public class DocumentNumberGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;
    private static final int MAX_ATTEMPTS = 25;

    public String generate(String prefix, Predicate<String> existsCheck) {
        String normalizedPrefix = prefix.toUpperCase(Locale.ROOT);

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = buildCandidate(normalizedPrefix);
            if (!existsCheck.test(candidate)) {
                return candidate;
            }
        }

        throw new ValidationException("Unable to generate a unique document number for prefix: " + normalizedPrefix);
    }

    private String buildCandidate(String prefix) {
        String datePart = LocalDate.now().format(DATE_FORMATTER);
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
        return prefix + "-" + datePart + "-" + randomPart;
    }
}