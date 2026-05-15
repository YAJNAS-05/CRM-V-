-- V17: Add ShedLock distributed scheduler coordination
-- Prevents duplicate scheduled job execution across multiple instances

CREATE TABLE IF NOT EXISTS shedlock (
    name        VARCHAR(64) NOT NULL PRIMARY KEY,
    lock_until  TIMESTAMP NOT NULL,
    locked_at   TIMESTAMP NOT NULL,
    locked_by   VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shedlock_lock 
    ON shedlock(name, lock_until);

COMMENT ON TABLE shedlock IS 'Coordinates scheduled job execution across Kubernetes instances. Prevents parallel runs.';
