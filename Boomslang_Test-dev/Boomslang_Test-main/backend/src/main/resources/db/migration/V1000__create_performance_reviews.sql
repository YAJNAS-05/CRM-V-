-- V1000: Performance review / appraisal table
CREATE TABLE IF NOT EXISTS everx_hr.performance_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID NOT NULL,
    reviewer_id     UUID,
    review_period   VARCHAR(50)  NOT NULL,   -- e.g. "2024-H1"
    status          VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',  -- DRAFT / SUBMITTED / REVIEWED / ACKNOWLEDGED
    overall_rating  INTEGER,                  -- 1-5
    goals_rating    INTEGER,
    skills_rating   INTEGER,
    comments        TEXT,
    reviewer_notes  TEXT,
    review_date     DATE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    created_by      UUID,
    is_deleted      BOOLEAN      NOT NULL DEFAULT FALSE,
    version         BIGINT       NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_perf_reviews_employee ON everx_hr.performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_perf_reviews_reviewer ON everx_hr.performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_perf_reviews_status   ON everx_hr.performance_reviews(status);
