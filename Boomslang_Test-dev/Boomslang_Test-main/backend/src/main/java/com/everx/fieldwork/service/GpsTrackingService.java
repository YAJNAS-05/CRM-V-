package com.everx.fieldwork.service;

import com.everx.fieldwork.dto.CreateGpsLocationRequest;
import com.everx.fieldwork.dto.GpsLocationDto;
import com.everx.fieldwork.dto.GpsLocationStatsDto;
import com.everx.fieldwork.entity.GpsLocation;
import com.everx.fieldwork.entity.Technician;
import com.everx.fieldwork.repository.GpsLocationRepository;
import com.everx.fieldwork.repository.TechnicianRepository;
import com.everx.shared.exception.ResourceNotFoundException;
import com.everx.shared.exception.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GpsTrackingService {

    private final GpsLocationRepository gpsLocationRepository;
    private final TechnicianRepository technicianRepository;
    private final GoogleMapsService googleMapsService;

    public GpsLocationDto createGpsLocation(CreateGpsLocationRequest request) {
        log.info("Creating GPS location for technician: {}", request.getTechnicianId());

        // Validate technician
        Technician technician = technicianRepository.findById(UUID.fromString(request.getTechnicianId()))
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        // Validate GPS tracking consent and settings
        validateGpsTrackingSettings(technician);

        // Validate coordinates
        validateCoordinates(request.getLatitude(), request.getLongitude());

        // Create GPS location entity
        GpsLocation gpsLocation = GpsLocation.builder()
                .id(UUID.randomUUID())
                .technicianId(request.getTechnicianId())
                .fieldJobId(request.getFieldJobId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .altitude(request.getAltitude())
                .accuracy(request.getAccuracy())
                .speed(request.getSpeed())
                .heading(request.getHeading())
                .timestamp(LocalDateTime.now())
                .source(request.getSource())
                .isAccurate(request.getAccuracy() != null && request.getAccuracy() <= 50.0)
                .satelliteCount(request.getSatelliteCount())
                .hdop(request.getHdop())
                .vdop(request.getVdop())
                .batteryLevel(request.getBatteryLevel())
                .isCharging(request.getIsCharging())
                .deviceInfo(request.getDeviceInfo())
                .appVersion(request.getAppVersion())
                .context(determineLocationContext(request))
                .networkType(request.getNetworkType())
                .networkProvider(request.getNetworkProvider())
                .signalStrength(request.getSignalStrength())
                .isSynced(false)
                .isActive(true)
                .userConsent(technician.getGpsTrackingEnabled())
                .isWorkHours(isWorkHours(technician))
                .deviceId(request.getDeviceId())
                .build();

        // Reverse geocoding to get address
        if (request.getLatitude() != null && request.getLongitude() != null) {
            try {
                String address = googleMapsService.reverseGeocode(request.getLatitude(), request.getLongitude());
                gpsLocation.setAddress(address);
            } catch (Exception e) {
                log.warn("Failed to reverse geocode location: {}", e.getMessage());
            }
        }

        // Update technician's current location
        updateTechnicianLocation(technician, gpsLocation);

        // Save GPS location
        GpsLocation savedLocation = gpsLocationRepository.save(gpsLocation);

        return convertToDto(savedLocation);
    }

    public List<GpsLocationDto> getTechnicianLocations(String technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting GPS locations for technician: {} from {} to {}", technicianId, startDate, endDate);

        List<GpsLocation> locations = gpsLocationRepository.findByTechnicianIdAndTimestampBetween(
                technicianId, startDate, endDate);

        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public GpsLocationDto getLatestTechnicianLocation(String technicianId) {
        log.info("Getting latest GPS location for technician: {}", technicianId);

        GpsLocation location = gpsLocationRepository.findLatestLocationByTechnician(technicianId);
        if (location == null) {
            throw new ResourceNotFoundException("No GPS location found for technician");
        }

        return convertToDto(location);
    }

    public List<GpsLocationDto> getTechnicianPath(String technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting GPS path for technician: {} from {} to {}", technicianId, startDate, endDate);

        List<GpsLocation> locations = gpsLocationRepository.findPathByTechnician(technicianId, startDate, endDate);

        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GpsLocationDto> getLocationsInBounds(Double minLatitude, Double maxLatitude, 
            Double minLongitude, Double maxLongitude, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting GPS locations in bounds: {},{} to {},{}", 
                minLatitude, minLongitude, maxLatitude, maxLongitude);

        List<GpsLocation> locations = gpsLocationRepository.findByLocationBoundsAndTimeRange(
                minLatitude, maxLatitude, minLongitude, maxLongitude, startDate, endDate);

        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GpsLocationDto> getLocationsWithinRadius(Double latitude, Double longitude, 
            Double radiusKm, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting GPS locations within radius: {}km from {},{}", radiusKm, latitude, longitude);

        List<GpsLocation> locations = gpsLocationRepository.findByLocationWithinRadiusAndTimeRange(
                latitude, longitude, radiusKm, startDate, endDate);

        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<GpsLocationDto> getRecentlyActiveTechnicians(LocalDateTime since) {
        log.info("Getting recently active technicians since: {}", since);

        List<GpsLocation> locations = gpsLocationRepository.findRecentlyActiveByTechnician(since);

        return locations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void syncUnsyncedLocations() {
        log.info("Syncing unsynced GPS locations");

        List<GpsLocation> unsyncedLocations = gpsLocationRepository.findByIsSynced(false);

        for (GpsLocation location : unsyncedLocations) {
            try {
                // Sync with external systems if needed
                syncLocationWithExternalSystems(location);

                location.setSynced(true);
                location.setSyncedAt(LocalDateTime.now());
                gpsLocationRepository.save(location);
            } catch (Exception e) {
                log.error("Failed to sync location {}: {}", location.getId(), e.getMessage());
                location.setSyncError(e.getMessage());
                gpsLocationRepository.save(location);
            }
        }
    }

    public void cleanupOldLocations(LocalDateTime cutoff) {
        log.info("Cleaning up old GPS locations before: {}", cutoff);

        List<GpsLocation> oldLocations = gpsLocationRepository.findOldSyncedLocations(cutoff);
        
        for (GpsLocation location : oldLocations) {
            try {
                gpsLocationRepository.delete(location);
            } catch (Exception e) {
                log.error("Failed to delete old location {}: {}", location.getId(), e.getMessage());
            }
        }
    }

    public GpsLocationStatsDto getTechnicianStats(String technicianId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting GPS stats for technician: {} from {} to {}", technicianId, startDate, endDate);

        List<GpsLocation> locations = gpsLocationRepository.findByTechnicianIdAndTimestampBetween(
                technicianId, startDate, endDate);

        if (locations.isEmpty()) {
            return GpsLocationStatsDto.builder()
                    .technicianId(technicianId)
                    .startDate(startDate)
                    .endDate(endDate)
                    .totalLocations(0)
                    .build();
        }

        // Calculate statistics
        Double totalDistance = gpsLocationRepository.getTotalDistanceByTechnician(technicianId, startDate, endDate);
        Double averageSpeed = gpsLocationRepository.getAverageSpeedByTechnician(technicianId, startDate, endDate);
        Double maxSpeed = gpsLocationRepository.getMaxSpeedByTechnician(technicianId, startDate, endDate);
        long accurateLocations = gpsLocationRepository.countAccurateLocationsByTechnician(technicianId, startDate, endDate);
        Double averageAccuracy = gpsLocationRepository.getAverageAccuracyByTechnician(technicianId, startDate, endDate);

        return GpsLocationStatsDto.builder()
                .technicianId(technicianId)
                .startDate(startDate)
                .endDate(endDate)
                .totalLocations(locations.size())
                .totalDistance(totalDistance != null ? totalDistance : 0.0)
                .averageSpeed(averageSpeed != null ? averageSpeed : 0.0)
                .maxSpeed(maxSpeed != null ? maxSpeed : 0.0)
                .accurateLocations((int) accurateLocations)
                .averageAccuracy(averageAccuracy != null ? averageAccuracy : 0.0)
                .build();
    }

    // Private helper methods

    private void validateGpsTrackingSettings(Technician technician) {
        if (!technician.getGpsTrackingEnabled()) {
            throw new ValidationException("GPS tracking is not enabled for this technician");
        }

        if (!technician.getLocationSharingEnabled()) {
            throw new ValidationException("Location sharing is not enabled for this technician");
        }

        if (technician.getConsentExpiry() != null && technician.getConsentExpiry().isBefore(LocalDateTime.now())) {
            throw new ValidationException("GPS tracking consent has expired");
        }
    }

    private void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new ValidationException("Latitude and longitude are required");
        }

        if (latitude < -90.0 || latitude > 90.0) {
            throw new ValidationException("Invalid latitude value");
        }

        if (longitude < -180.0 || longitude > 180.0) {
            throw new ValidationException("Invalid longitude value");
        }
    }

    private GpsLocation.LocationContext determineLocationContext(CreateGpsLocationRequest request) {
        // Simple logic to determine context - can be enhanced
        if (request.getFieldJobId() != null) {
            return GpsLocation.LocationContext.AT_JOB_SITE;
        }

        if (request.getSpeed() != null && request.getSpeed() > 5.0) {
            return GpsLocation.LocationContext.TRAVELING;
        }

        return GpsLocation.LocationContext.OTHER;
    }

    private boolean isWorkHours(Technician technician) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check if current time is within work hours
        if (technician.getWorkStartTime() != null && technician.getWorkEndTime() != null) {
            if (now.toLocalTime().isBefore(technician.getWorkStartTime().toLocalTime()) ||
                now.toLocalTime().isAfter(technician.getWorkEndTime().toLocalTime())) {
                return false;
            }
        }

        // Check weekends
        if (!technician.getAvailableWeekends() && 
            (now.getDayOfWeek().getValue() == 6 || now.getDayOfWeek().getValue() == 7)) {
            return false;
        }

        return true;
    }

    private void updateTechnicianLocation(Technician technician, GpsLocation gpsLocation) {
        technician.setCurrentLatitude(gpsLocation.getLatitude());
        technician.setCurrentLongitude(gpsLocation.getLongitude());
        technician.setLastLocationUpdate(gpsLocation.getTimestamp());
        
        if (gpsLocation.getAddress() != null) {
            technician.setCurrentAddress(gpsLocation.getAddress());
        }

        technicianRepository.save(technician);
    }

    private void syncLocationWithExternalSystems(GpsLocation location) {
        // Implementation for syncing with external systems
        // This could include fleet management systems, analytics platforms, etc.
        log.debug("Syncing location {} with external systems", location.getId());
    }

    private GpsLocationDto convertToDto(GpsLocation location) {
        return GpsLocationDto.builder()
                .id(location.getId())
                .technicianId(location.getTechnicianId())
                .fieldJobId(location.getFieldJobId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .altitude(location.getAltitude())
                .accuracy(location.getAccuracy())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .timestamp(location.getTimestamp())
                .address(location.getAddress())
                .city(location.getCity())
                .state(location.getState())
                .country(location.getCountry())
                .postalCode(location.getPostalCode())
                .source(location.getSource())
                .isAccurate(location.getIsAccurate())
                .satelliteCount(location.getSatelliteCount())
                .hdop(location.getHdop())
                .vdop(location.getVdop())
                .batteryLevel(location.getBatteryLevel())
                .isCharging(location.getIsCharging())
                .deviceInfo(location.getDeviceInfo())
                .appVersion(location.getAppVersion())
                .context(location.getContext())
                .notes(location.getNotes())
                .isWaypoint(location.getIsWaypoint())
                .waypointOrder(location.getWaypointOrder())
                .distanceFromPrevious(location.getDistanceFromPrevious())
                .previousLocationTime(location.getPreviousLocationTime())
                .timeFromPrevious(location.getTimeFromPrevious())
                .isInGeofence(location.getIsInGeofence())
                .geofenceId(location.getGeofenceId())
                .geofenceName(location.getGeofenceName())
                .temperature(location.getTemperature())
                .humidity(location.getHumidity())
                .weatherCondition(location.getWeatherCondition())
                .windSpeed(location.getWindSpeed())
                .networkType(location.getNetworkType())
                .networkProvider(location.getNetworkProvider())
                .signalStrength(location.getSignalStrength())
                .isSynced(location.getIsSynced())
                .syncedAt(location.getSyncedAt())
                .syncError(location.getSyncError())
                .isActive(location.getIsActive())
                .userConsent(location.getUserConsent())
                .consentExpiry(location.getConsentExpiry())
                .isWorkHours(location.getIsWorkHours())
                .externalTrackingId(location.getExternalTrackingId())
                .deviceId(location.getDeviceId())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
