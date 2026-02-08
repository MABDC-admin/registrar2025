

# Revert Grades Tab Layout - Keep Only Save Button

## Problem
The Grades tab was enhanced with extra sections (Quarterly Overview, General Average, Grade Descriptors, DepEd info tip) that the user doesn't want. They want the original clean layout restored with only the Save button made visible.

## Changes

### File: `src/components/students/TransmutationManager.tsx`

**Remove these sections:**
- Quarterly Overview grid (lines 407-438) -- the Q1-Q4 boxes with Final grade
- General Average card (lines 580-619) -- the GA computation section  
- Grade Descriptor badges (lines 568-577) -- the PASS/FAIL + descriptor below result
- DepEd info tip (lines 621-627) -- the blue info box
- GradeCell component (lines 358-366) -- no longer needed

**Remove unused state and effects:**
- `quarterlyGrades` state and its fetch effect (lines 60, 80-101)
- `allSubjectGrades` state and its fetch effect (lines 63, 103-117)
- `finalGrade` memo (lines 180-185)
- `generalAverages` memo (lines 188-197)

**Remove unused imports:**
- `TrendingUp`, `Award` from lucide
- `getGradeDescriptor`, `getGradeColorClass`, `isPassing`, `computeQuarterlyGeneralAverage`, `computeAnnualGeneralAverage`, `GradeRecord` from gradeComputation

**Keep as-is:**
- Subject/Quarter selector header
- WW, PT, QA score input sections
- Result Summary card (WW/PT/QA weighted scores + Initial/Transmuted grade)
- Sticky Save bar at bottom with PDF/CSV export buttons

The result is the original score-entry flow with the Save button always visible at the bottom.

