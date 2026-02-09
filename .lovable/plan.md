

# Fix Student School ID Data + Finance Access for Both Schools

## Problem

All 546 students have `school_id = 22222222-2222-2222-2222-222222222222` (STFXSA), but 534 of them actually belong to MABDC based on the `school` text column. This means:
- Finance user searching MABDC students finds zero results
- All students incorrectly appear under STFXSA
- Assessments, payments, and clearance generated for these students would be assigned to the wrong school

## Root Cause

When `school_id` was originally populated, all records were pointed to the STFXSA UUID instead of mapping based on the `school` text column.

## Fix Plan

### 1. Data Fix: Update school_id based on school text column

Run a data update (not a schema migration) to correct the `school_id` for MABDC students:

```sql
UPDATE students 
SET school_id = '33333333-3333-3333-3333-333333333333' 
WHERE school = 'MABDC';
```

This will correctly assign 534 students to MABDC and leave 12 students under STFXSA.

### 2. Grant Finance User Access to MABDC

The finance user (`ivyan@stfxsa.org`) currently only has access to STFXSA. Insert a new row to grant MABDC access:

```sql
INSERT INTO user_school_access (user_id, school_id, role, granted_by, is_active)
VALUES (
  (SELECT user_id FROM user_credentials WHERE email = 'ivyan@stfxsa.org' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  'finance',
  (SELECT user_id FROM user_credentials WHERE email = 'ivyan@stfxsa.org' LIMIT 1),
  true
);
```

### 3. Verify Results

After the fix:
- MABDC: 534 students with `school_id = 33333333`
- STFXSA: 12 students with `school_id = 22222222`
- Finance user can search and view students in both schools via school switcher

### 4. Proceed with Enhancement Plan

Once data is corrected, continue with the previously approved plan (Learner Page, Cashier workflow, Reset Data, audit logging) -- now working correctly for both schools.

## Technical Details

- 2 data operations (UPDATE students, INSERT user_school_access) -- no schema changes needed
- No frontend code changes required for this fix
- The existing finance RLS policy on students already supports both schools via `user_school_access` join
- After this fix, the school switcher in the finance portal will correctly show different student sets per school

