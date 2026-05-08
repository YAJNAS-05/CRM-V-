package com.everx.fieldwork.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate;

    public GoogleMapsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String reverseGeocode(Double latitude, Double longitude) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?latlng=%f,%f&key=%s",
                latitude, longitude, googleMapsApiKey
            );

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && "OK".equals(response.get("status"))) {
                // Extract formatted address from response
                // This is simplified - in production you'd parse the full response
                return "Address from reverse geocoding"; // Placeholder
            }
        } catch (Exception e) {
            log.error("Failed to reverse geocode coordinates: {}, {}", latitude, longitude, e);
        }
        
        return null;
    }

    public Map<String, Object> getDirections(String origin, String destination) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/directions/json?origin=%s&destination=%s&key=%s",
                origin, destination, googleMapsApiKey
            );

            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to get directions from {} to {}", origin, destination, e);
            return null;
        }
    }

    public Map<String, Object> geocode(String address) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s",
                address, googleMapsApiKey
            );

            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to geocode address: {}", address, e);
            return null;
        }
    }

    public Map<String, Object> getNearbyPlaces(Double latitude, Double longitude, String placeType, int radius) {
        try {
            String url = String.format(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=%f,%f&radius=%d&type=%s&key=%s",
                latitude, longitude, radius, placeType, googleMapsApiKey
            );

            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.error("Failed to get nearby places for coordinates: {}, {}", latitude, longitude, e);
            return null;
        }
    }
}
