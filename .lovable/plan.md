

# Insert Grade 8-10 Subjects (Both Schools) and Auto-Enroll All Learners

## Current State

- **Grade 7 / Level 7**: Already has all 8 correct subjects with dual naming (Filipino, English, Math, Science, AP, ESP, TLE, MAPEH) -- but 0 enrollments
- **Level 8, 9, 10**: Only 4 subjects each (Filipino, English Language, Mathematics, Science) with MABDC-only naming. 428 existing enrollments tied to these.
- **Students**: Only MABDC has learners in these levels (Level 7: 38, Level 8: 36, Level 9: 21, Level 10: 25). No STFXSA learners in Grade 7-10 yet.

## Plan

### Step 1: Update existing Level 8-10 subjects to add Grade naming

Update the 12 existing subjects (L8/L9/L10) to include dual naming so they work for both schools. This preserves the 428 existing enrollment records.

- `Level 8` subjects get `ARRAY['Level 8', 'Grade 8']`
- `Level 9` subjects get `ARRAY['Level 9', 'Grade 9']`
- `Level 10` subjects get `ARRAY['Level 10', 'Grade 10']`

Also standardize names to match Grade 7 style (e.g., "English Language" to "English", "Mathematics" to "Math").

### Step 2: Insert missing subjects for Level 8-10

Add the 4 missing subjects for each of Level 8, 9, 10 (12 new rows total):
- Araling Panlipunan (AP)
- Edukasyon sa Pagpapakatao (ESP) / Values Education
- TLE (Technology and Livelihood Education)
- MAPEH

Each with dual grade_levels arrays.

### Step 3: Auto-enroll all learners

Enroll every student in Level 7-10 into all 8 subjects for their grade level:
- Level 7: 38 students x 8 subjects = 304 enrollments
- Level 8: 36 students x 8 subjects = 288 enrollments (minus 428 already enrolled = net ~144 new from missing subjects + re-check)
- Level 9: 21 students x 8 subjects = 168 enrollments
- Level 10: 25 students x 8 subjects = 200 enrollments

Will use INSERT ... ON CONFLICT or NOT EXISTS to avoid duplicate enrollments for the 428 already enrolled.

## Technical Details

### Migration SQL sequence:

1. **Update** 12 existing L8-L10 subjects: add Grade naming, standardize names
2. **Insert** 12 new subjects (AP, ESP, TLE, MAPEH for each of L8, L9, L10)
3. **Insert** enrollments for Level 7 students (38 x 8 = 304 rows)
4. **Insert** enrollments for Level 8-10 students into NEW subjects only (avoiding duplicates for existing 4 subjects)

Key IDs:
- MABDC school_id: `33333333-3333-3333-3333-333333333333`
- STFXSA school_id: `22222222-2222-2222-2222-222222222222`
- Academic year (2025-2026): `74fb8614-8b9d-49d8-ac4a-7f4c74df201e`

No code changes required -- purely database operations.

