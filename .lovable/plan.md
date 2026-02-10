

# Fix Enrollment School Segregation (New Learner Page)

## Problems Confirmed

After checking both enrollment forms used in the "New Learner" page:

### EnrollmentWizard (multi-step wizard)
- Sets `school` text correctly from context
- Does NOT set `school_id` UUID -- new students are missing their UUID link
- Does NOT set `academic_year_id`
- No duplicate LRN check before insert

### EnrollmentForm (single-page form)
- Sets `school` text correctly from context
- Does NOT set `school_id` UUID
- Does NOT set `academic_year_id`
- `handleNewEnrollment` (line 359) hardcodes `school: 'MABDC'` -- **BUG**: after enrolling in STFXSA and clicking "Enroll Another", the form resets to MABDC
- No duplicate LRN check before insert

### useCreateStudent hook
- Simply passes raw form data directly to the database insert -- no enrichment of `school_id` or `academic_year_id`

## What This Causes

- Newly enrolled students have `school_id = NULL` in the database
- Finance, grades, attendance, and other modules that filter by `school_id` (UUID) will not find these students
- Students enrolled at STFXSA can accidentally get reset to MABDC on re-enrollment

## Resolution Plan

### 1. New file: `src/utils/schoolIdMap.ts`

A simple constant mapping school codes to their database UUIDs:
- `MABDC` maps to `33333333-3333-3333-3333-333333333333`
- `STFXSA` maps to `22222222-2222-2222-2222-222222222222`

This avoids an async database lookup during enrollment.

### 2. Update: `src/hooks/useStudents.ts` (useCreateStudent)

Before inserting, automatically enrich the student data:
- Look up `school_id` from the school code using the map
- Accept an optional `academic_year_id` parameter and include it in the insert

### 3. Update: `src/components/enrollment/EnrollmentWizard.tsx`

- Import `useAcademicYear` context and pass `academic_year_id` into `createStudent.mutateAsync()`
- Add a pre-submit duplicate LRN check: query `students` table for matching LRN + school before inserting

### 4. Update: `src/components/enrollment/EnrollmentForm.tsx`

- Import `useAcademicYear` context and pass `academic_year_id` into `createStudent.mutateAsync()`
- Fix `handleNewEnrollment` (line 359): change hardcoded `'MABDC'` to `selectedSchool`
- Add the same pre-submit duplicate LRN check

### 5. Update: `src/components/curriculum/EnrollmentManagement.tsx`

- Replace the hardcoded placeholder UUID `'00000000-0000-0000-0000-000000000000'` with the correct UUID from the school map utility

## Files to Change

| File | Change |
|------|--------|
| `src/utils/schoolIdMap.ts` | New -- school code to UUID mapping |
| `src/hooks/useStudents.ts` | Enrich insert with `school_id` and `academic_year_id` |
| `src/components/enrollment/EnrollmentWizard.tsx` | Pass `academic_year_id`, add LRN duplicate check |
| `src/components/enrollment/EnrollmentForm.tsx` | Pass `academic_year_id`, fix MABDC reset bug, add LRN duplicate check |
| `src/components/curriculum/EnrollmentManagement.tsx` | Use real school UUID from map |

## After This Fix

Every newly enrolled student will have:
- Correct `school` text value (MABDC or STFXSA)
- Correct `school_id` UUID
- Correct `academic_year_id`
- No duplicate LRN within the same school

This ensures they appear correctly in finance, grades, attendance, and all other school-segregated modules from the moment of enrollment.
