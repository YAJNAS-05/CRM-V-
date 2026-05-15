package com.everx.erp.numbering;

import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.function.Predicate;

@Component
@RequiredArgsConstructor
public class DocumentNumberGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;
    private static final int MAX_ATTEMPTS = 50;
    private static final int MAX_SEQUENCE_ROW_RETRIES = 3;

    private final DocumentNumberSequenceRepository sequenceRepository;

    @Transactional
    public String generate(String prefix, Predicate<String> existsCheck) {
        String normalizedPrefix = prefix.toUpperCase(Locale.ROOT);

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            long nextSequence = allocateNextSequence(normalizedPrefix);
            String candidate = buildCandidate(normalizedPrefix, nextSequence);
            if (!existsCheck.test(candidate)) {
                return candidate;
            }
        }

        throw new ValidationException("Unable to generate a unique document number for prefix: " + normalizedPrefix);
    }

    private long allocateNextSequence(String prefix) {
        for (int attempt = 0; attempt < MAX_SEQUENCE_ROW_RETRIES; attempt++) {
            var existing = sequenceRepository.findByPrefixForUpdate(prefix);
            if (existing.isPresent()) {
                DocumentNumberSequence sequence = existing.get();
                long nextValue = sequence.getLastNumber() + 1;
                sequence.setLastNumber(nextValue);
                sequenceRepository.save(sequence);
                return nextValue;
            }

            try {
                sequenceRepository.saveAndFlush(DocumentNumberSequence.builder()
                        .prefix(prefix)
                        .lastNumber(1L)
                        .build());
                return 1L;
            } catch (DataIntegrityViolationException ignored) {
                // Another transaction created this prefix row; retry with row lock.
            }
        }

        throw new ValidationException("Unable to allocate next sequence for prefix: " + prefix);
    }

    private String buildCandidate(String prefix, long sequence) {
        String datePart = LocalDate.now().format(DATE_FORMATTER);
        return String.format("%s-%s-%06d", prefix, datePart, sequence);
    }
}