

# Enhance Teacher Portal with Profile & DepEd CSV Import

## Overview

Redesign the Teacher Portal to match the Student Portal's polished UI pattern, add a teacher data fetching system that links a logged-in teacher to their record, and create a CSV import feature for bulk-loading teacher data from DepEd files.

## What Will Change

### 1. Teacher Data Fetching Hook

Create a data-fetching system similar to the Student Portal's `useStudentData` pattern. When a teacher logs in, the app will look up their `user_id` in the `teachers` table and load their profile, assigned classes, grades they manage, and schedule.

**New file: `src/hooks/useTeacherData.ts`**
- `useTeacherProfile(userId)` -- fetches the teacher record from the `teachers` table by matching `user_id`
- `useTeacherClasses(teacherId)` -- fetches students/subjects assigned to the teacher (by matching `student_grades.submitted_by` or subjects + grade_level)
- `useTeacherSchedule(teacherId)` -- fetches schedule data if available

### 2. Teacher Portal Redesign

**Modified file: `src/components/portals/TeacherPortal.tsx`**

Complete rewrite to match the Student Portal pattern:
- Accept an `activeSection` prop (like StudentPortal) for multi-section navigation
- Add a loading state with spinner
- Fetch real teacher data using the new hooks
- Display teacher profile card with gradient header (matching StudentProfileCard style)
- Show real "My Classes" from database instead of hardcoded data
- Display real assigned subjects and grade levels
- Quick action cards that navigate to actual sections (grades, attendance, etc.)
- Dashboard stats (students in my classes, pending grades, attendance today)

Sections:
- `dashboard` -- overview with stats, quick actions, my classes
- `profile` -- teacher profile card (similar to StudentProfileCard)
- `grades` -- redirect to GradesManagement (already exists)
- `attendance` -- redirect to AttendanceManagement
- `schedule` -- class schedule view
- `assignments` -- redirect to AssignmentManagement

### 3. Teacher Profile Card

**New file: `src/components/teachers/TeacherProfileCard.tsx`**

Mirrors `StudentProfileCard` design:
- Teal/green gradient header with teacher name, employee ID, department
- Basic Information card (name, employee ID, email, phone)
- Department & Subjects card (assigned subjects, grade levels)
- School Information card (school name, status)
- Same card styling with gradient headers and colored borders

### 4. DepEd CSV Import for Teachers

**New file: `src/components/teachers/TeacherCSVImport.tsx`**

Similar to the existing `CSVImport` component for students:
- File upload dropzone accepting .csv and .xlsx files
- Column mapping UI (map CSV columns to teacher table fields: employee_id, full_name, email, phone, department, grade_level, subjects)
- Preview table showing parsed data before import
- Bulk insert into `teachers` table with the current school context
- Option to create user accounts during import (calls `create-users` edge function)
- Validation: check for duplicate employee IDs and emails
- Progress indicator during import
- Success/error summary

### 5. Database Changes

**Add `teacher_id` column to `user_credentials` table** -- to link teacher accounts similarly to how `student_id` links student accounts. This enables the Teacher Portal to look up the teacher record for the logged-in user.

```sql
ALTER TABLE public.user_credentials 
ADD COLUMN teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;
```

**Update RLS on `teachers` table** -- add a policy allowing teachers to view their own record:
```sql
CREATE POLICY "Teachers can view own record"
ON public.teachers
FOR SELECT
USING (user_id = auth.uid());
```

### 6. Integration in Index.tsx

Update `Index.tsx` to:
- Pass `activeSection` prop to TeacherPortal based on active tab
- Add teacher-specific tab routes (teacher-profile, teacher-classes) mapped to TeacherPortal sections
- Add "Teacher CSV Import" as a menu item under School Management for admin/registrar roles

### 7. Navigation Updates

**Modified file: `src/components/layout/DashboardLayout.tsx`**

Add teacher-specific navigation items in the teacher role's nav groups:
- Profile item under a "My Info" collapsible group

### 8. Fix Build Errors

While implementing, also fix the two pre-existing build errors:
- `supabase/functions/process-pdf/index.ts` -- fix `pdf-lib` import to use a compatible import method
- `src/components/zoom/ZoomRunner.tsx` -- add null checks for `window.ZoomMtg`

---

## Technical Details

### Teacher Data Flow
```text
User logs in (teacher role)
  -> useTeacherProfile(user.id) queries teachers table WHERE user_id = auth.uid()
  -> Returns teacher record (name, employee_id, department, subjects, school)
  -> TeacherPortal renders profile + dashboard using real data
```

### CSV Import Flow
```text
Upload CSV/XLSX file
  -> Parse with papaparse/xlsx (already installed)
  -> Show column mapping UI
  -> Validate data (required fields, duplicates)
  -> Preview rows
  -> Bulk insert into teachers table
  -> Optionally create user accounts via create-users edge function
  -> Show results summary
```

### Files Created
- `src/hooks/useTeacherData.ts`
- `src/components/teachers/TeacherProfileCard.tsx`
- `src/components/teachers/TeacherCSVImport.tsx`

### Files Modified
- `src/components/portals/TeacherPortal.tsx` (major rewrite)
- `src/pages/Index.tsx` (add teacher section routes + CSV import tab)
- `src/components/layout/DashboardLayout.tsx` (add teacher nav items)
- `supabase/functions/process-pdf/index.ts` (fix build error)
- `src/components/zoom/ZoomRunner.tsx` (fix build error)

### Database Migration
- Add `teacher_id` column to `user_credentials`
- Add RLS policy for teachers to view own record
- Update `create-users` edge function to populate `teacher_id` in `user_credentials` when creating teacher accounts

