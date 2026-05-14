-- Seed currency rates
INSERT INTO everx_erp.currency_rates (base_currency, target_currency, rate, fetched_at)
VALUES 
    ('AUD', 'USD', 0.67, NOW()),
    ('AUD', 'JPY', 101.50, NOW()),
    ('AUD', 'EUR', 0.62, NOW()),
    ('AUD', 'GBP', 0.53, NOW()),
    ('AUD', 'CNY', 4.85, NOW()),
    ('USD', 'AUD', 1.49, NOW()),
    ('USD', 'JPY', 151.50, NOW()),
    ('USD', 'EUR', 0.92, NOW()),
    ('USD', 'GBP', 0.79, NOW()),
    ('JPY', 'AUD', 0.0099, NOW()),
    ('JPY', 'USD', 0.0066, NOW()),
    ('JPY', 'EUR', 0.0061, NOW()),
    ('JPY', 'GBP', 0.0052, NOW()),
    ('EUR', 'AUD', 1.61, NOW()),
    ('EUR', 'USD', 1.09, NOW()),
    ('EUR', 'JPY', 164.15, NOW()),
    ('EUR', 'GBP', 0.86, NOW()),
    ('GBP', 'AUD', 1.88, NOW()),
    ('GBP', 'USD', 1.27, NOW()),
    ('GBP', 'JPY', 190.91, NOW()),
    ('GBP', 'EUR', 1.16, NOW());
