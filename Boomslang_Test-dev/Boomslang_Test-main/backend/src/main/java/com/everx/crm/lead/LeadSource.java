package com.everx.crm.lead;

/**
 * Source of lead - how a potential customer was acquired
 * Helps track marketing effectiveness and lead attribution
 */
public enum LeadSource {
    WEBSITE,               // Lead from website inquiry or form
    TRADE_SHOW_ARAB_HEALTH,// Arab Health trade show
    TRADE_SHOW_RSNA,       // RSNA (Radiological Society of North America) trade show
    TRADE_SHOW_IRIA,       // Indian Radiological & Imaging Association trade show
    TRADE_SHOW_OTHER,      // Other trade shows and exhibitions
    REFERRAL,              // Referral from existing customer or partner
    COLD_OUTREACH,         // Direct sales outreach/cold calling
    INBOUND_PHONE,         // Inbound phone inquiry
    TARGETED_CAMPAIGN,     // Targeted marketing campaign
    BUSINESS_DEVELOPMENT,  // Business development initiative
    OTHER                  // Other unspecified source
}
