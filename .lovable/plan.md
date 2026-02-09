
# Seed Sample Data for Nopal (STFXSA - Grade 5)

## Target Student
- **Name:** Nopal, Juliana Kiona Anonuevo
- **ID:** `ee562fa6-1795-4105-b8ef-bd637ca06de5`
- **School:** STFXSA (`22222222-2222-2222-2222-222222222222`)
- **Academic Year:** 2025-2026 (`74fb8614-8b9d-49d8-ac4a-7f4c74df201e`)
- **Grade Level:** Grade 5

## Data to Seed

### 1. Grades (`student_grades`)
Insert quarterly grades for all 8 Grade 5 subjects (Filipino, English, Math, Science, EPP, AP, MAPEH, GMRC) with Q1 and Q2 grades filled in (simulating mid-year progress).

| Subject | Q1 | Q2 | Q3 | Q4 |
|---------|-----|-----|-----|-----|
| Filipino | 88 | 90 | - | - |
| English | 92 | 89 | - | - |
| Math | 85 | 87 | - | - |
| Science | 90 | 91 | - | - |
| EPP | 93 | 94 | - | - |
| AP | 87 | 85 | - | - |
| MAPEH | 95 | 93 | - | - |
| GMRC | 96 | 97 | - | - |

### 2. Attendance (`student_attendance`)
Insert ~20 attendance records for January-February 2026 with a realistic mix:
- 16 present, 2 late, 1 absent, 1 excused

### 3. Assignments (`student_assignments` + `assignment_submissions`)
Create 4 assignments for Grade 5 at STFXSA, then create submissions for Nopal:
- Math Worksheet (submitted, scored 45/50)
- Science Lab Report (submitted, scored 38/40)
- English Essay (pending, due in future)
- Filipino Reading Task (overdue, not submitted)

### 4. Exam Schedules (`exam_schedules`)
Create 4 upcoming exam entries for Grade 5 Q2 at STFXSA:
- Math Quarterly Exam (Feb 20)
- Science Quarterly Exam (Feb 21)
- English Quarterly Exam (Feb 24)
- Filipino Quarterly Exam (Feb 25)

## Technical Details

All data will be inserted via a single database migration with multiple INSERT statements. Key IDs:

- **Student ID:** `ee562fa6-1795-4105-b8ef-bd637ca06de5`
- **School ID:** `22222222-2222-2222-2222-222222222222`
- **Academic Year ID:** `74fb8614-8b9d-49d8-ac4a-7f4c74df201e`
- **Subject IDs:** 8 subjects matching Grade 5 curriculum

The migration will use `ON CONFLICT` clauses where possible to avoid duplicate errors if re-run.

### Files Modified
- Database migration only (no code file changes)
