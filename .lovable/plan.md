
# Fix School Segregation in Admin User Management

## Problem

The "Generated Credentials" table in Admin User Management shows ALL user accounts from both MABDC and STFXSA together. There is no school filter, so MABDC student accounts appear when viewing STFXSA and vice versa.

**Root cause:** The `fetchCredentials` query joins `user_credentials` with `students` but does not fetch the `school` field, and the table has no school filter dropdown.

## Changes

### File: `src/components/admin/UserManagement.tsx`

**1. Add school field to credential interface and query**
- Add `student_school?: string` to the `UserCredential` interface
- Update the `fetchCredentials` query to also fetch `school` from the students join:
  ```
  students:student_id (student_name, level, school)
  ```
- Map it as `student_school: cred.students?.school`

**2. Add a School filter dropdown to the credentials table**
- Add `schoolFilter` state (default: `'all'`)
- Place a "School" dropdown next to the existing Role and Level filters with options: All Schools, MABDC, STFXSA
- For non-student roles (admin, registrar, teacher, finance) that have no `student_school`, they will only appear when the filter is set to "All Schools" or can be shown under both

**3. Update the filtering logic**
- Extend `filteredCredentials` to also check `schoolFilter`:
  - `'all'`: show everything (current behavior)
  - `'MABDC'`: show credentials where `student_school` contains "MABDC" or is null (for non-student roles)
  - `'STFXSA'`: show credentials where `student_school` contains "STFXSA" or "St. Francis"
- Non-student roles (admin, registrar, teacher, finance) will appear under "All Schools" only, since they are not tied to a specific school in this table

**4. Add a School column to the credentials table**
- Add a "School" column header after "Level"
- Display the student's school as a badge in each row, showing "MABDC", "STFXSA", or "-" for non-student accounts

### Summary
- 1 file modified: `src/components/admin/UserManagement.tsx`
- No database changes needed
- No edge function changes needed
- The school data already exists in the `students` table -- just needs to be fetched and used for filtering
