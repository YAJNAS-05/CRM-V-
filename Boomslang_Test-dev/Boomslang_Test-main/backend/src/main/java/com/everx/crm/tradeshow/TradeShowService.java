package com.everx.crm.tradeshow;

import com.everx.crm.tradeshow.dto.CreateTradeShowRequest;
import com.everx.crm.tradeshow.dto.TradeShowDto;
import com.everx.crm.tradeshow.dto.UpdateTradeShowRequest;
import com.everx.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradeShowService {

    private final TradeShowRepository tradeShowRepository;

    @Transactional
    public TradeShowDto createTradeShow(CreateTradeShowRequest request) {
        TradeShow tradeShow = new TradeShow();
        tradeShow.setName(request.getName());
        tradeShow.setLocation(request.getLocation());
        tradeShow.setCountry(request.getCountry());
        tradeShow.setStartDate(request.getStartDate());
        tradeShow.setEndDate(request.getEndDate());
        tradeShow.setAttendees(request.getAttendees());
        tradeShow.setLeadsCaptured(request.getLeadsCaptured() != null ? request.getLeadsCaptured() : 0);
        tradeShow.setEstimatedRoi(request.getEstimatedRoi());
        tradeShow.setNotes(request.getNotes());

        TradeShow saved = tradeShowRepository.save(tradeShow);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public TradeShowDto getTradeShowById(UUID id) {
        TradeShow tradeShow = tradeShowRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Trade show not found with id: " + id));
        return toDto(tradeShow);
    }

    @Transactional(readOnly = true)
    public Page<TradeShowDto> getAllTradeShows(Pageable pageable) {
        return tradeShowRepository.findAllNotDeleted(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<TradeShowDto> getUpcomingTradeShows() {
        return tradeShowRepository.findUpcomingTradeShows(LocalDate.now()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TradeShowDto> getTradeShowsByCountry(String country) {
        return tradeShowRepository.findByCountry(country).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TradeShowDto> getTradeShowsByDateRange(LocalDate startDate, LocalDate endDate) {
        return tradeShowRepository.findByDateRange(startDate, endDate).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TradeShowDto updateTradeShow(UUID id, UpdateTradeShowRequest request) {
        TradeShow tradeShow = tradeShowRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Trade show not found with id: " + id));

        if (request.getName() != null) tradeShow.setName(request.getName());
        if (request.getLocation() != null) tradeShow.setLocation(request.getLocation());
        if (request.getCountry() != null) tradeShow.setCountry(request.getCountry());
        if (request.getStartDate() != null) tradeShow.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) tradeShow.setEndDate(request.getEndDate());
        if (request.getAttendees() != null) tradeShow.setAttendees(request.getAttendees());
        if (request.getLeadsCaptured() != null) tradeShow.setLeadsCaptured(request.getLeadsCaptured());
        if (request.getEstimatedRoi() != null) tradeShow.setEstimatedRoi(request.getEstimatedRoi());
        if (request.getNotes() != null) tradeShow.setNotes(request.getNotes());

        TradeShow updated = tradeShowRepository.save(tradeShow);
        return toDto(updated);
    }

    @Transactional
    public void deleteTradeShow(UUID id) {
        TradeShow tradeShow = tradeShowRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new EntityNotFoundException("Trade show not found with id: " + id));
        tradeShow.softDelete();
        tradeShowRepository.save(tradeShow);
    }

    private TradeShowDto toDto(TradeShow tradeShow) {
        TradeShowDto dto = new TradeShowDto();
        dto.setId(tradeShow.getId());
        dto.setName(tradeShow.getName());
        dto.setLocation(tradeShow.getLocation());
        dto.setCountry(tradeShow.getCountry());
        dto.setStartDate(tradeShow.getStartDate());
        dto.setEndDate(tradeShow.getEndDate());
        dto.setAttendees(tradeShow.getAttendees());
        dto.setLeadsCaptured(tradeShow.getLeadsCaptured());
        dto.setEstimatedRoi(tradeShow.getEstimatedRoi());
        dto.setNotes(tradeShow.getNotes());
        dto.setCreatedAt(tradeShow.getCreatedAt().toInstant());
        dto.setUpdatedAt(tradeShow.getUpdatedAt().toInstant());
        return dto;
    }
}
