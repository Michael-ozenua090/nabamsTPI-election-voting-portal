-- NABAMS TPI Executive Positions Seed Data
-- Run AFTER schema.sql

INSERT INTO positions (id, title, display_order) VALUES
  (gen_random_uuid(), 'President',             1),
  (gen_random_uuid(), 'Chief Librarian 1',     2),
  (gen_random_uuid(), 'General Secretary',     3),
  (gen_random_uuid(), 'Financial Secretary',   4),
  (gen_random_uuid(), 'Treasurer',             5),
  (gen_random_uuid(), 'PRO',                   6),
  (gen_random_uuid(), 'Social Director',       7),
  (gen_random_uuid(), 'Welfare Director',      8),
  (gen_random_uuid(), 'Sports Director',       9);

-- -------------------------------------------------------
-- Sample voter (replace with actual student data via CSV)
-- -------------------------------------------------------
-- INSERT INTO voters (matric_number, full_name, level, programme, voting_pin)
-- VALUES ('2025231010270', 'Adewale Bakare', 'ND1', 'Full Time', 'PIN12345');
