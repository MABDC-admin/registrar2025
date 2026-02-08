

# Enhance Grades (Transmutation) Tab - DepEd Computation

## Problem
The Grades tab in the student detail panel has a Save button, but it's hidden because:
1. The container is fixed at `h-[500px]` while the TransmutationManager uses a side-by-side layout (`lg:flex-row`) that doesn't fit in the narrow detail panel
2. The right sidebar (containing Save, results, export) requires `lg` breakpoint width which the detail panel never reaches
3. Result: the Save button and computation results are pushed below the fold and clipped

## Solution

### 1. Restructure TransmutationManager Layout for Detail Panel
- Change from side-by-side (`flex-row`) to a **stacked vertical layout** that works in the narrow panel
- Move the Save button to a **sticky bottom bar** so it's always visible
- Stack the result summary card above the save bar instead of in a sidebar

### 2. Add Quarterly Summary Overview
- After selecting a subject, show a compact summary row displaying transmuted grades for all 4 quarters (Q1-Q4) and the computed Final Grade (average of 4 quarters per DepEd)
- Fetch existing saved grades from `raw_scores` table for each quarter
- Color-code each quarter grade using DepEd descriptors

### 3. Add DepEd Grade Descriptors
- Display the grade descriptor (Outstanding, Very Satisfactory, Satisfactory, Fairly Satisfactory, Did Not Meet Expectations) next to the transmuted grade
- Use color coding from the existing `getGradeDescriptor` and `getGradeColorClass` utilities
- Show pass/fail indicator badge

### 4. Add General Average Section
- Below the per-subject entry, add a read-only "General Average" card
- Fetches all subject grades for the student in the current academic year
- Computes quarterly GAs and annual GA using existing utility functions
- Shows descriptors for each

### 5. Remove Fixed Height Constraint
- Change the grades tab container from `h-[500px]` to `flex-1 min-h-0` so it fills available space naturally within the ScrollArea

## Technical Details

### File: `src/components/students/TransmutationManager.tsx`
Changes:
- Remove the `lg:flex-row` layout; make everything stack vertically
- Move the Result Summary card inline (between QA section and save)
- Add a sticky bottom save bar with the Save button and export buttons
- Add a new "Quarterly Overview" section at the top that fetches and shows Q1-Q4 transmuted grades for the selected subject from `raw_scores`
- Add grade descriptor badge next to the transmuted grade display
- Add a "General Average" card at the bottom that queries `student_grades` for all subjects and computes GA using `computeQuarterlyGeneralAverage` and `computeAnnualGeneralAverage`
- Import and use `getGradeDescriptor`, `getGradeColorClass`, `isPassing` from gradeComputation utility

### File: `src/components/students/StudentDetailPanel.tsx`
Changes:
- Remove the `h-[500px]` wrapper around TransmutationManager (line 231)
- Let it flow naturally within the ScrollArea

### No new files needed
All computation utilities already exist in `src/utils/gradeComputation.ts`.

### No database changes needed
Uses existing `raw_scores` and `student_grades` tables.

