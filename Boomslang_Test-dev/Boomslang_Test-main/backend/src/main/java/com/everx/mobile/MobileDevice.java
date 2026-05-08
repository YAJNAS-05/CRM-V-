package com.everx.mobile.entity;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "mobile_devices", schema = "everx_mobile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class MobileDevice extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private java.util.UUID tenantId;

    @Column(name = "device_id", nullable = false, length = 200, unique = true)
    private String deviceId;

    @Column(name = "user_id", length = 200)
    private String userId;

    @Column(name = "platform", nullable = false, length = 50)
    private String platform;

    @Column(name = "app_version", length = 50)
    private String appVersion;

    @Column(name = "push_token", length = 500)
    private String pushToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "unregistered_at")
    private LocalDateTime unregisteredAt;

    @Column(name = "device_model", length = 100)
    private String deviceModel;

    @Column(name = "os_version", length = 50)
    private String osVersion;

    @Column(name = "screen_size", length = 20)
    private String screenSize;

    @Column(name = "settings", columnDefinition = "JSON")
    private Map<String, Object> settings;

    @Column(name = "preferences", columnDefinition = "JSON")
    private Map<String, Object> preferences;

    @Column(name = "capabilities", columnDefinition = "JSON")
    private Map<String, Boolean> capabilities;

    @Column(name = "notification_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationEnabled = true;

    @Column(name = "biometric_enabled", nullable = false)
    @Builder.Default
    private Boolean biometricEnabled = false;

    @Column(name = "offline_mode_enabled", nullable = false)
    @Builder.Default
    private Boolean offlineModeEnabled = true;

    @Column(name = "dark_mode_enabled", nullable = false)
    @Builder.Default
    private Boolean darkModeEnabled = false;

    @Column(name = "auto_sync_enabled", nullable = false)
    @Builder.Default
    private Boolean autoSyncEnabled = true;

    @Column(name = "location_services_enabled", nullable = false)
    @Builder.Default
    private Boolean locationServicesEnabled = false;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @Column(name = "storage_usage_mb")
    private Long storageUsageMb;

    @Column(name = "network_type", length = 20)
    private String networkType;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "sync_status", nullable = false, length = 20)
    @Builder.Default
    private String syncStatus = "SYNCED";

    @Column(name = "total_sessions", nullable = false)
    @Builder.Default
    private Long totalSessions = 0L;

    @Column(name = "total_usage_minutes", nullable = false)
    @Builder.Default
    private Long totalUsageMinutes = 0L;

    @Column(name = "last_app_launch")
    private LocalDateTime lastAppLaunch;

    @Column(name = "app_launch_count", nullable = false)
    @Builder.Default
    private Long appLaunchCount = 0L;

    @Column(name = "crash_count", nullable = false)
    @Builder.Default
    private Long crashCount = 0L;

    @Column(name = "last_crash_at")
    private LocalDateTime lastCrashAt;

    @Column(name = "security_score")
    private Integer securityScore;

    @Column(name = "performance_score")
    private Integer performanceScore;

    @Column(name = "user_satisfaction_score")
    private Integer userSatisfactionScore;

    // Platform constants
    public static final String PLATFORM_IOS = "IOS";
    public static final String PLATFORM_ANDROID = "ANDROID";
    public static final String PLATFORM_WEB = "WEB";

    // Status enum
    public enum Status {
        ACTIVE,
        ONLINE,
        OFFLINE,
        INACTIVE,
        SUSPENDED,
        BLOCKED
    }

    // Sync status constants
    public static final String SYNC_SYNCED = "SYNCED";
    public static final String SYNC_SYNCING = "SYNCING";
    public static final String SYNC_FAILED = "FAILED";
    public static final String SYNC_OFFLINE = "OFFLINE";

    // Network type constants
    public static final String NETWORK_WIFI = "WIFI";
    public static final String NETWORK_CELLULAR = "CELLULAR";
    public static final String NETWORK_OFFLINE = "OFFLINE";

    // Helper methods
    public boolean isActive() {
        return status == Status.ACTIVE;
    }

    public boolean isInactive() {
        if (status == Status.INACTIVE) {
            return true;
        }
        return lastSeen != null && lastSeen.isBefore(LocalDateTime.now().minusHours(24));
    }

    public boolean isSuspended() {
        return status == Status.SUSPENDED;
    }

    public boolean isBlocked() {
        return status == Status.BLOCKED;
    }

    public boolean isIOS() {
        return PLATFORM_IOS.equals(platform);
    }

    public boolean isAndroid() {
        return PLATFORM_ANDROID.equals(platform);
    }

    public boolean isWeb() {
        return PLATFORM_WEB.equals(platform);
    }

    public boolean isNative() {
        return isIOS() || isAndroid();
    }

    public boolean hasPushToken() {
        return pushToken != null && !pushToken.isEmpty();
    }

    public boolean isNotificationsEnabled() {
        return notificationEnabled && hasPushToken();
    }

    public boolean isBiometricEnabled() {
        return biometricEnabled && hasBiometricCapability();
    }

    public boolean isOfflineModeEnabled() {
        return offlineModeEnabled && hasOfflineCapability();
    }

    public boolean isDarkModeEnabled() {
        return darkModeEnabled;
    }

    public boolean isAutoSyncEnabled() {
        return autoSyncEnabled;
    }

    public boolean isLocationServicesEnabled() {
        return locationServicesEnabled && hasLocationCapability();
    }

    public boolean hasBiometricCapability() {
        return capabilities != null && capabilities.getOrDefault("biometric", false);
    }

    public boolean hasOfflineCapability() {
        return capabilities != null && capabilities.getOrDefault("offline", false);
    }

    public boolean hasLocationCapability() {
        return capabilities != null && capabilities.getOrDefault("location", false);
    }

    public boolean hasCameraCapability() {
        return capabilities != null && capabilities.getOrDefault("camera", false);
    }

    public boolean hasMicrophoneCapability() {
        return capabilities != null && capabilities.getOrDefault("microphone", false);
    }

    public void activate() {
        this.status = Status.ACTIVE;
        this.lastSeen = LocalDateTime.now();
    }

    public void deactivate() {
        this.status = Status.INACTIVE;
        this.unregisteredAt = LocalDateTime.now();
    }

    public void suspend() {
        this.status = Status.SUSPENDED;
    }

    public void block() {
        this.status = Status.BLOCKED;
    }

    public void updateLastSeen() {
        this.lastSeen = LocalDateTime.now();
    }

    public void enableNotifications() {
        this.notificationEnabled = true;
    }

    public void disableNotifications() {
        this.notificationEnabled = false;
    }

    public void enableBiometric() {
        if (hasBiometricCapability()) {
            this.biometricEnabled = true;
        }
    }

    public void disableBiometric() {
        this.biometricEnabled = false;
    }

    public void enableOfflineMode() {
        if (hasOfflineCapability()) {
            this.offlineModeEnabled = true;
        }
    }

    public void disableOfflineMode() {
        this.offlineModeEnabled = false;
    }

    public void toggleDarkMode() {
        this.darkModeEnabled = !this.darkModeEnabled;
    }

    public void enableAutoSync() {
        this.autoSyncEnabled = true;
    }

    public void disableAutoSync() {
        this.autoSyncEnabled = false;
    }

    public void enableLocationServices() {
        if (hasLocationCapability()) {
            this.locationServicesEnabled = true;
        }
    }

    public void disableLocationServices() {
        this.locationServicesEnabled = false;
    }

    public void updateBatteryLevel(Integer level) {
        this.batteryLevel = level;
        updateLastSeen();
    }

    public void updateStorageUsage(Long usageMb) {
        this.storageUsageMb = usageMb;
        updateLastSeen();
    }

    public void updateNetworkType(String networkType) {
        this.networkType = networkType;
        updateLastSeen();
    }

    public void startSync() {
        this.syncStatus = SYNC_SYNCING;
        updateLastSeen();
    }

    public void completeSync() {
        this.syncStatus = SYNC_SYNCED;
        this.lastSyncAt = LocalDateTime.now();
        updateLastSeen();
    }

    public void failSync() {
        this.syncStatus = SYNC_FAILED;
        updateLastSeen();
    }

    public void setOffline() {
        this.syncStatus = SYNC_OFFLINE;
        this.networkType = NETWORK_OFFLINE;
        updateLastSeen();
    }

    public void incrementSessionCount() {
        this.totalSessions++;
        updateLastSeen();
    }

    public void addUsageMinutes(Long minutes) {
        this.totalUsageMinutes += minutes;
        updateLastSeen();
    }

    public void recordAppLaunch() {
        this.lastAppLaunch = LocalDateTime.now();
        this.appLaunchCount++;
        updateLastSeen();
    }

    public void recordCrash() {
        this.crashCount++;
        this.lastCrashAt = LocalDateTime.now();
        updateLastSeen();
    }

    public String getDeviceInfo() {
        return String.format("%s (%s) - %s - %s", 
                platform, deviceModel, osVersion, appVersion);
    }

    public String getBatteryStatus() {
        if (batteryLevel == null) return "Unknown";
        if (batteryLevel >= 80) return "Good";
        if (batteryLevel >= 50) return "Fair";
        if (batteryLevel >= 20) return "Low";
        return "Critical";
    }

    public String getStorageStatus() {
        if (storageUsageMb == null) return "Unknown";
        if (storageUsageMb < 1000) return "Good";
        if (storageUsageMb < 4000) return "Fair";
        if (storageUsageMb < 8000) return "High";
        return "Critical";
    }

    public String getNetworkStatus() {
        if (networkType == null) return "Unknown";
        return switch (networkType) {
            case NETWORK_WIFI -> "WiFi";
            case NETWORK_CELLULAR -> "Cellular";
            case NETWORK_OFFLINE -> "Offline";
            default -> "Unknown";
        };
    }

    public String getSyncStatusDisplay() {
        return switch (syncStatus) {
            case SYNC_SYNCED -> "Synced";
            case SYNC_SYNCING -> "Syncing";
            case SYNC_FAILED -> "Failed";
            case SYNC_OFFLINE -> "Offline";
            default -> "Unknown";
        };
    }

    public boolean isOnline() {
        return !NETWORK_OFFLINE.equals(networkType);
    }

    public boolean isOnWiFi() {
        return NETWORK_WIFI.equals(networkType);
    }

    public boolean isOnCellular() {
        return NETWORK_CELLULAR.equals(networkType);
    }

    public boolean isLowBattery() {
        return batteryLevel != null && batteryLevel < 20;
    }

    public boolean isHighStorageUsage() {
        return storageUsageMb != null && storageUsageMb > 6000;
    }

    public boolean needsSync() {
        return !SYNC_SYNCED.equals(syncStatus) || 
               (lastSyncAt != null && lastSyncAt.isBefore(LocalDateTime.now().minusHours(1)));
    }

    public boolean isRecentlyActive() {
        return lastSeen != null && lastSeen.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public boolean isLongInactive() {
        return lastSeen != null && lastSeen.isBefore(LocalDateTime.now().minusDays(7));
    }

    public String getUsageStatistics() {
        return String.format("Sessions: %d, Usage: %d min, Launches: %d, Crashes: %d", 
                totalSessions, totalUsageMinutes, appLaunchCount, crashCount);
    }

    public double getAverageSessionDuration() {
        if (totalSessions == null || totalSessions == 0) return 0.0;
        return (double) totalUsageMinutes / totalSessions;
    }

    public String getEngagementLevel() {
        double avgSession = getAverageSessionDuration();
        if (avgSession >= 30) return "High";
        if (avgSession >= 15) return "Medium";
        if (avgSession >= 5) return "Low";
        return "Very Low";
    }

    public double getCrashRate() {
        if (appLaunchCount == null || appLaunchCount == 0) return 0.0;
        return (double) crashCount / appLaunchCount;
    }

    public String getStabilityLevel() {
        double crashRate = getCrashRate();
        if (crashRate <= 0.01) return "Excellent";
        if (crashRate <= 0.05) return "Good";
        if (crashRate <= 0.10) return "Fair";
        return "Poor";
    }

    public boolean isStable() {
        return getCrashRate() <= 0.05;
    }

    public String getSecurityLevel() {
        if (securityScore == null) return "Unknown";
        if (securityScore >= 90) return "Excellent";
        if (securityScore >= 70) return "Good";
        if (securityScore >= 50) return "Fair";
        return "Poor";
    }

    public String getPerformanceLevel() {
        if (performanceScore == null) return "Unknown";
        if (performanceScore >= 90) return "Excellent";
        if (performanceScore >= 70) return "Good";
        if (performanceScore >= 50) return "Fair";
        return "Poor";
    }

    public String getSatisfactionLevel() {
        if (userSatisfactionScore == null) return "Unknown";
        if (userSatisfactionScore >= 90) return "Excellent";
        if (userSatisfactionScore >= 70) return "Good";
        if (userSatisfactionScore >= 50) return "Fair";
        return "Poor";
    }

    public boolean hasGoodSecurity() {
        return securityScore != null && securityScore >= 70;
    }

    public boolean hasGoodPerformance() {
        return performanceScore != null && performanceScore >= 70;
    }

    public boolean hasGoodSatisfaction() {
        return userSatisfactionScore != null && userSatisfactionScore >= 70;
    }

    public boolean isHighPerforming() {
        return hasGoodSecurity() && hasGoodPerformance() && hasGoodSatisfaction();
    }

    public String getDeviceHealth() {
        int healthScore = 0;
        if (hasGoodSecurity()) healthScore++;
        if (hasGoodPerformance()) healthScore++;
        if (hasGoodSatisfaction()) healthScore++;
        if (isStable()) healthScore++;
        if (!isLowBattery()) healthScore++;
        if (!isHighStorageUsage()) healthScore++;

        if (healthScore >= 5) return "Excellent";
        if (healthScore >= 4) return "Good";
        if (healthScore >= 3) return "Fair";
        return "Poor";
    }

    public boolean needsAttention() {
        return isLowBattery() || isHighStorageUsage() || !isStable() || !hasGoodPerformance();
    }

    public String getAttentionReasons() {
        List<String> reasons = new ArrayList<>();
        if (isLowBattery()) reasons.add("Low battery");
        if (isHighStorageUsage()) reasons.add("High storage usage");
        if (!isStable()) reasons.add("High crash rate");
        if (!hasGoodPerformance()) reasons.add("Poor performance");
        return String.join(", ", reasons);
    }

    public String getTimeAgo() {
        if (lastSeen == null) return "Unknown";
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(lastSeen, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        return days + "d ago";
    }

    public String getDeviceSummary() {
        return String.format("[%s] %s - %s - %s - Last seen: %s", 
                status, getDeviceInfo(), getBatteryStatus(), getNetworkStatus(), getTimeAgo());
    }

    public boolean shouldHighlight() {
        return needsAttention() || isRecentlyActive() || isHighPerforming();
    }

    public String getPlatformIcon() {
        return switch (platform) {
            case PLATFORM_IOS -> "🍎";
            case PLATFORM_ANDROID -> "🤖";
            case PLATFORM_WEB -> "🌐";
            default -> "📱";
        };
    }

    public boolean isUpToDate(String latestVersion) {
        if (appVersion == null || latestVersion == null) return false;
        return appVersion.equals(latestVersion) || isNewerVersion(appVersion, latestVersion);
    }

    private boolean isNewerVersion(String current, String latest) {
        // Simplified version comparison
        String[] currentParts = current.split("\\.");
        String[] latestParts = latest.split("\\.");
        
        for (int i = 0; i < Math.min(currentParts.length, latestParts.length); i++) {
            try {
                int currentNum = Integer.parseInt(currentParts[i]);
                int latestNum = Integer.parseInt(latestParts[i]);
                
                if (currentNum > latestNum) return true;
                if (currentNum < latestNum) return false;
            } catch (NumberFormatException e) {
                // Fall back to string comparison
                return current.compareTo(latest) >= 0;
            }
        }
        
        return currentParts.length >= latestParts.length;
    }

    public String getUpdateStatus(String latestVersion) {
        if (isUpToDate(latestVersion)) return "Up to date";
        return "Update available";
    }

    public boolean needsUpdate(String latestVersion) {
        return !isUpToDate(latestVersion);
    }

    public String getDeviceType() {
        if (isTablet()) return "Tablet";
        if (isPhone()) return "Phone";
        if (isWeb()) return "Web";
        return "Unknown";
    }

    public boolean isTablet() {
        return screenSize != null && (screenSize.contains("iPad") || screenSize.toLowerCase().contains("tablet"));
    }

    public boolean isPhone() {
        return screenSize != null && (screenSize.contains("iPhone") || screenSize.toLowerCase().contains("phone"));
    }

    public String getScreenResolution() {
        return screenSize != null ? screenSize : "Unknown";
    }

    public boolean hasLargeScreen() {
        return screenSize != null && 
               (screenSize.contains("iPad") || screenSize.toLowerCase().contains("tablet") ||
                (screenSize.contains("Max") || screenSize.contains("Plus")));
    }

    public String getOptimalUI() {
        if (hasLargeScreen()) return "Tablet";
        if (isPhone()) return "Mobile";
        if (isWeb()) return "Desktop";
        return "Mobile";
    }

    public boolean supportsAdvancedFeatures() {
        return hasBiometricCapability() && hasOfflineCapability() && hasLocationCapability();
    }

    public String getFeatureSupport() {
        if (supportsAdvancedFeatures()) return "Full";
        if (hasOfflineCapability()) return "Enhanced";
        if (hasBiometricCapability()) return "Standard";
        return "Basic";
    }

    public String getUserExperience() {
        int score = 0;
        if (hasGoodPerformance()) score += 2;
        if (isStable()) score += 2;
        if (hasGoodSatisfaction()) score += 2;
        if (supportsAdvancedFeatures()) score += 1;
        if (isUpToDate("latest")) score += 1;
        
        if (score >= 7) return "Excellent";
        if (score >= 5) return "Good";
        if (score >= 3) return "Fair";
        return "Poor";
    }

    public boolean isPowerUser() {
        return totalUsageMinutes != null && totalUsageMinutes > 1000 && // > 16 hours
               appLaunchCount != null && appLaunchCount > 100;
    }

    public boolean isCasualUser() {
        return totalUsageMinutes != null && totalUsageMinutes < 300 && // < 5 hours
               appLaunchCount != null && appLaunchCount < 50;
    }

    public String getUserType() {
        if (isPowerUser()) return "Power User";
        if (isCasualUser()) return "Casual User";
        return "Regular User";
    }

    public String getUsagePattern() {
        if (lastAppLaunch == null) return "Unknown";
        
        LocalDateTime now = LocalDateTime.now();
        long daysSinceLastLaunch = java.time.Duration.between(lastAppLaunch, now).toDays();
        
        if (daysSinceLastLaunch <= 1) return "Daily";
        if (daysSinceLastLaunch <= 7) return "Weekly";
        if (daysSinceLastLaunch <= 30) return "Monthly";
        return "Rare";
    }

    public boolean isEngagedUser() {
        return "Daily".equals(getUsagePattern()) || "Weekly".equals(getUsagePattern());
    }

    public boolean isAtRiskUser() {
        return "Monthly".equals(getUsagePattern()) || "Rare".equals(getUsagePattern());
    }

    public String getRetentionRisk() {
        if (isAtRiskUser()) return "High";
        if ("Monthly".equals(getUsagePattern())) return "Medium";
        return "Low";
    }

    public boolean shouldReceiveEngagementNotifications() {
        return isAtRiskUser() && isNotificationsEnabled();
    }

    public String getPersonalizationLevel() {
        if (isPowerUser() && supportsAdvancedFeatures()) return "Full";
        if (isEngagedUser() && hasGoodPerformance()) return "Enhanced";
        if (isCasualUser()) return "Basic";
        return "Minimal";
    }

    public boolean canReceivePersonalizedContent() {
        return !isCasualUser() && hasGoodPerformance() && isOnline();
    }

    public String getOptimalNotificationFrequency() {
        if (isPowerUser()) return "Real-time";
        if (isEngagedUser()) return "Hourly";
        if (isCasualUser()) return "Daily";
        return "Weekly";
    }

    public boolean shouldReceiveDigestNotifications() {
        return isCasualUser() || isAtRiskUser();
    }

    public String getPreferredContentFormat() {
        if (hasLargeScreen()) return "Rich";
        if (isTablet()) return "Enhanced";
        if (isPhone()) return "Mobile";
        return "Basic";
    }

    public boolean supportsVideoContent() {
        return hasLargeScreen() && isOnWiFi() && !isLowBattery();
    }

    public boolean supportsInteractiveContent() {
        return hasGoodPerformance() && !isLowBattery();
    }

    public String getBandwidthOptimization() {
        if (isOnWiFi()) return "Full";
        if (isOnCellular()) return "Optimized";
        return "Minimal";
    }

    public boolean shouldUseOfflineMode() {
        return isOfflineModeEnabled() && (isOnCellular() || isLowBattery());
    }

    public String getDataSyncPreference() {
        if (isAutoSyncEnabled() && isOnWiFi()) return "Auto";
        if (isAutoSyncEnabled()) return "WiFi Only";
        return "Manual";
    }
}
