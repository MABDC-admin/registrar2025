

# Populate MABDC Student Subject Enrollments

## What's Happening

STFXSA students already have 1,356 subject enrollments in the database, but MABDC's 534 students have **zero** subject enrollments. The subjects themselves already exist with MABDC-compatible grade levels (using "Level X" and "Kinder X" naming). We just need to create the enrollment records in `student_subjects`.

## What Will Be Done

Run a SQL insert that automatically enrolls every MABDC student into the subjects that match their grade level, for the current academic year (2025-2026).

### Data Summary

| MABDC Level | Students | Example Subjects |
|---|---|---|
| Kinder 1 | 47 | (No subjects defined for Kinder 1) |
| Kinder 2 | 57 | Cognitive Development, Literacy/Language, etc. |
| Level 1 | 55 | Language, Makabansa, Math, GMRC |
| Level 2 | 57 | English, Filipino, Math, GMRC |
| Level 3 | 50 | English, Filipino, Math, GMRC |
| Level 4-5 | 83 | English, Filipino, Math, AP, EPP, GMRC |
| Level 6 | 33 | English, Filipino, Math, Science, AP, ESP, MAPEH |
| Level 7-10 | 120 | English, Filipino, Math, Science, AP, ESP, MAPEH, TLE |
| Level 11-12 | 32 | English Language, Filipino, Math |

### SQL Logic

```sql
INSERT INTO student_subjects (student_id, subject_id, academic_year_id, school_id, status)
SELECT 
  s.id,
  sub.id,
  '44444444-4444-4444-4444-444444444444',  -- MABDC 2025-2026
  '33333333-3333-3333-3333-333333333333',  -- MABDC school_id
  'enrolled'
FROM students s
CROSS JOIN subjects sub
WHERE s.school = 'MABDC'
  AND sub.is_active = true
  AND s.level = ANY(sub.grade_levels)
  AND NOT EXISTS (
    SELECT 1 FROM student_subjects ss
    WHERE ss.student_id = s.id
      AND ss.subject_id = sub.id
      AND ss.academic_year_id = '44444444-4444-4444-4444-444444444444'
  );
```

This cross-joins every MABDC student with every active subject, filters to only matching grade levels, and skips any that already exist (idempotent).

## Expected Result

Approximately 2,500-3,000 new enrollment records will be created, giving every MABDC student their full curriculum for 2025-2026. Note: Kinder 1 students may get zero subjects if no subjects have "Kinder 1" in their grade_levels array.

