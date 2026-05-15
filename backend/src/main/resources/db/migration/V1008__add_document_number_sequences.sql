CREATE TABLE IF NOT EXISTS everx_erp.document_number_sequences (
    prefix VARCHAR(30) PRIMARY KEY,
    last_number BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO everx_erp.document_number_sequences (prefix, last_number, updated_at)
VALUES
    ('PO', 0, NOW()),
    ('SO', 0, NOW()),
    ('INV-AU', 0, NOW()),
    ('INV-US', 0, NOW()),
    ('INV-JP', 0, NOW()),
    ('INV-SO', 0, NOW()),
    ('INV-WF', 0, NOW()),
    ('TRF', 0, NOW()),
    ('ST', 0, NOW()),
    ('SA', 0, NOW()),
    ('QC', 0, NOW()),
    ('ASS', 0, NOW()),
    ('ACQ', 0, NOW())
ON CONFLICT (prefix) DO NOTHING;
