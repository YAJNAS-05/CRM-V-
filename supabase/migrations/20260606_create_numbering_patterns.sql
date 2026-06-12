-- Migration: Create numbering_patterns table for configurable document numbering
-- Created: 2026-06-06
-- This table stores patterns for generating document numbers (SO, invoices, etc.) with configurable formats

CREATE TABLE IF NOT EXISTS numbering_patterns (
    id BIGSERIAL PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL UNIQUE,
    prefix VARCHAR(100) NOT NULL,
    pattern VARCHAR(200) NOT NULL,
    sequence_width INTEGER NOT NULL DEFAULT 6,
    next_sequence BIGINT NOT NULL DEFAULT 1,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on document_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_numbering_patterns_document_type 
ON numbering_patterns(document_type);

-- Insert default SO numbering pattern if not exists
INSERT INTO numbering_patterns (document_type, prefix, pattern, sequence_width, next_sequence, description)
VALUES ('SALES_ORDER', 'SO', '{PREFIX}-{YYYY}-{NNNNNN}', 6, 1, 'Sales Order numbering with year and 6-digit sequence')
ON CONFLICT (document_type) DO NOTHING;
