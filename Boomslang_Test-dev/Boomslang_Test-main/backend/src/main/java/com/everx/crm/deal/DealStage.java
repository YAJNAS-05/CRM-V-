package com.everx.crm.deal;

public enum DealStage {
    PROSPECTING,
    QUALIFICATION,
    PROPOSAL,
    NEGOTIATION,
    CLOSED_WON,
    CLOSED_LOST,

    // Legacy values kept for data compatibility
    @Deprecated NEEDS_ANALYSIS,
    @Deprecated VALUE_PROPOSITION,
    @Deprecated ID_DECISION_MAKERS,
    @Deprecated PERCEPTION_ANALYSIS,
    @Deprecated PROPOSAL_PRICE_QUOTE,
    @Deprecated NEGOTIATION_REVIEW
}
