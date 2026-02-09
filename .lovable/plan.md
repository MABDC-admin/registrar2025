

# Insert Mock Data for Rome Anthony (Level 10, MABDC)

## Overview

Populate mock grades (Q1-Q4 + final), class schedule, and assignments for **Dadula, Rome Anthony P.** (Level 10, MABDC) for SY 2025-2026. All data is temporary and deletable.

**Note:** Rome's database record uses `school_id: 22222222-...` and `academic_year_id: 74fb8614-...`. The mock data will match these existing foreign keys to avoid constraint violations.

## Data to Insert

### 1. Grades (8 subjects in `student_grades`)

| Subject | Q1 | Q2 | Q3 | Q4 | Final | Remarks |
|---------|-----|-----|-----|-----|-------|---------|
| Filipino | 88 | 90 | 87 | 91 | 89 | Passed |
| English | 92 | 94 | 91 | 93 | 93 | Passed |
| Math | 85 | 83 | 86 | 88 | 86 | Passed |
| Science | 90 | 88 | 89 | 91 | 90 | Passed |
| AP | 87 | 89 | 86 | 90 | 88 | Passed |
| ESP | 93 | 95 | 92 | 94 | 94 | Passed |
| TLE | 91 | 90 | 92 | 93 | 92 | Passed |
| MAPEH | 94 | 92 | 95 | 93 | 94 | Passed |

General Average: ~90.75. Status: `finalized`.

### 2. Class Schedule (30 slots in `class_schedules`)

Weekly schedule for Level 10, MABDC:

| Time | Mon (1) | Tue (2) | Wed (3) | Thu (4) | Fri (5) |
|------|---------|---------|---------|---------|---------|
| 7:30-8:30 | Filipino | English | Filipino | English | Math |
| 8:30-9:30 | Math | Science | Math | Science | Filipino |
| 9:45-10:45 | Science | AP | English | AP | English |
| 10:45-11:45 | ESP | TLE | ESP | TLE | Science |
| 1:00-2:00 | MAPEH | MAPEH | TLE | MAPEH | AP |
| 2:00-3:00 | AP | Filipino | MAPEH | Filipino | ESP |

### 3. Assignments (8 tasks in `student_assignments`)

| Subject | Title | Type | Due Date | Max Score |
|---------|-------|------|----------|-----------|
| Math | Quadratic Equations Problem Set | homework | 2026-02-15 | 50 |
| English | Book Report: Noli Me Tangere | project | 2026-02-20 | 100 |
| Science | Lab Report: Chemical Reactions | lab | 2026-02-12 | 40 |
| Filipino | Sanaysay: Kulturang Pilipino | essay | 2026-02-18 | 30 |
| AP | Timeline: Philippine Revolution | project | 2026-02-25 | 80 |
| TLE | Business Plan Draft | project | 2026-03-01 | 100 |
| ESP | Reflection Paper: Values | essay | 2026-02-10 | 25 |
| MAPEH | Fitness Assessment Log | activity | 2026-02-14 | 50 |

## Technical Details

Key IDs:
- **Student**: `908f2650-34b7-4b2d-a71e-a85e85dcb32a`
- **School ID**: `22222222-2222-2222-2222-222222222222` (matches Rome's record)
- **Academic Year**: `74fb8614-8b9d-49d8-ac4a-7f4c74df201e`
- **Teacher** (for schedule): `1f5b986d-6450-4247-86dd-4adaac3d68c5`

Subject IDs (Level 10):
- Filipino: `e3aaadba-cc35-4e4c-8746-1877c67080f0`
- English: `71742969-13da-41fc-bda1-4896553b49cf`
- Math: `b0d09bf3-a582-4218-b5d4-5be3bc3c9124`
- Science: `083f20fe-1a26-419f-b72a-3fb7e3f26f8c`
- AP: `ea523df1-eb18-4366-877b-9c4161f5ef8e`
- ESP: `88a1ab80-adf9-483b-ac63-0dfb55339a81`
- TLE: `4047ac0a-ed7e-4289-83fa-3bbfb1512e97`
- MAPEH: `bad0a9e8-deac-42d5-817b-bcbf083daacb`

### Execution

Three batch database inserts (no code changes needed):
1. **8 rows** into `student_grades` with status `finalized`
2. **30 rows** into `class_schedules` for Level 10
3. **8 rows** into `student_assignments` for Level 10

