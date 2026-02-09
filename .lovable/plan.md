

# Add Clickable Learner Names with Profile Popup in Finance Learners Page

## Overview

Make learner names clickable in the Finance Learners table so clicking a name opens the existing `StudentProfileModal` with their complete profile (Personal Info, Academic History, Subjects, Documents, Anecdotal, Grades tabs).

## Changes

### File: `src/components/finance/FinanceLearnerPage.tsx`

**1. Fetch full student data** -- Update the students query `select` to fetch all fields (`*`) instead of only `id, student_name, lrn, gender, level, photo_url, school, school_id`. The `StudentProfileModal` requires a full `Student` object with fields like `birth_date`, `age`, `religion`, `mother_contact`, etc.

**2. Add state for selected student** -- Add `selectedStudent` state to track which learner was clicked, and a boolean `profileOpen` to control the modal.

**3. Make the name cell clickable** -- Wrap the student name `TableCell` content in a styled button/span with `text-primary underline-offset-2 hover:underline cursor-pointer` styling. On click, set the selected student and open the modal.

**4. Import and render `StudentProfileModal`** -- Import from `@/components/students/StudentProfileModal` and render it at the bottom of the component, passing the selected student and open/close handlers.

### Summary

- 1 file modified (`FinanceLearnerPage.tsx`)
- No database changes
- Reuses the existing `StudentProfileModal` component for a consistent experience

