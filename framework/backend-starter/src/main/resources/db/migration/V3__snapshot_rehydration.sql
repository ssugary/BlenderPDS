-- P3.3: the stored scene snapshot becomes a rehydration point.
-- baseSeq and schema version travel with it, so a new client can receive the snapshot plus
-- only the operations after it (the log stays the source of truth).
ALTER TABLE sessions ADD COLUMN snapshot_seq bigint;
ALTER TABLE sessions ADD COLUMN snapshot_version integer;
