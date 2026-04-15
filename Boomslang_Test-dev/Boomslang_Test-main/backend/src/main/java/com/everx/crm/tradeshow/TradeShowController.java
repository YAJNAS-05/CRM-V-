package com.everx.crm.tradeshow;

import com.everx.crm.tradeshow.dto.CreateTradeShowRequest;
import com.everx.crm.tradeshow.dto.TradeShowDto;
import com.everx.crm.tradeshow.dto.UpdateTradeShowRequest;
import com.everx.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm/tradeshows")
@RequiredArgsConstructor
public class TradeShowController {

    private final TradeShowService tradeShowService;

    @PostMapping
    public ResponseEntity<ApiResponse<TradeShowDto>> createTradeShow(@Valid @RequestBody CreateTradeShowRequest request) {
        TradeShowDto tradeShow = tradeShowService.createTradeShow(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(tradeShow, "Trade show created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TradeShowDto>> getTradeShowById(@PathVariable UUID id) {
        TradeShowDto tradeShow = tradeShowService.getTradeShowById(id);
        return ResponseEntity.ok(ApiResponse.ok(tradeShow));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TradeShowDto>>> getAllTradeShows(Pageable pageable) {
        Page<TradeShowDto> tradeShows = tradeShowService.getAllTradeShows(pageable);
        return ResponseEntity.ok(ApiResponse.ok(tradeShows));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<TradeShowDto>>> getUpcomingTradeShows() {
        List<TradeShowDto> tradeShows = tradeShowService.getUpcomingTradeShows();
        return ResponseEntity.ok(ApiResponse.ok(tradeShows));
    }

    @GetMapping("/country/{country}")
    public ResponseEntity<ApiResponse<List<TradeShowDto>>> getTradeShowsByCountry(@PathVariable String country) {
        List<TradeShowDto> tradeShows = tradeShowService.getTradeShowsByCountry(country);
        return ResponseEntity.ok(ApiResponse.ok(tradeShows));
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<TradeShowDto>>> getTradeShowsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TradeShowDto> tradeShows = tradeShowService.getTradeShowsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(tradeShows));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TradeShowDto>> updateTradeShow(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTradeShowRequest request) {
        TradeShowDto tradeShow = tradeShowService.updateTradeShow(id, request);
        return ResponseEntity.ok(ApiResponse.ok(tradeShow, "Trade show updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTradeShow(@PathVariable UUID id) {
        tradeShowService.deleteTradeShow(id);
        return ResponseEntity.ok(ApiResponse.okMessage("Trade show deleted successfully"));
    }
}
