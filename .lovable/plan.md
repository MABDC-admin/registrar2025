

# Learner Profile Cleanup, Edit Function, and Teacher Learner View

## Overview

Three main areas to address:
1. Clean up the Learner detail panel fields to follow DepEd standards, add religion (requires database change), remove "Blood Group", add Edit button
2. Change profile header to teal gradient
3. Enable teachers to see their grade-level learners in the sidebar "Learners" tab

---

## 1. Database Migration

Add a `religion` column to the `students` table:

```sql
ALTER TABLE public.students ADD COLUMN religion text;
```

## 2. Update TypeScript Types (`src/types/student.ts`)

- Add `religion: string | null` to `Student` interface
- Add `religion?: string` to `StudentFormData`
- Add `religion: string` to `CSVStudent`

## 3. Update StudentDetailPanel (`src/components/students/StudentDetailPanel.tsx`)

**Header**: Change from dark foreground gradient to teal:
```
from: bg-gradient-to-r from-foreground/90 via-foreground/80 to-foreground/90
to:   bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-400
```

**Edit Button**: Add a pencil icon button in the header that opens the edit modal or navigates to the full profile page. Import `useNavigate` and `Pencil` icon.

**Detail Items**: 
- Keep: Gender, Date of Birth, Religion (now from `student.religion`), Address (Philippine + UAE), Father (name + contact), Mother (maiden name + contact), Previous School (add this)
- Remove: Blood Group (not a DepEd field)
- Add: Age (from `student.age`)

## 4. Update Student Forms (`src/components/students/StudentFormModal.tsx`)

Add a "Religion" input field in the Basic Information section so it can be entered/edited when adding or editing a learner.

## 5. Update LIS Overview (`src/components/lis/LISStudentOverview.tsx`)

Add Religion to the Personal Information card.

## 6. Enable Teacher Learner View (`src/pages/Index.tsx`)

Currently line 346:
```typescript
{activeTab === 'students' && hasAdminAccess && (
```

Change to allow teachers:
```typescript
{activeTab === 'students' && (hasAdminAccess || role === 'teacher') && (
```

When role is teacher:
- Fetch the teacher's `grade_level` from their profile using `useTeacherProfile`
- Filter the students array to only show learners matching that grade level
- Hide the "Add Learner" button
- Pass no-op functions for `onEdit` and `onDelete` so teachers have view-only access

This works across all schools because the existing `useStudents` hook already filters by the active school context, and teachers are associated with a specific school.

## 7. Update CSV Import (`src/components/import/CSVImport.tsx`)

Map `religion` column from CSV imports so bulk data entry includes religion.

---

## Summary of Changes

| File | Change |
|------|--------|
| Database | Add `religion` text column to `students` |
| `src/types/student.ts` | Add `religion` to all interfaces |
| `src/components/students/StudentDetailPanel.tsx` | Teal header, add Edit button, remove Blood Group, add Religion/Age/Previous School from data |
| `src/components/students/StudentFormModal.tsx` | Add Religion input field |
| `src/components/lis/LISStudentOverview.tsx` | Add Religion to Personal Info card |
| `src/pages/Index.tsx` | Allow teachers to access students tab with grade-level filtering |
| `src/components/import/CSVImport.tsx` | Map religion column |

