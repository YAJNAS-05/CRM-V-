package com.everx.mobile.service;

import com.everx.mobile.dto.*;
import com.everx.mobile.entity.*;
import com.everx.mobile.repository.*;
import com.everx.tenant.service.TenantContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class MobileAPIService {

    private final MobileDeviceRepository deviceRepository;
    private final MobileSessionRepository sessionRepository;
    private final PushNotificationRepository notificationRepository;
    private final MobileAppRepository appRepository;
    private final MobileUsageRepository usageRepository;
    private final TenantContextService tenantContextService;
    private final PushNotificationService pushNotificationService;

    // Device Management
    @Transactional
    public MobileDeviceDto registerDevice(UUID tenantId, RegisterDeviceRequest request) {
        log.info("Registering mobile device for tenant: {} with platform: {}", tenantId, request.getPlatform());

        // Check if device already exists
        Optional<MobileDevice> existingDevice = deviceRepository.findByDeviceIdAndTenantId(request.getDeviceId(), tenantId);
        
        MobileDevice device;
        if (existingDevice.isPresent()) {
            device = existingDevice.get();
            updateDeviceInfo(device, request);
        } else {
            device = createNewDevice(tenantId, request);
        }

        device = deviceRepository.save(device);
        
        // Create device registration event
        createDeviceEvent(device.getId(), "DEVICE_REGISTERED", Map.of(
                "platform", request.getPlatform(),
                "appVersion", request.getAppVersion()
        ));

        return convertToDto(device);
    }

    @Transactional
    public MobileDeviceDto updateDevice(UUID deviceId, UpdateDeviceRequest request) {
        log.info("Updating mobile device: {}", deviceId);

        MobileDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (request.getAppVersion() != null) {
            device.setAppVersion(request.getAppVersion());
        }
        if (request.getPushToken() != null) {
            device.setPushToken(request.getPushToken());
        }
        if (request.getSettings() != null) {
            device.setSettings(request.getSettings());
        }

        device.setLastSeen(LocalDateTime.now());
        device = deviceRepository.save(device);

        return convertToDto(device);
    }

    @Transactional
    public void unregisterDevice(UUID deviceId) {
        log.info("Unregistering mobile device: {}", deviceId);

        MobileDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        device.setStatus(MobileDevice.Status.INACTIVE);
        device.setUnregisteredAt(LocalDateTime.now());
        deviceRepository.save(device);

        // Create device unregistration event
        createDeviceEvent(deviceId, "DEVICE_UNREGISTERED", Map.of());
    }

    // Session Management
    @Async
    @Transactional
    public CompletableFuture<MobileSessionDto> createSession(UUID deviceId, CreateSessionRequest request) {
        log.info("Creating mobile session for device: {}", deviceId);

        MobileDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        // End any existing active sessions
        endActiveSessions(deviceId);

        MobileSession session = MobileSession.builder()
                .id(UUID.randomUUID())
                .deviceId(deviceId)
                .userId(request.getUserId())
                .tenantId(device.getTenantId())
                .status(MobileSession.Status.ACTIVE)
                .startedAt(LocalDateTime.now())
                .lastActivity(LocalDateTime.now())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .location(request.getLocation())
                .build();

        session = sessionRepository.save(session);

        // Update device status
        device.setStatus(MobileDevice.Status.ONLINE);
        device.setLastSeen(LocalDateTime.now());
        deviceRepository.save(device);

        // Track session start
        trackMobileUsage(deviceId, "SESSION_START", Map.of(
                "sessionId", session.getId(),
                "userId", request.getUserId()
        ));

        return CompletableFuture.completedFuture(convertToDto(session));
    }

    @Transactional
    public void updateSessionActivity(UUID sessionId) {
        log.debug("Updating session activity: {}", sessionId);

        MobileSession session = sessionRepository.findById(sessionId)
                .orElse(null);

        if (session != null && session.getStatus() == MobileSession.Status.ACTIVE) {
            session.setLastActivity(LocalDateTime.now());
            sessionRepository.save(session);

            // Update device last seen
            MobileDevice device = deviceRepository.findById(session.getDeviceId()).orElse(null);
            if (device != null) {
                device.setLastSeen(LocalDateTime.now());
                deviceRepository.save(device);
            }
        }
    }

    @Transactional
    public void endSession(UUID sessionId) {
        log.info("Ending mobile session: {}", sessionId);

        MobileSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setStatus(MobileSession.Status.ENDED);
        session.setEndedAt(LocalDateTime.now());
        
        if (session.getStartedAt() != null) {
            session.setDurationMinutes(java.time.Duration.between(session.getStartedAt(), session.getEndedAt()).toMinutes());
        }

        sessionRepository.save(session);

        // Update device status
        MobileDevice device = deviceRepository.findById(session.getDeviceId()).orElse(null);
        if (device != null) {
            device.setStatus(MobileDevice.Status.OFFLINE);
            deviceRepository.save(device);
        }

        // Track session end
        trackMobileUsage(session.getDeviceId(), "SESSION_END", Map.of(
                "sessionId", sessionId,
                "duration", session.getDurationMinutes()
        ));
    }

    // Push Notifications
    @Async
    @Transactional
    public CompletableFuture<PushNotificationDto> sendPushNotification(UUID tenantId, SendPushNotificationRequest request) {
        log.info("Sending push notification to tenant: {} with {} recipients", tenantId, request.getRecipientIds().size());

        List<PushNotification> notifications = new ArrayList<>();

        for (String recipientId : request.getRecipientIds()) {
            // Get devices for recipient
            List<MobileDevice> devices = deviceRepository.findByTenantIdAndUserIdAndStatus(tenantId, recipientId, MobileDevice.Status.ONLINE);

            for (MobileDevice device : devices) {
                if (device.getPushToken() != null && !device.getPushToken().isEmpty()) {
                    PushNotification notification = PushNotification.builder()
                            .id(UUID.randomUUID())
                            .deviceId(device.getId())
                            .tenantId(tenantId)
                            .recipientId(recipientId)
                            .type(request.getType())
                            .title(request.getTitle())
                            .message(request.getMessage())
                            .data(request.getData())
                            .status(PushNotification.Status.PENDING)
                            .createdAt(LocalDateTime.now())
                            .build();

                    notifications.add(notification);
                }
            }
        }

        // Save notifications
        notifications = notificationRepository.saveAll(notifications);

        // Send push notifications
        for (PushNotification notification : notifications) {
            sendPushNotificationAsync(notification);
        }

        // Return summary
        return CompletableFuture.completedFuture(PushNotificationDto.builder()
                .tenantId(tenantId)
                .totalNotifications(notifications.size())
                .sentNotifications(notifications.size())
                .failedNotifications(0)
                .build());
    }

    @Async
    private CompletableFuture<Void> sendPushNotificationAsync(PushNotification notification) {
        try {
            MobileDevice device = deviceRepository.findById(notification.getDeviceId())
                    .orElseThrow(() -> new RuntimeException("Device not found"));

            boolean sent = pushNotificationService.sendNotification(
                    device.getPushToken(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getData()
            );

            if (sent) {
                notification.setStatus(PushNotification.Status.SENT);
                notification.setSentAt(LocalDateTime.now());
            } else {
                notification.setStatus(PushNotification.Status.FAILED);
                notification.setFailureReason("Push service error");
            }

        } catch (Exception e) {
            log.error("Failed to send push notification: {}", notification.getId(), e);
            notification.setStatus(PushNotification.Status.FAILED);
            notification.setFailureReason(e.getMessage());
        }

        notificationRepository.save(notification);
        return CompletableFuture.completedFuture(null);
    }

    // Mobile App Management
    @Transactional
    public MobileAppDto createAppVersion(UUID tenantId, CreateAppVersionRequest request) {
        log.info("Creating mobile app version: {} for tenant: {}", request.getVersion(), tenantId);

        MobileApp app = MobileApp.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .platform(request.getPlatform())
                .version(request.getVersion())
                .buildNumber(request.getBuildNumber())
                .releaseNotes(request.getReleaseNotes())
                .downloadUrl(request.getDownloadUrl())
                .isMandatory(request.getIsMandatory())
                .minSupportedVersion(request.getMinSupportedVersion())
                .status(MobileApp.Status.ACTIVE)
                .releasedAt(LocalDateTime.now())
                .build();

        app = appRepository.save(app);

        return convertToDto(app);
    }

    @Transactional(readOnly = true)
    public List<MobileAppDto> getAppVersions(UUID tenantId, String platform) {
        List<MobileApp> apps = platform != null 
                ? appRepository.findByTenantIdAndPlatformOrderByReleasedAtDesc(tenantId, platform)
                : appRepository.findByTenantIdOrderByReleasedAtDesc(tenantId);

        return apps.stream()
                .map(this::convertToDto)
                .toList();
    }

    // Mobile Analytics
    @Transactional(readOnly = true)
    public MobileAnalyticsDto getMobileAnalytics(UUID tenantId, AnalyticsRequest request) {
        log.info("Getting mobile analytics for tenant: {}", tenantId);

        // Get device statistics
        long totalDevices = deviceRepository.countByTenantId(tenantId);
        long activeDevices = deviceRepository.countByTenantIdAndStatus(tenantId, MobileDevice.Status.ONLINE);
        long iosDevices = deviceRepository.countByTenantIdAndPlatform(tenantId, "IOS");
        long androidDevices = deviceRepository.countByTenantIdAndPlatform(tenantId, "ANDROID");

        // Get session statistics
        long activeSessions = sessionRepository.countByTenantIdAndStatus(tenantId, MobileSession.Status.ACTIVE);
        long todaySessions = sessionRepository.countByTenantIdAndStartedAtAfter(
                tenantId, LocalDateTime.now().toLocalDate().atStartOfDay());

        // Get notification statistics
        long sentNotifications = notificationRepository.countByTenantIdAndStatus(tenantId, PushNotification.Status.SENT);
        long failedNotifications = notificationRepository.countByTenantIdAndStatus(tenantId, PushNotification.Status.FAILED);

        // Get usage statistics
        List<MobileUsage> usage = usageRepository.findByTenantIdAndTimestampAfter(
                tenantId, LocalDateTime.now().minusDays(30));

        Map<String, Long> featureUsage = new HashMap<>();
        for (MobileUsage u : usage) {
            featureUsage.merge(u.getFeature(), 1L, Long::sum);
        }

        return MobileAnalyticsDto.builder()
                .tenantId(tenantId)
                .deviceStats(Map.of(
                        "total", totalDevices,
                        "active", activeDevices,
                        "ios", iosDevices,
                        "android", androidDevices
                ))
                .sessionStats(Map.of(
                        "active", activeSessions,
                        "today", todaySessions
                ))
                .notificationStats(Map.of(
                        "sent", sentNotifications,
                        "failed", failedNotifications,
                        "successRate", sentNotifications > 0 ? (double) sentNotifications / (sentNotifications + failedNotifications) : 0.0
                ))
                .featureUsage(featureUsage)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Responsive Design Configuration
    @Transactional
    public ResponsiveConfigDto getResponsiveConfig(UUID tenantId, String platform) {
        log.info("Getting responsive config for tenant: {} platform: {}", tenantId, platform);

        Map<String, Object> config = switch (platform.toLowerCase()) {
            case "ios" -> getIOSConfig();
            case "android" -> getAndroidConfig();
            case "web" -> getWebConfig();
            default -> getDefaultConfig();
        };

        return ResponsiveConfigDto.builder()
                .tenantId(tenantId)
                .platform(platform)
                .config(config)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Scheduled Tasks
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void cleanupInactiveSessions() {
        log.debug("Cleaning up inactive mobile sessions");

        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);
        List<MobileSession> inactiveSessions = sessionRepository.findByStatusAndLastActivityBefore(
                MobileSession.Status.ACTIVE, thirtyMinutesAgo);

        for (MobileSession session : inactiveSessions) {
            endSession(session.getId());
        }
    }

    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void updateDeviceStatuses() {
        log.debug("Updating mobile device statuses");

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<MobileDevice> offlineDevices = deviceRepository.findByStatusAndLastSeenBefore(
                MobileDevice.Status.ONLINE, oneHourAgo);

        for (MobileDevice device : offlineDevices) {
            device.setStatus(MobileDevice.Status.OFFLINE);
            deviceRepository.save(device);
        }
    }

    // Private helper methods
    private MobileDevice createNewDevice(UUID tenantId, RegisterDeviceRequest request) {
        return MobileDevice.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .deviceId(request.getDeviceId())
                .platform(request.getPlatform())
                .appVersion(request.getAppVersion())
                .pushToken(request.getPushToken())
                .status(MobileDevice.Status.ACTIVE)
                .registeredAt(LocalDateTime.now())
                .lastSeen(LocalDateTime.now())
                .settings(request.getSettings())
                .build();
    }

    private void updateDeviceInfo(MobileDevice device, RegisterDeviceRequest request) {
        device.setAppVersion(request.getAppVersion());
        device.setPushToken(request.getPushToken());
        device.setStatus(MobileDevice.Status.ACTIVE);
        device.setLastSeen(LocalDateTime.now());
        if (request.getSettings() != null) {
            device.setSettings(request.getSettings());
        }
    }

    private void endActiveSessions(UUID deviceId) {
        List<MobileSession> activeSessions = sessionRepository.findByDeviceIdAndStatus(deviceId, MobileSession.Status.ACTIVE);
        for (MobileSession session : activeSessions) {
            endSession(session.getId());
        }
    }

    private void createDeviceEvent(UUID deviceId, String eventType, Map<String, Object> data) {
        trackMobileUsage(deviceId, eventType, data);
    }

    private void trackMobileUsage(UUID deviceId, String feature, Map<String, Object> data) {
        MobileDevice device = deviceRepository.findById(deviceId).orElse(null);
        if (device != null) {
            MobileUsage usage = MobileUsage.builder()
                    .id(UUID.randomUUID())
                    .tenantId(device.getTenantId())
                    .deviceId(deviceId)
                    .feature(feature)
                    .data(data)
                    .timestamp(LocalDateTime.now())
                    .build();

            usageRepository.save(usage);
        }
    }

    private Map<String, Object> getIOSConfig() {
        return Map.of(
                "theme", "ios",
                "navigationStyle", "tabBar",
                "animations", true,
                "hapticFeedback", true,
                "biometricAuth", true,
                "pushNotifications", true,
                "offlineMode", true,
                "adaptiveLayout", true
        );
    }

    private Map<String, Object> getAndroidConfig() {
        return Map.of(
                "theme", "material",
                "navigationStyle", "bottomNavigation",
                "animations", true,
                "hapticFeedback", true,
                "biometricAuth", true,
                "pushNotifications", true,
                "offlineMode", true,
                "adaptiveLayout", true
        );
    }

    private Map<String, Object> getWebConfig() {
        return Map.of(
                "theme", "responsive",
                "navigationStyle", "sidebar",
                "animations", true,
                "hapticFeedback", false,
                "biometricAuth", false,
                "pushNotifications", false,
                "offlineMode", false,
                "adaptiveLayout", true
        );
    }

    private Map<String, Object> getDefaultConfig() {
        return Map.of(
                "theme", "default",
                "navigationStyle", "tabBar",
                "animations", true,
                "hapticFeedback", false,
                "biometricAuth", false,
                "pushNotifications", true,
                "offlineMode", true,
                "adaptiveLayout", true
        );
    }

    // DTO conversion methods
    private MobileDeviceDto convertToDto(MobileDevice device) {
        return MobileDeviceDto.builder()
                .id(device.getId())
                .tenantId(device.getTenantId())
                .deviceId(device.getDeviceId())
                .platform(device.getPlatform())
                .appVersion(device.getAppVersion())
                .status(device.getStatus())
                .registeredAt(device.getRegisteredAt())
                .lastSeen(device.getLastSeen())
                .build();
    }

    private MobileSessionDto convertToDto(MobileSession session) {
        return MobileSessionDto.builder()
                .id(session.getId())
                .deviceId(session.getDeviceId())
                .userId(session.getUserId())
                .tenantId(session.getTenantId())
                .status(session.getStatus())
                .startedAt(session.getStartedAt())
                .lastActivity(session.getLastActivity())
                .durationMinutes(session.getDurationMinutes())
                .build();
    }

    private MobileAppDto convertToDto(MobileApp app) {
        return MobileAppDto.builder()
                .id(app.getId())
                .tenantId(app.getTenantId())
                .platform(app.getPlatform())
                .version(app.getVersion())
                .buildNumber(app.getBuildNumber())
                .releaseNotes(app.getReleaseNotes())
                .downloadUrl(app.getDownloadUrl())
                .isMandatory(app.getIsMandatory())
                .minSupportedVersion(app.getMinSupportedVersion())
                .status(app.getStatus())
                .releasedAt(app.getReleasedAt())
                .build();
    }
}
