package com.everx.erp.settings;

import com.everx.erp.settings.dto.NumberingPatternDto;
import com.everx.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/erp/settings")
@RequiredArgsConstructor
public class ErpSettingsController {

    private final NumberingPatternService numberingPatternService;

    @GetMapping("/numbering-pattern/{documentType}")
    public ApiResponse<NumberingPatternDto> getNumberingPattern(@PathVariable String documentType) {
        return ApiResponse.success(numberingPatternService.getPattern(documentType));
    }

    @PostMapping("/numbering-pattern/{documentType}")
    public ApiResponse<NumberingPatternDto> saveNumberingPattern(
            @PathVariable String documentType,
            @RequestBody NumberingPatternDto dto) {
        return ApiResponse.success(numberingPatternService.createOrUpdatePattern(documentType, dto));
    }

    @PostMapping("/numbering-pattern/{documentType}/preview")
    public ApiResponse<String> previewNumberingPattern(
            @PathVariable String documentType,
            @RequestBody NumberingPatternDto dto) {
        return ApiResponse.success(numberingPatternService.generatePreview(dto));
    }
}
