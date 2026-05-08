package com.everx.onboarding.dto;

import lombok.Data;

@Data
public class ImportDataRequest {

    private Boolean importContacts = false;

    private Boolean importProducts = false;

    private Boolean importServices = false;

    private String csvData; // For CSV import data

    private String importSource; // 'csv', 'manual', 'sample'
}
