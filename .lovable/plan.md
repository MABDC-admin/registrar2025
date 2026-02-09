
# Add School and Grade Level Selection to Student Account Creation

## Overview

Enhance the Student Accounts card in Admin User Management to allow selecting a specific school and grade level before creating accounts. This ensures proper email domain assignment (LRN@mabdc.org vs LRN@stfxsa.org) and allows creating accounts for specific grade levels instead of all students at once.

## Changes

### 1. `src/components/admin/UserManagement.tsx`

**Add new state variables:**
- `bulkSchool` -- selected school for account creation (`'MABDC'` | `'STFXSA'` | `'all'`)
- `bulkGradeLevel` -- selected grade level (`'all'` or a specific level like `'Level 1'`)

**Update the Student Accounts card UI:**
- Add a School dropdown (MABDC, STFXSA, All Schools)
- Add a Grade Level dropdown (All Levels, Kinder 1, Kinder 2, Level 1-12) that dynamically shows levels for the selected school
- Update the description text to reflect the current selection
- Pass `school` and `gradeLevel` parameters to the edge function call

**Update `handleBulkCreateStudents`:**
```typescript
const handleBulkCreateStudents = () => {
  createUser('bulk_create_students', {
    school: bulkSchool,        // 'MABDC', 'STFXSA', or 'all'
    gradeLevel: bulkGradeLevel // 'all' or specific level
  });
};
```

### 2. `supabase/functions/create-users/index.ts`

**Update the `bulk_create_students` action:**
- Accept `school` and `gradeLevel` parameters from the request body
- Add school filtering to the students query:
  - `'MABDC'`: filter `school.ilike.%mabdc%` OR `school.is.null`
  - `'STFXSA'`: filter `school.ilike.%stfxsa%` OR `school.ilike.%st. francis%`
  - `'all'`: no school filter
- Add grade level filtering: if not `'all'`, filter by `level.eq.<gradeLevel>`
- This ensures only matching students get accounts created with the correct email domain

**Update the interface:**
```typescript
interface CreateUserRequest {
  // ...existing fields
  school?: string;      // For bulk_create_students filtering
  gradeLevel?: string;  // For bulk_create_students filtering
}
```

## UI Layout (Student Accounts Card)

```
+-----------------------------------+
| Student Accounts                  |
| Bulk create from existing students|
|                                   |
| School                            |
| [MABDC v]                         |
|                                   |
| Grade Level                       |
| [All Levels v]                    |
|                                   |
| Creates accounts for MABDC        |
| students. Username = LRN.         |
|                                   |
| [Create Accounts] [Reset]         |
+-----------------------------------+
```

## Technical Details

### Grade Levels List
Uses the existing constant pattern: Kinder 1, Kinder 2, Level 1 through Level 12.

### Email Domain Logic (already exists in edge function)
- MABDC students: `{LRN}@mabdc.org`
- STFXSA students: `{LRN}@stfxsa.org`
- The `generateEmail` function in the edge function already handles this based on the student's `school` field.

### Files Modified
- `src/components/admin/UserManagement.tsx` -- Add school/grade dropdowns and pass params
- `supabase/functions/create-users/index.ts` -- Accept and apply school/gradeLevel filters
