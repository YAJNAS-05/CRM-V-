package com.everx.erp.fieldwork.gps;

import com.everx.erp.fieldwork.FieldJob;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.erp.fieldwork.gps.dto.*;
import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import com.everx.shared.exception.EntityNotFoundException;
import com.everx.websocket.RealTimeNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GpsTrackingService {

    private final GpsTrackingRepository gpsRepository;
    private final FieldJobRepository fieldJobRepository;
    private final EmployeeRepository employeeRepository;
    private final RealTimeNotificationService notificationService;

    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;

    @Transactional
    public GpsTrackingPointDto recordLocation(RecordLocationRequest request) {
        // Validate job exists
        FieldJob job = fieldJobRepository.findByIdActive(request.getJobId())
            .orElseThrow(() -> new EntityNotFoundException("Field job not found: " + request.getJobId()));

        // Validate engineer exists
        Employee engineer = employeeRepository.findById(request.getEngineerId())
            .orElseThrow(() -> new EntityNotFoundException("Engineer not found: " + request.getEngineerId()));

        GpsTrackingPoint point = new GpsTrackingPoint();
        point.setJobId(request.getJobId());
        point.setEngineerId(request.getEngineerId());
        point.setLatitude(request.getLatitude());
        point.setLongitude(request.getLongitude());
        point.setAltitude(request.getAltitude());
        point.setAccuracy(request.getAccuracy());
        point.setSpeed(request.getSpeed());
        point.setHeading(request.getHeading());
        point.setTimestamp(request.getTimestamp() != null ? request.getTimestamp() : OffsetDateTime.now());
        point.setPointType(request.getPointType());
        point.setBatteryLevel(request.getBatteryLevel());
        point.setDeviceId(request.getDeviceId());
        point.setAddress(request.getAddress());
        point.setNotes(request.getNotes());

        GpsTrackingPoint saved = gpsRepository.save(point);

        // Check geofence if job has location data
        checkGeofence(job, saved);

        // Notify via WebSocket for real-time tracking
        notifyLocationUpdate(saved, engineer.getFullName());

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<GpsTrackingPointDto> getJobRoute(UUID jobId, OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null) {
            // Default to last 24 hours if no range specified
            end = OffsetDateTime.now();
            start = end.minusDays(1);
        }

        return gpsRepository.findByJobIdAndTimestampBetweenOrderByTimestampAsc(jobId, start, end)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GpsTrackingPointDto> getEngineerRoute(UUID engineerId, OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null) {
            end = OffsetDateTime.now();
            start = end.minusDays(1);
        }

        return gpsRepository.findByEngineerIdAndTimestampBetweenOrderByTimestampAsc(engineerId, start, end)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CurrentLocationDto getCurrentLocation(UUID engineerId) {
        List<GpsTrackingPoint> recentPoints = gpsRepository.findRecentByEngineerId(
            engineerId, OffsetDateTime.now().minusMinutes(30));

        if (recentPoints.isEmpty()) {
            return null;
        }

        GpsTrackingPoint latest = recentPoints.get(0);
        Employee engineer = employeeRepository.findById(engineerId).orElse(null);

        // Check if currently checked into a job
        Optional<GpsTrackingPoint> activeJob = gpsRepository.findLatestByJobIdAndType(latest.getJobId(), GpsPointType.CHECK_IN);
        boolean isOnJob = activeJob.isPresent() && 
            gpsRepository.findLatestByJobIdAndType(latest.getJobId(), GpsPointType.CHECK_OUT).isEmpty();

        return CurrentLocationDto.builder()
            .engineerId(engineerId)
            .engineerName(engineer != null ? engineer.getFullName() : "Unknown")
            .latitude(latest.getLatitude())
            .longitude(latest.getLongitude())
            .timestamp(latest.getTimestamp())
            .speed(latest.getSpeed())
            .heading(latest.getHeading())
            .isOnJob(isOnJob)
            .currentJobId(isOnJob ? latest.getJobId() : null)
            .lastUpdateMinutes((int) java.time.Duration.between(latest.getTimestamp(), OffsetDateTime.now()).toMinutes())
            .build();
    }

    @Transactional(readOnly = true)
    public List<CurrentLocationDto> getAllActiveEngineerLocations() {
        // Get all engineers with recent GPS points
        OffsetDateTime cutoff = OffsetDateTime.now().minusHours(4);
        
        // This is a simplified version - in production, you'd use a more efficient query
        List<GpsTrackingPoint> recentPoints = gpsRepository.findAll().stream()
            .filter(p -> p.getTimestamp().isAfter(cutoff))
            .filter(p -> !p.isDeleted())
            .collect(Collectors.groupingBy(GpsTrackingPoint::getEngineerId))
            .values().stream()
            .map(list -> list.stream().max(Comparator.comparing(GpsTrackingPoint::getTimestamp)).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        return recentPoints.stream()
            .map(p -> getCurrentLocation(p.getEngineerId()))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RouteAnalyticsDto analyzeJobRoute(UUID jobId) {
        List<GpsTrackingPoint> route = gpsRepository.findByJobId(jobId);
        
        if (route.size() < 2) {
            return RouteAnalyticsDto.builder()
                .jobId(jobId)
                .totalPoints(route.size())
                .message("Insufficient data for route analysis")
                .build();
        }

        double totalDistanceKm = 0.0;
        DurationDto durationAtSite = calculateDurationAtSite(route);
        DurationDto travelTime = calculateTravelTime(route);

        // Calculate total distance
        for (int i = 1; i < route.size(); i++) {
            GpsTrackingPoint prev = route.get(i - 1);
            GpsTrackingPoint curr = route.get(i);
            
            double distance = calculateDistance(
                prev.getLatitude().doubleValue(), prev.getLongitude().doubleValue(),
                curr.getLatitude().doubleValue(), curr.getLongitude().doubleValue()
            );
            totalDistanceKm += distance;
        }

        // Count stop points
        long checkins = route.stream().filter(p -> GpsPointType.CHECK_IN.equals(p.getPointType())).count();
        long checkouts = route.stream().filter(p -> GpsPointType.CHECK_OUT.equals(p.getPointType())).count();
        long pauses = route.stream().filter(p -> GpsPointType.PAUSE.equals(p.getPointType())).count();

        return RouteAnalyticsDto.builder()
            .jobId(jobId)
            .totalPoints(route.size())
            .totalDistanceKm(BigDecimal.valueOf(totalDistanceKm).setScale(2, RoundingMode.HALF_UP))
            .durationAtSite(durationAtSite)
            .travelTime(travelTime)
            .checkinCount((int) checkins)
            .checkoutCount((int) checkouts)
            .pauseCount((int) pauses)
            .averageSpeed(calculateAverageSpeed(route))
            .build();
    }

    // ==================== Helper Methods ====================

    private void checkGeofence(FieldJob job, GpsTrackingPoint point) {
        if (job.getSiteAddressLine1() == null) return;
        
        // Simplified geofence check - in production, you'd use actual job site coordinates
        // For now, just log potential geofence events
        if (point.getPointType() == GpsPointType.CHECK_IN || point.getPointType() == GpsPointType.CHECK_OUT) {
            log.info("Geofence event: {} for job {} at location ({}, {})",
                point.getPointType(), job.getJobNumber(), point.getLatitude(), point.getLongitude());
        }
    }

    private void notifyLocationUpdate(GpsTrackingPoint point, String engineerName) {
        try {
            notificationService.broadcastToModule("FIELD_WORK",
                com.everx.websocket.dto.WebSocketMessage.builder()
                    .type("GPS_LOCATION_UPDATE")
                    .message(engineerName + " location updated")
                    .data(toDto(point))
                    .timestamp(java.time.Instant.now())
                    .build());
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification", e);
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLatRad = Math.toRadians(lat2 - lat1);
        double deltaLonRad = Math.toRadians(lon2 - lon1);

        double a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    private DurationDto calculateDurationAtSite(List<GpsTrackingPoint> route) {
        long totalMinutes = 0;
        OffsetDateTime checkIn = null;

        for (GpsTrackingPoint point : route) {
            if (GpsPointType.CHECK_IN.equals(point.getPointType())) {
                checkIn = point.getTimestamp();
            } else if (GpsPointType.CHECK_OUT.equals(point.getPointType()) && checkIn != null) {
                totalMinutes += java.time.Duration.between(checkIn, point.getTimestamp()).toMinutes();
                checkIn = null;
            }
        }

        int hours = (int) (totalMinutes / 60);
        int minutes = (int) (totalMinutes % 60);

        return DurationDto.builder()
            .hours(hours)
            .minutes(minutes)
            .totalMinutes((int) totalMinutes)
            .build();
    }

    private DurationDto calculateTravelTime(List<GpsTrackingPoint> route) {
        if (route.size() < 2) {
            return DurationDto.builder().hours(0).minutes(0).totalMinutes(0).build();
        }

        OffsetDateTime first = route.get(0).getTimestamp();
        OffsetDateTime last = route.get(route.size() - 1).getTimestamp();
        long totalMinutes = java.time.Duration.between(first, last).toMinutes();

        int hours = (int) (totalMinutes / 60);
        int minutes = (int) (totalMinutes % 60);

        return DurationDto.builder()
            .hours(hours)
            .minutes(minutes)
            .totalMinutes((int) totalMinutes)
            .build();
    }

    private BigDecimal calculateAverageSpeed(List<GpsTrackingPoint> route) {
        BigDecimal totalSpeed = route.stream()
            .map(p -> p.getSpeed() != null ? p.getSpeed() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return route.isEmpty() ? BigDecimal.ZERO :
            totalSpeed.divide(BigDecimal.valueOf(route.size()), 2, RoundingMode.HALF_UP);
    }

    private GpsTrackingPointDto toDto(GpsTrackingPoint point) {
        return GpsTrackingPointDto.builder()
            .id(point.getId())
            .jobId(point.getJobId())
            .engineerId(point.getEngineerId())
            .latitude(point.getLatitude())
            .longitude(point.getLongitude())
            .altitude(point.getAltitude())
            .accuracy(point.getAccuracy())
            .speed(point.getSpeed())
            .heading(point.getHeading())
            .timestamp(point.getTimestamp())
            .pointType(point.getPointType())
            .batteryLevel(point.getBatteryLevel())
            .deviceId(point.getDeviceId())
            .address(point.getAddress())
            .notes(point.getNotes())
            .build();
    }
}
