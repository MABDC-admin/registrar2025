

# LIS (Learner Information System) Page

## Overview
A new dedicated page/tab called **LIS** that serves as a comprehensive, cross-school, cross-academic-year student records system. Unlike the current Students tab (which filters by selected school and academic year), LIS will search across **all schools and all academic years** to provide a unified view of any student's complete history.

## What It Does
- **Universal Search**: Search by student name, last name, or LRN across both schools (MABDC and STFXSA) and all academic years
- **Comprehensive Student Profile**: When a student is selected, display a rich, modern profile card showing:
  - Photo (with animated avatar)
  - Personal information (LRN, name, gender, birth date, contacts, addresses)
  - Academic history across all years (grade levels, schools attended)
  - Grades by academic year and subject (Q1-Q4, final grade)
  - Uploaded documents
  - Behavioral/incident records
- **Print and PDF Export**: Generate printable reports and export to PDF (SF1, SF9 Report Card, Annex 1)

## UI Design
The page will have two main sections:

1. **Search Panel** (top): A prominent search bar with real-time results displayed as student cards with avatar, name, LRN, school, and grade level badges
2. **Student Detail Panel** (below): When a student is selected, a tabbed card layout appears with:
   - **Overview Tab**: Photo, personal info, and summary stats in a gradient header card
   - **Academic History Tab**: Timeline of academic years with grades table per year
   - **Documents Tab**: Reuses the existing DocumentsManager component
   - **Achievements Tab**: Incidents/behavior records with category badges
   - **Export Actions**: Print button and PDF export dropdowns (SF1, SF9, Annex 1)

---

## Technical Details

### New Files
1. **`src/components/lis/LISPage.tsx`** -- Main LIS page component with search + detail view
2. **`src/components/lis/LISStudentSearch.tsx`** -- Cross-school search component (queries students without school/year filter)
3. **`src/components/lis/LISStudentDetail.tsx`** -- Comprehensive student detail view with tabs
4. **`src/components/lis/LISAcademicHistory.tsx`** -- Academic history timeline showing grades grouped by year
5. **`src/components/lis/LISStudentOverview.tsx`** -- Overview tab with personal info cards

### Modified Files
1. **`src/components/layout/DashboardLayout.tsx`** -- Add "LIS" nav item under Student Records group for admin and registrar roles; add icon mapping entries
2. **`src/pages/Index.tsx`** -- Add rendering block for `activeTab === 'lis'` that renders `<LISPage />`
3. **`src/components/icons/ThreeDIcons.tsx`** -- Add a LIS-specific 3D icon (or reuse existing StudentIcon3D)

### Data Fetching Strategy
- Search query hits the `students` table **without** school or academic_year_id filters, using `ilike` on `student_name` and `lrn`
- On student selection, fetch related data in parallel:
  - `student_grades` joined with `subjects` and `academic_years` (grouped by academic year)
  - `student_documents` for the documents tab
  - `student_incidents` for the achievements/behavior tab
  - `student_subjects` joined with `subjects` for enrolled subjects per year

### Navigation Integration
- Added to the sidebar under **Student Records** group for **admin** and **registrar** roles
- Tab ID: `lis`
- Label: "LIS"
- Accessible from the sidebar alongside Students, Enrollment, Import, and Attendance

### Export/Print
- Reuses existing `generateSF1`, `generateSF9`, `generateAnnex1` utility functions
- Print button triggers `window.print()` with print-friendly CSS
- All export buttons in the detail header

