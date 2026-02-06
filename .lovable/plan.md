
# Filter Library Books by Student Grade Level

## Overview

When a student logs in to access the Library, they will only see books matching their grade level. This ensures students see age-appropriate content and declutters the library view. Admin and registrar users will continue to see all books with the grade filter option.

## Current Behavior

- All authenticated users see all books in the library
- Grade filter dropdown is available for manual filtering
- No automatic filtering based on the logged-in student's grade

## Changes

### 1. Fetch Student Grade Level for Library Filtering

The LibraryPage component will fetch the student's grade level when a student user is viewing the library.

**Data Flow:**
1. Check if the current user role is "student"
2. If student, fetch their record from `user_credentials` -> `students` (same pattern as StudentPortal)
3. Extract the numeric grade level from the student's `level` field (e.g., "Level 3" -> 3)
4. Auto-set the grade filter and hide the dropdown

### 2. Grade Level Parsing

Student levels come in various formats:
- "Level 3" -> Grade 3
- "Kinder 1" / "Kinder 2" -> May not have matching books (handled gracefully)
- "Grade 1" -> Grade 1

A utility function will parse these strings to extract the numeric grade:
- Extract number from "Level X" format
- Handle "Kinder" as special case (no books or Grade 0)
- Fall back to showing all books if parsing fails

### 3. UI Changes for Students

| Element | Admin/Registrar | Student |
|---------|-----------------|---------|
| Grade filter dropdown | Visible | Hidden |
| "All Grades" option | Available | Not applicable |
| Books shown | All (or filtered) | Only their grade level |
| AI Search | Available | Available (auto-filtered to grade) |

### File Modified

`src/components/library/LibraryPage.tsx`:
- Add query to fetch student data when role is "student"
- Add utility function to parse level string to grade number
- Auto-set `selectedGrade` based on student level
- Conditionally hide the grade filter dropdown for students
- Update the empty state message for students

## Technical Details

```text
Student Login Flow:
┌─────────────────┐
│ Student logs in │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ LibraryPage detects         │
│ role === 'student'          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Fetch student data via      │
│ user_credentials + students │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Parse level: "Level 3" -> 3 │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Filter books where          │
│ grade_level === 3           │
│ (auto-applied, no dropdown) │
└─────────────────────────────┘
```

## Edge Cases

- **Kinder students**: Will see a friendly "no books for your level" message
- **Invalid level format**: Falls back to showing all books with a warning
- **Missing student record**: Falls back to showing all books

## Both Schools Covered

The filtering works for both MABDC and STFXSA since:
- The school filter is already applied via `selectedSchool` from SchoolContext
- Student grade filtering is an additional layer on top
- Books with `school = null` (shared) are still shown if they match the grade
