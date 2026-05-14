package com.everx.hr.holiday;

import com.everx.hr.holiday.dto.CreateHolidayRequest;
import com.everx.hr.holiday.dto.HolidayDto;
import com.everx.hr.holiday.dto.UpdateHolidayRequest;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;

    @Transactional
    public HolidayDto createHoliday(CreateHolidayRequest request) {
        validateDates(request.getHolidayDate());

        Holiday holiday = new Holiday();
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setName(request.getName());
        holiday.setRegion(request.getRegion());
        holiday.setOptional(Boolean.TRUE.equals(request.getOptional()));
        holiday.setDescription(request.getDescription());
        return toDto(holidayRepository.save(holiday));
    }

    @Transactional(readOnly = true)
    public HolidayDto getHoliday(UUID id) {
        Holiday holiday = holidayRepository.findById(id)
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found with id: " + id));
        return toDto(holiday);
    }

    @Transactional(readOnly = true)
    public Page<HolidayDto> getHolidays(Pageable pageable, String region, LocalDate startDate, LocalDate endDate) {
        return holidayRepository.findAllFiltered(region, startDate, endDate, pageable)
                .map(this::toDto);
    }

    @Transactional
    public HolidayDto updateHoliday(UUID id, UpdateHolidayRequest request) {
        Holiday holiday = holidayRepository.findById(id)
                .filter(h -> !Boolean.TRUE.equals(h.getIsDeleted()))
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found with id: " + id));

        if (request.getHolidayDate() != null) {
            validateDates(request.getHolidayDate());
            holiday.setHolidayDate(request.getHolidayDate());
        }
        if (request.getName() != null) holiday.setName(request.getName());
        if (request.getRegion() != null) holiday.setRegion(request.getRegion());
        if (request.getOptional() != null) holiday.setOptional(request.getOptional());
        if (request.getDescription() != null) holiday.setDescription(request.getDescription());

        return toDto(holidayRepository.save(holiday));
    }

    private void validateDates(LocalDate holidayDate) {
        if (holidayDate == null) {
            throw new ValidationException("Holiday date is required");
        }
    }

    private HolidayDto toDto(Holiday holiday) {
        HolidayDto dto = new HolidayDto();
        dto.setId(holiday.getId());
        dto.setHolidayDate(holiday.getHolidayDate());
        dto.setName(holiday.getName());
        dto.setRegion(holiday.getRegion());
        dto.setOptional(holiday.getOptional());
        dto.setDescription(holiday.getDescription());
        if (holiday.getCreatedAt() != null) {
            dto.setCreatedAt(holiday.getCreatedAt().toInstant());
        }
        if (holiday.getUpdatedAt() != null) {
            dto.setUpdatedAt(holiday.getUpdatedAt().toInstant());
        }
        return dto;
    }
}
