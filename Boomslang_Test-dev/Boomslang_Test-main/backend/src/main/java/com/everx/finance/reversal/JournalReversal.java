package com.everx.finance.reversal;

import com.everx.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import java.util.UUID;

@Entity
@Table(name = "journal_reversal", schema = "everx_finance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JournalReversal extends BaseEntity {
    @Column(name = "original_entry_id", nullable = false)
    private UUID originalEntryId;
    @Column(name = "reversal_entry_id")
    private UUID reversalEntryId;
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    @Column(name = "reversed_by")
    private UUID reversedBy;
    @Column(name = "status", length = 20)
    private String status;
}
