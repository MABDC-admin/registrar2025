

# Show Full Academics Menu for Teachers and Registrars

## Current State

All three staff roles (Admin, Registrar, Teacher) already have an "Academics" collapsible menu in the sidebar. However, the **Teacher** role is missing two items compared to Admin/Registrar:

| Menu Item          | Admin | Registrar | Teacher |
|--------------------|-------|-----------|---------|
| Grades             | Yes   | Yes       | Yes     |
| Subjects           | Yes   | Yes       | **No**  |
| Subject Enrollment | Yes   | Yes       | **No**  |
| Schedules          | Yes   | Yes       | Yes     |
| Assignments        | Yes   | Yes       | Yes     |
| Exams              | Yes   | Yes       | Yes     |
| Attendance         | No*   | No*       | Yes     |

(*Attendance is under "Learner Records" for Admin/Registrar, but under "Academics" for Teacher)

## Proposed Change

Add **Subjects** and **Subject Enrollment** to the Teacher's Academics menu so it matches Admin/Registrar. This gives teachers visibility into the subjects catalog and enrollment data for their school.

### Updated Teacher Academics Menu

```text
Academics
  |-- Grades
  |-- Subjects           (NEW)
  |-- Subject Enrollment (NEW)
  |-- Attendance
  |-- Schedules
  |-- Assignments
  |-- Exams
```

### File to Edit

**`src/components/layout/DashboardLayout.tsx`** -- Add two items to the teacher's `academics` group (around line 376-382):
- `{ id: 'subjects', icon: SubjectsIcon3D, label: 'Subjects' }`
- `{ id: 'subject-enrollment', icon: EnrollmentIcon3D, label: 'Subject Enrollment' }`

This is a single, small edit with no database or backend changes required.

