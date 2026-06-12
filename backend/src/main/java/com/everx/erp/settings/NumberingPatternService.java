package com.everx.erp.settings;

import com.everx.erp.settings.dto.NumberingPatternDto;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NumberingPatternService {

    private final NumberingPatternRepository repository;

    @Transactional
    public NumberingPatternDto getPattern(String documentType) {
        return repository.findByDocumentType(documentType)
            .map(this::toDto)
            .orElseThrow(() -> new ValidationException("Numbering pattern not found for: " + documentType));
    }

    @Transactional
    public NumberingPatternDto createOrUpdatePattern(String documentType, NumberingPatternDto dto) {
        var existing = repository.findByDocumentType(documentType);

        NumberingPattern pattern;
        if (existing.isPresent()) {
            pattern = existing.get();
            pattern.setPrefix(dto.getPrefix());
            pattern.setPattern(dto.getPattern());
            pattern.setSequenceWidth(dto.getSequenceWidth() != null ? dto.getSequenceWidth() : 6);
            pattern.setDescription(dto.getDescription());
        } else {
            pattern = NumberingPattern.builder()
                .documentType(documentType)
                .prefix(dto.getPrefix())
                .pattern(dto.getPattern())
                .sequenceWidth(dto.getSequenceWidth() != null ? dto.getSequenceWidth() : 6)
                .nextSequence(dto.getNextSequence() != null ? dto.getNextSequence() : 1L)
                .description(dto.getDescription())
                .build();
        }

        pattern = repository.save(pattern);
        return toDto(pattern);
    }

    @Transactional
    public String generateNumber(String documentType) {
        var pattern = repository.findByDocumentType(documentType)
            .orElseThrow(() -> new ValidationException("Numbering pattern not found for: " + documentType));

        long currentSequence = pattern.getNextSequence();
        pattern.setNextSequence(currentSequence + 1);
        repository.save(pattern);

        return formatNumber(pattern, currentSequence);
    }

    private String formatNumber(NumberingPattern pattern, long sequence) {
        String result = pattern.getPattern();

        // Replace {PREFIX}
        result = result.replace("{PREFIX}", pattern.getPrefix());

        // Replace {YYYY}, {MM}, {DD}
        LocalDate today = LocalDate.now();
        result = result.replace("{YYYY}", String.valueOf(today.getYear()));
        result = result.replace("{MM}", String.format("%02d", today.getMonthValue()));
        result = result.replace("{DD}", String.format("%02d", today.getDayOfMonth()));

        // Replace {NNNNNN} with zero-padded sequence
        String sequencePlaceholder = "{N+}";
        if (result.contains("{N")) {
            // Find the N pattern like {NNNNNN}
            int startIdx = result.indexOf("{N");
            int endIdx = result.indexOf("}", startIdx);
            if (startIdx >= 0 && endIdx > startIdx) {
                String nPattern = result.substring(startIdx, endIdx + 1); // e.g., "{NNNNNN}"
                int width = nPattern.length() - 2; // Remove { and }
                String paddedSequence = String.format("%0" + width + "d", sequence);
                result = result.replace(nPattern, paddedSequence);
            }
        }

        return result;
    }

    public String generatePreview(NumberingPatternDto dto) {
        if (dto.getPattern() == null || dto.getPrefix() == null) {
            return "";
        }

        // Create a temporary pattern for preview
        NumberingPattern temp = NumberingPattern.builder()
            .prefix(dto.getPrefix())
            .pattern(dto.getPattern())
            .sequenceWidth(dto.getSequenceWidth() != null ? dto.getSequenceWidth() : 6)
            .build();

        long nextSeq = dto.getNextSequence() != null ? dto.getNextSequence() : 1L;
        return formatNumber(temp, nextSeq);
    }

    private NumberingPatternDto toDto(NumberingPattern pattern) {
        return NumberingPatternDto.builder()
            .id(pattern.getId())
            .documentType(pattern.getDocumentType())
            .prefix(pattern.getPrefix())
            .pattern(pattern.getPattern())
            .sequenceWidth(pattern.getSequenceWidth())
            .nextSequence(pattern.getNextSequence())
            .description(pattern.getDescription())
            .createdAt(pattern.getCreatedAt())
            .updatedAt(pattern.getUpdatedAt())
            .example(generatePreview(NumberingPatternDto.builder()
                .prefix(pattern.getPrefix())
                .pattern(pattern.getPattern())
                .sequenceWidth(pattern.getSequenceWidth())
                .nextSequence(pattern.getNextSequence())
                .build()))
            .build();
    }
}
