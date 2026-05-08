package com.everx.collaboration.entity;

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
@Table(name = "collaboration_messages", schema = "everx_collaboration")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Message extends BaseEntity {

    @Column(name = "session_id", nullable = false)
    private java.util.UUID sessionId;

    @Column(name = "sender_id", nullable = false, length = 200)
    private String senderId;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "metadata", columnDefinition = "JSON")
    private Map<String, Object> metadata;

    @Column(name = "parent_message_id")
    private java.util.UUID parentMessageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id", insertable = false, updatable = false)
    private Message parentMessage;

    @Column(name = "reply_count", nullable = false)
    @Builder.Default
    private Integer replyCount = 0;

    @Column(name = "reaction_count", nullable = false)
    @Builder.Default
    private Integer reactionCount = 0;

    @Column(name = "edit_count", nullable = false)
    @Builder.Default
    private Integer editCount = 0;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    @Column(name = "is_edited", nullable = false)
    @Builder.Default
    private Boolean isEdited = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "is_system_message", nullable = false)
    @Builder.Default
    private Boolean isSystemMessage = false;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "mentions", columnDefinition = "JSON")
    private java.util.List<String> mentions;

    @Column(name = "hashtags", columnDefinition = "JSON")
    private java.util.List<String> hashtags;

    @Column(name = "attachments", columnDefinition = "JSON")
    private java.util.List<Map<String, Object>> attachments;

    @Column(name = "reactions", columnDefinition = "JSON")
    private Map<String, java.util.List<String>> reactions;

    @Column(name = "thread_participants", columnDefinition = "JSON")
    private java.util.List<String> threadParticipants;

    @Column(name = "read_receipts", columnDefinition = "JSON")
    private Map<String, LocalDateTime> readReceipts;

    @Column(name = "delivery_status", nullable = false, length = 20)
    @Builder.Default
    private String deliveryStatus = "DELIVERED";

    @Column(name = "moderation_status", nullable = false, length = 20)
    @Builder.Default
    private String moderationStatus = "APPROVED";

    @Column(name = "moderated_by")
    private String moderatedBy;

    @Column(name = "moderated_at")
    private LocalDateTime moderatedAt;

    @Column(name = "moderation_reason")
    private String moderationReason;

    // Message types
    public static final String TYPE_TEXT = "TEXT";
    public static final String TYPE_IMAGE = "IMAGE";
    public static final String TYPE_FILE = "FILE";
    public static final String TYPE_AUDIO = "AUDIO";
    public static final String TYPE_VIDEO = "VIDEO";
    public static final String TYPE_LINK = "LINK";
    public static final String TYPE_SYSTEM = "SYSTEM";
    public static final String TYPE_POLL = "POLL";
    public static final String TYPE_EMOJI = "EMOJI";
    public static final String TYPE_RICH_TEXT = "RICH_TEXT";

    // Delivery status
    public static final String DELIVERY_PENDING = "PENDING";
    public static final String DELIVERY_DELIVERED = "DELIVERED";
    public static final String DELIVERY_FAILED = "FAILED";

    // Moderation status
    public static final String MODERATION_APPROVED = "APPROVED";
    public static final String MODERATION_PENDING = "PENDING";
    public static final String MODERATION_REJECTED = "REJECTED";
    public static final String MODERATION_FLAGGED = "FLAGGED";

    // Helper methods
    public boolean isTextMessage() {
        return TYPE_TEXT.equals(type);
    }

    public boolean isImageMessage() {
        return TYPE_IMAGE.equals(type);
    }

    public boolean isFileMessage() {
        return TYPE_FILE.equals(type);
    }

    public boolean isAudioMessage() {
        return TYPE_AUDIO.equals(type);
    }

    public boolean isVideoMessage() {
        return TYPE_VIDEO.equals(type);
    }

    public boolean isLinkMessage() {
        return TYPE_LINK.equals(type);
    }

    public boolean isSystemMessage() {
        return TYPE_SYSTEM.equals(type) || isSystemMessage;
    }

    public boolean isPollMessage() {
        return TYPE_POLL.equals(type);
    }

    public boolean isEmojiMessage() {
        return TYPE_EMOJI.equals(type);
    }

    public boolean isRichTextMessage() {
        return TYPE_RICH_TEXT.equals(type);
    }

    public boolean isPinned() {
        return isPinned;
    }

    public boolean isEdited() {
        return isEdited;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public boolean hasParent() {
        return parentMessageId != null;
    }

    public boolean isReply() {
        return hasParent();
    }

    public boolean hasReplies() {
        return replyCount > 0;
    }

    public boolean hasReactions() {
        return (reactionCount != null && reactionCount > 0)
                || (reactions != null && !reactions.isEmpty());
    }

    public boolean hasMentions() {
        return mentions != null && !mentions.isEmpty();
    }

    public boolean hasHashtags() {
        return hashtags != null && !hashtags.isEmpty();
    }

    public boolean hasAttachments() {
        return attachments != null && !attachments.isEmpty();
    }

    public boolean hasThreadParticipants() {
        return threadParticipants != null && !threadParticipants.isEmpty();
    }

    public boolean hasReadReceipts() {
        return readReceipts != null && !readReceipts.isEmpty();
    }

    public boolean isDelivered() {
        return DELIVERY_DELIVERED.equals(deliveryStatus);
    }

    public boolean isPendingDelivery() {
        return DELIVERY_PENDING.equals(deliveryStatus);
    }

    public boolean isDeliveryFailed() {
        return DELIVERY_FAILED.equals(deliveryStatus);
    }

    public boolean isApproved() {
        return MODERATION_APPROVED.equals(moderationStatus);
    }

    public boolean isPendingModeration() {
        return MODERATION_PENDING.equals(moderationStatus);
    }

    public boolean isRejected() {
        return MODERATION_REJECTED.equals(moderationStatus);
    }

    public boolean isFlagged() {
        return MODERATION_FLAGGED.equals(moderationStatus);
    }

    public void markAsPinned() {
        this.isPinned = true;
    }

    public void unpin() {
        this.isPinned = false;
    }

    public void editContent(String newContent) {
        this.content = newContent;
        this.isEdited = true;
        this.editCount++;
        this.editedAt = LocalDateTime.now();
    }

    public void delete(String deletedBy) {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
    }

    public void markAsDelivered() {
        this.deliveryStatus = DELIVERY_DELIVERED;
    }

    public void markAsDeliveryFailed() {
        this.deliveryStatus = DELIVERY_FAILED;
    }

    public void approveModeration() {
        this.moderationStatus = MODERATION_APPROVED;
        this.moderatedAt = LocalDateTime.now();
    }

    public void rejectModeration(String reason, String moderatedBy) {
        this.moderationStatus = MODERATION_REJECTED;
        this.moderationReason = reason;
        this.moderatedBy = moderatedBy;
        this.moderatedAt = LocalDateTime.now();
    }

    public void flagForModeration(String reason, String moderatedBy) {
        this.moderationStatus = MODERATION_FLAGGED;
        this.moderationReason = reason;
        this.moderatedBy = moderatedBy;
        this.moderatedAt = LocalDateTime.now();
    }

    public void incrementReplyCount() {
        this.replyCount++;
    }

    public void decrementReplyCount() {
        if (replyCount > 0) {
            this.replyCount--;
        }
    }

    public void incrementReactionCount() {
        this.reactionCount++;
    }

    public void decrementReactionCount() {
        if (reactionCount > 0) {
            this.reactionCount--;
        }
    }

    public void addReaction(String emoji, String userId) {
        if (reactions == null) {
            reactions = new java.util.HashMap<>();
        }
        reactions.computeIfAbsent(emoji, k -> new java.util.ArrayList<>()).add(userId);
        incrementReactionCount();
    }

    public void removeReaction(String emoji, String userId) {
        if (reactions != null) {
            java.util.List<String> users = reactions.get(emoji);
            if (users != null) {
                users.remove(userId);
                if (users.isEmpty()) {
                    reactions.remove(emoji);
                }
                decrementReactionCount();
            }
        }
    }

    public void addMention(String userId) {
        if (mentions == null) {
            mentions = new java.util.ArrayList<>();
        }
        mentions.add(userId);
    }

    public void addHashtag(String hashtag) {
        if (hashtags == null) {
            hashtags = new java.util.ArrayList<>();
        }
        hashtags.add(hashtag);
    }

    public void addAttachment(Map<String, Object> attachment) {
        if (attachments == null) {
            attachments = new java.util.ArrayList<>();
        }
        attachments.add(attachment);
    }

    public void markAsRead(String userId) {
        if (readReceipts == null) {
            readReceipts = new java.util.HashMap<>();
        }
        readReceipts.put(userId, LocalDateTime.now());
    }

    public void addThreadParticipant(String userId) {
        if (threadParticipants == null) {
            threadParticipants = new java.util.ArrayList<>();
        }
        if (!threadParticipants.contains(userId)) {
            threadParticipants.add(userId);
        }
    }

    public boolean isHighPriority() {
        return priority >= 8;
    }

    public boolean isLongMessage() {
        return content != null && content.length() > 500;
    }

    public boolean isShortMessage() {
        return content != null && content.length() <= 100;
    }

    public boolean isMediaMessage() {
        return isImageMessage() || isAudioMessage() || isVideoMessage() || isFileMessage();
    }

    public boolean isRichContent() {
        return isRichTextMessage() || hasAttachments() || hasHashtags();
    }

    public String getMessageTypeLabel() {
        return switch (type) {
            case TYPE_TEXT -> "Text";
            case TYPE_IMAGE -> "Image";
            case TYPE_FILE -> "File";
            case TYPE_AUDIO -> "Audio";
            case TYPE_VIDEO -> "Video";
            case TYPE_LINK -> "Link";
            case TYPE_SYSTEM -> "System";
            case TYPE_POLL -> "Poll";
            case TYPE_EMOJI -> "Emoji";
            case TYPE_RICH_TEXT -> "Rich Text";
            default -> "Unknown";
        };
    }

    public String getEngagementLevel() {
        int engagementScore = 0;
        if (hasReactions()) engagementScore += reactionCount;
        if (hasReplies()) engagementScore += replyCount * 2;
        if (hasMentions()) engagementScore += mentions.size();
        if (isPinned()) engagementScore += 5;

        if (engagementScore >= 10) return "Very High";
        if (engagementScore >= 5) return "High";
        if (engagementScore >= 2) return "Medium";
        if (engagementScore >= 1) return "Low";
        return "Very Low";
    }

    public boolean isEngaging() {
        return getEngagementLevel().equals("High") || getEngagementLevel().equals("Very High");
    }

    public String getContentPreview() {
        if (content == null) return "";
        if (content.length() <= 100) return content;
        return content.substring(0, 97) + "...";
    }

    public boolean containsKeyword(String keyword) {
        return content != null && content.toLowerCase().contains(keyword.toLowerCase());
    }

    public boolean isFromUser(String userId) {
        return userId.equals(senderId);
    }

    public boolean mentionsUser(String userId) {
        return hasMentions() && mentions.contains(userId);
    }

    public boolean isReadByUser(String userId) {
        return hasReadReceipts() && readReceipts.containsKey(userId);
    }

    public boolean isThreadParticipant(String userId) {
        return hasThreadParticipants() && threadParticipants.contains(userId);
    }

    public boolean hasUserReacted(String userId) {
        if (!hasReactions()) return false;
        return reactions.values().stream().anyMatch(users -> users.contains(userId));
    }

    public String getUserReaction(String userId) {
        if (!hasReactions()) return null;
        for (Map.Entry<String, java.util.List<String>> entry : reactions.entrySet()) {
            if (entry.getValue().contains(userId)) {
                return entry.getKey();
            }
        }
        return null;
    }

    public boolean isRecent() {
        return createdAt != null && createdAt.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public boolean isOld() {
        return createdAt != null && createdAt.isBefore(LocalDateTime.now().minusDays(7));
    }

    public String getTimeAgo() {
        if (createdAt == null) return "Unknown";
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(createdAt, now).toMinutes();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days < 7) return days + "d ago";
        return createdAt.toLocalDate().toString();
    }

    public String getMessageSummary() {
        return String.format("[%s] %s: %s - %s", 
                getMessageTypeLabel(), senderId, getContentPreview(), getTimeAgo());
    }

    public boolean shouldHighlight() {
        return isPinned() || isHighPriority() || isEngaging();
    }

    public boolean needsModeration() {
        return isPendingModeration() || isFlagged();
    }

    public boolean isModerated() {
        return moderatedBy != null;
    }

    public String getModerationInfo() {
        if (!isModerated()) return "Not moderated";
        return String.format("%s by %s - %s", 
                moderationStatus, moderatedBy, moderationReason);
    }

    public boolean canBeEdited() {
        return !isDeleted() && !isSystemMessage() && 
               createdAt != null && createdAt.isAfter(LocalDateTime.now().minusMinutes(15));
    }

    public boolean canBeDeleted() {
        return !isDeleted();
    }

    public boolean canBeRepliedTo() {
        return !isDeleted() && !isSystemMessage();
    }

    public boolean canBeReactedTo() {
        return !isDeleted() && !isSystemMessage();
    }

    public String getWordCount() {
        if (content == null || content.trim().isEmpty()) return "0";
        return String.valueOf(content.trim().split("\\s+").length);
    }

    public boolean isLongWordCount() {
        return Integer.parseInt(getWordCount()) > 100;
    }

    public String getCharacterCount() {
        if (content == null) return "0";
        return String.valueOf(content.length());
    }

    public boolean isLongCharacterCount() {
        return Integer.parseInt(getCharacterCount()) > 1000;
    }

    public String getReadingTime() {
        int words = Integer.parseInt(getWordCount());
        int minutes = Math.max(1, (int) Math.ceil(words / 200.0)); // 200 words per minute
        return minutes + " min read";
    }
}
